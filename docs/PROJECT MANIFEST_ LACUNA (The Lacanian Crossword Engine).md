PROJECT MANIFEST: LACUNA also known as NONTEXT
2. Technical Architecture: The "Pure Client" Ecosystem

To achieve the "Private Mirror" philosophy while delivering the biomimetic "Dream-State" interface, we employ a Hybrid Web-Native Stack. This architecture allows us to leverage high-performance web standards (WebGPU, WASM, CSS Grid) while deploying to mobile app stores via a native shell.
2.1 The Frontend: React + Capacitor (The Glass Prism)

    Framework: React 18+. Utilizing the modern Hooks ecosystem for managing the complex state of the Crossword Grid and the "Spinal Alignment" data-binding.

    Build Tool: Vite. Chosen for its lightning-fast HMR and seamless integration with Vitest.

    Runtime: Capacitor. Wraps the application in a system-native WebView (WKWebView/Chrome), allowing full access to hardware (Haptics, Filesystem) while rendering standard Web technologies.

    The "Dream-State" Rendering:

        Glassmorphism: Implemented via native CSS modules or Tailwind (backdrop-filter), avoiding the bridge overhead of native UI libraries.

        The Sand (R3F): The 3D volcanic background is rendered using React Three Fiber (R3F). This allows us to embed living 3D objects (drifting mica, shifting dunes) directly into the React component tree as high-performance WebGL layers.

    Testing: Vitest. Configured for unit testing the complex grid validation logic and React components in a Node-like environment with fast execution.

2.2 Client-Side Intelligence: WebLLM

    Model: Llama 3 8B (Quantized) running on WebLLM.

    Execution: Relies on WebGPU to run inference directly on the device's GPU.

    Role: The "Creative Director." It generates the "Soul" (thematic word lists) and interprets user sentiment. It does not solve the grid; it provides the ingredients for the solver.

2.3 The Backend: The Offline Factory (Python)

Since the solver and AI run locally, the Python Backend (FastAPI) is retired from the "Hot Path." It now serves as the Offline Factory.

    Role:

        Artifact Generation: Compresses the 100k-word Broda List into the binary DAWG format required by the Rust solver.

        Vector Sync: Handles the encrypted synchronization of the "Episteme Vector" for Paid "Ghost" users via a blind relay.

        Consent Auth: Manages the cryptographic tokens for the "Consent or Pay" wall.

4. Algorithms: The Industrial Solver
4.1 The Solver Engine: Rust-WASM

We reject "Wave Function Collapse" (WFC) for grid generation because it lacks the global lookahead required for a dense 15x15 crossword. Instead, we implement an Industrial Constraint Programming (CP) Engine written in Rust and compiled to WebAssembly (WASM).
A. The Architecture: Hybrid Intelligence

Grid generation is a two-step "Hand-off" process:

    The Soul (React/LLM): The React frontend collects ~50 high-value thematic words from the local LLM.

    The Crystal (Rust/WASM): These words are passed to the WASM worker, which acts as the "Crystallization Engine." It attempts to fit the Soul words first, then fills the gaps with "Skeleton" words (connective tissue) from the compressed dictionary.

B. The Data Structure: DAWG (Directed Acyclic Word Graph)

Standard dictionaries (Text/JSON) are too slow for the millions of lookups required per second.

    The Problem: A Trie repeats common suffixes (e.g., thousands of words end in -ING or -TION), bloating memory and cache usage.

    The Rust Solution: We compress the dictionary into a DAWG. This collapses identical sub-trees, reducing the entire 100k+ Broda list into a ~300KB binary blob that fits entirely inside the CPU's L1 Cache.

    Performance: is_valid_prefix() checks become nanosecond-level pointer traversals.

C. The Algorithm: Bitwise Backtracking with Arc Consistency

The solver does not guess randomly. It uses Bitwise Domains and Forward Checking.

    Bitmask Domains: Every cell in the grid is represented as a u32 integer. Bits 0-25 represent the letters A-Z.

        Intersection Logic: When "14-Across" intersects "3-Down," the valid domain for that cell is calculated via a single bitwise AND operation: Domain(Cell) = Mask(Across) & Mask(Down).

    Arc Consistency (AC-3): If placing the letter 'Z' in Cell (0,0) reduces the possibilities of any connected word to zero, the solver prunes that branch immediately. It never explores a dead end.

    Heuristic (MRV): Minimum Remaining Values. The solver always attacks the "Most Constrained" slot next (the word with the fewest possible legal options). This forces the grid to "fail fast" on impossible words, ensuring a valid solution is found in <200ms.

D. The Output

The WASM binary returns a lightweight JSON object containing the grid geometry and the final letter placement, which the React frontend then hydrates into the interactive "Glass" UI.