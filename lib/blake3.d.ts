declare module "blake3-js" {
  /**
   * Hashes a file using the `BLAKE3` algorithm.
   * @param {string} filePath - The path relative to the current working directory or absolute path to the file.
   * @returns {Promise<string>} A promise that resolves to the hexadecimal representation of the hash.
   */
  export function hashFile(filePath: string): Promise<string>;
}
