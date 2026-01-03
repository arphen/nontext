# Lacuna Solver (The Crystal)

This is the Rust-based Constraint Programming (CP) solver for the Lacuna crossword engine.
It compiles to WebAssembly (WASM) for use in the browser.

## Architecture

- **Bitmask Domains**: Cells use `u32` bitmasks for efficient domain operations.
- **AC-3 Propagation**: Enforces arc consistency by pruning domains based on dictionary constraints.
- **MRV Heuristic**: Backtracking search prioritizes the most constrained cells.
- **DAWG**: Dictionary is stored in a Directed Acyclic Word Graph (currently implemented as a Trie) for fast prefix lookups.

## Build Instructions

1. Install `wasm-pack`:
   ```bash
   cargo install wasm-pack
   ```

2. Build for web:
   ```bash
   wasm-pack build --target web
   ```

3. The output will be in `pkg/`, ready to be imported by the React client.
