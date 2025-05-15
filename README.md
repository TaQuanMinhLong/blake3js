# blake3-js-example

A Node.js project that demonstrates how to use a WASI-compiled WebAssembly module (BLAKE3) to hash files, with automatic file watching and streaming support for both text and binary files.

## Features

- **WASI Integration:** Runs a BLAKE3 hashing function compiled to WASM with WASI support.
- **File Watching:** Uses a custom `FileWatcher` class to monitor files for changes and stream their content (supports both text and binary).
- **Streaming API:** Efficiently reads file changes using Node.js streams, emitting events for new content.
- **Automatic Cleanup:** Removes temporary files after processing.
- **Cross-platform:** Works on any system where Node.js and WASI are supported.

## Prerequisites

- Node.js v18+ (for WASI and ES modules support)
- Rust toolchain (for building the WASM module, if you want to rebuild)
- `wasm32-wasip1` target installed for Rust
- BLAKE3 dependency in your Rust project

## Getting Started

### 1. Build the WASM module

```bash
# Add WASI target
rustup target add wasm32-wasip1

# Build the WASM module
./build.sh
```

This will produce `blake3.wasm` in the `lib` directory.

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Usage

#### Hash a file and watch for changes

1. Place the file you want to hash in the project directory.
2. Run the main script:

```bash
node example.js
```

- The script will:
  - Launch the WASI-powered BLAKE3 hasher on your file.
  - Watch a temporary file for hash output.
  - Print the hash result to the console.
  - Clean up the temporary file after use.

### 5. Project Structure

```
.
├── lib/              # Core library files
│   ├── blake3.js     # Main library implementation
│   ├── blake3.wasm   # Compiled WASM module
│   └── file-watcher.js # File watching and streaming logic
├── src/              # Rust source code
├── index.js          # Example usage
├── build.sh          # Build script for WASM module
├── Cargo.toml        # Rust project config
├── package.json      # Node.js project config
└── README.md         # This file
```

## License

MIT
