import { FileWatcher } from "./file-watcher.js";
import { readFile } from "node:fs/promises";
import { WASI } from "node:wasi";
import path from "path";
import fs from "fs";

const __dirname = import.meta.dirname;
const WASM_MODULE = "blake3.wasm";
const WASI_ROOT = "/output";
const WASI_WORKDIR = "/input";
const ROOT = __dirname;
const WORKDIR = process.cwd();

const tmp = {
  createFileName: () => crypto.randomUUID(),
  filePath: (fileName) => path.join(ROOT, fileName),
  remove: (filePath) =>
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error removing temporary file:", err);
      }
    }),
};

const wasiConfig = {
  version: "preview1",
  wasmFile: path.join(ROOT, WASM_MODULE),
  preopens: { [WASI_ROOT]: ROOT, [WASI_WORKDIR]: WORKDIR },
  inputFilePath: (filePath) => path.join(WASI_WORKDIR, filePath),
  outputFilePath: (tmpFileName) => path.join(WASI_ROOT, tmpFileName),
};

/**
 * Hashes a file using the `BLAKE3` algorithm.
 * @param {string} filePath - The path relative to the current working directory or absolute path to the file.
 * @returns {Promise<string>} A promise that resolves to the hexadecimal representation of the hash.
 */
export async function hashFile(filePath) {
  const config = createConfig(filePath);
  const execute = createWatcher(config.tmpFilePath, createWasi(config));
  return execute();
}

function createConfig(filePath) {
  const tmpFileName = tmp.createFileName();
  const isAbsolute = path.isAbsolute(filePath);
  if (isAbsolute && !fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} does not exist`);
  }

  const workdir = isAbsolute ? path.dirname(filePath) : WORKDIR;
  if (!isAbsolute && !fs.existsSync(path.join(workdir, filePath))) {
    throw new Error(`File ${filePath} does not exist in ${workdir}`);
  }

  const preopens = isAbsolute
    ? { ...wasiConfig.preopens, [WASI_WORKDIR]: workdir }
    : wasiConfig.preopens;

  const wasiOutputFilePath = wasiConfig.outputFilePath(tmpFileName);
  const wasiInputFilePath = isAbsolute
    ? wasiConfig.inputFilePath(path.basename(filePath))
    : wasiConfig.inputFilePath(filePath);
  const tmpFilePath = tmp.filePath(tmpFileName);

  return {
    wasiOutputFilePath,
    wasiInputFilePath,
    tmpFilePath,
    preopens,
  };
}

function createWasi(config) {
  const { wasiOutputFilePath, wasiInputFilePath, preopens } = config;

  const wasi = new WASI({
    args: [wasiInputFilePath, wasiOutputFilePath],
    version: wasiConfig.version,
    preopens,
  });

  return async function () {
    const wasm = await WebAssembly.compile(await readFile(wasiConfig.wasmFile));
    const instance = await WebAssembly.instantiate(wasm, wasi.getImportObject());
    wasi.start(instance);
  };
}

/**
 * Creates a watcher listening for results from the WASI instance.
 * @param {string} tmpFilePath - The path to the temporary file that wasi writes the hash to
 * @param {() => Promise<void>} startWasi - The WASI instance.
 * @returns {() => Promise<string>}
 */
function createWatcher(tmpFilePath, startWasi) {
  const watcher = new FileWatcher(tmpFilePath);
  return function () {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    return new Promise(async (resolve, reject) => {
      watcher.on("change", (content) => {
        watcher.stop();
        resolve(content.toString("hex"));
      });

      watcher.on("error", (error) => {
        watcher.stop();
        reject(error);
      });

      watcher.start();
      await startWasi();
    });
  };
}
