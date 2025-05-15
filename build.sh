#!/bin/bash
OUTDIR=lib
OUT_FILE=blake3.wasm

cargo build --release --target wasm32-wasip1
cp target/wasm32-wasip1/release/$OUT_FILE $OUTDIR/$OUT_FILE
