import { hashFile } from "blake3-js";
import path from "node:path";

hashFile(path.resolve(import.meta.dirname, "Cargo.toml")).then(console.log);
