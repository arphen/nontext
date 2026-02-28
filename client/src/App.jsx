import { useEffect, useMemo, useState } from 'react';
import init, { CrosswordSolver } from 'lacuna-solver';
import { ClueColumn } from './components/ClueColumn';
import { CrosswordGrid } from './components/CrosswordGrid';
import { DIRECTIONS } from './engine/gridEngine';
import { createPuzzleState } from './engine/puzzleEngine';
import { useGrid } from './hooks/useGrid';
import { samplePuzzle } from './puzzle/samplePuzzle';

function App() {
  const [solver, setSolver] = useState(null);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [dictionary, setDictionary] = useState([]);

  useEffect(() => {
    init().then(() => {
      setSolver(new CrosswordSolver());
    });

    fetch('/dictionary.json')
      .then(res => res.json())
      .then(data => setDictionary(data))
      .catch(err => console.error("Failed to load dictionary", err));
  }, []);

  const { grid, cursor, activeWordCells, actions } = useGrid(generatedConfig || { size: samplePuzzle.size, blackCells: samplePuzzle.blackCells });

  const handleGenerate = () => {
    if (!solver) return;
    const json = solver.generate_grid(15, 15);
    const config = JSON.parse(json);
    
    // Convert array of [r,c] to Set of "r,c" strings
    const blackCells = new Set(config.black_cells.map(([r, c]) => `${r},${c}`));
    const newConfig = { size: config.width, blackCells };
    setGeneratedConfig(newConfig);
    actions.reset(newConfig.size, newConfig.blackCells);
  };

  const handleSolve = () => {
    if (!solver || !generatedConfig || dictionary.length === 0) {
        console.log("Cannot solve: missing solver, config, or dictionary");
        return;
    }
    
    // Reconstruct GridConfig for Rust
    const black_cells = Array.from(generatedConfig.blackCells).map(s => {
        const [r, c] = s.split(',').map(Number);
        return [r, c];
    });
    
    // Collect fixed cells (letters already entered by user)
    const fixed_cells = [];
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (!cell.isBlack && cell.value) {
                fixed_cells.push([r, c, cell.value]);
            }
        });
    });

    const config = {
        width: generatedConfig.size,
        height: generatedConfig.size,
        black_cells,
        fixed_cells
    };
    
    const resultJson = solver.solve(JSON.stringify(config), dictionary);
    const result = JSON.parse(resultJson);
    
    if (result.status === 'success') {
        actions.setGridData(result.grid);
    } else {
        alert("Solver failed: " + result.message);
    }
  };

  // Use generated config if available, otherwise fallback to sample
  const gridConfig = generatedConfig || { size: samplePuzzle.size, blackCells: samplePuzzle.blackCells };

  // TODO: Re-generate puzzle state (clues) when grid changes. 
  // For now, we just use samplePuzzle's clues which won't match the new grid geometry, 
  // but it prevents the app from crashing.
  const puzzle = useMemo(() => createPuzzleState(samplePuzzle), []);
  
  // Keep a body-level hint for direction-based styling hooks.
  useEffect(() => {
    document.body.dataset.activeDirection = cursor.dir;
  }, [cursor.dir]);

  const activeEntryKey = useMemo(() => {
    const cellKey = `${cursor.r},${cursor.c}`;
    const mapped = puzzle.index.cellToEntries.get(cellKey);
    const key = cursor.dir === DIRECTIONS.ACROSS ? mapped?.acrossKey : mapped?.downKey;
    return key ?? null;
  }, [cursor.r, cursor.c, cursor.dir, puzzle.index.cellToEntries]);

  const handleKey = (e) => {
    if (e.defaultPrevented) return;

    const key = e.key;

    // Navigation
    if (key === 'ArrowLeft') {
      e.preventDefault();
      actions.move(0, -1);
      return;
    }
    if (key === 'ArrowRight') {
      e.preventDefault();
      actions.move(0, 1);
      return;
    }
    if (key === 'ArrowUp') {
      e.preventDefault();
      actions.move(-1, 0);
      return;
    }
    if (key === 'ArrowDown') {
      e.preventDefault();
      actions.move(1, 0);
      return;
    }

    // Editing
    if (key === 'Backspace') {
      e.preventDefault();
      actions.backspace();
      return;
    }

    // Direction toggle
    if (key === 'Tab') {
      e.preventDefault();
      actions.toggleDir();
      return;
    }

    // Letter input
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      e.preventDefault();
      actions.setChar(key);
    }
  };

  const handleCellClick = (r, c) => {
    if (cursor.r === r && cursor.c === c) {
      actions.toggleDir();
    } else {
      actions.setCursor(r, c);
    }
  };

  const handleEntryClick = (entry) => {
    actions.setCursor(entry.startR, entry.startC, entry.dir);
  };

  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-100 overflow-hidden flex flex-col">
      {/* Header / Status Bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center px-4 justify-between bg-neutral-900 z-50 relative">
        <h1 className="font-mono text-sm tracking-widest text-neutral-400">LACUNA // ENGINE</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleGenerate}
            disabled={!solver}
            className="px-4 py-2 text-xs font-bold bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            GENERATE
          </button>
          <button 
            onClick={handleSolve}
            disabled={!solver || !generatedConfig || dictionary.length === 0}
            className="px-4 py-2 text-xs font-bold bg-blue-900/80 border border-blue-700 hover:bg-blue-800 text-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            SOLVE
          </button>
          <button
            onClick={() => actions.toggleDir()}
            className="px-3 py-2 text-xs font-mono bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-400 rounded cursor-pointer min-w-[80px] text-center transition-colors"
          >
            DIR: <span className="text-neutral-200">{cursor.dir.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="flex-1 grid grid-cols-12 gap-0">
        
        {/* Left Column: Across Clues (3 cols) */}
        <aside className="col-span-3 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <ClueColumn
            label="ACROSS"
            entries={puzzle.entries.across}
            activeEntryKey={activeEntryKey}
            onEntryClick={handleEntryClick}
          />
        </aside>

        {/* Center Column: The Grid / Stage (6 cols) */}
        <section className="col-span-6 relative bg-black flex items-center justify-center">
          {/* 3D Background Placeholder */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 to-black pointer-events-none" />

          <div className="relative z-10 w-full h-full">
            <CrosswordGrid
              grid={grid}
              cursor={cursor}
              activeWordCells={activeWordCells}
              onCellClick={handleCellClick}
              onKey={handleKey}
            />
          </div>
        </section>

        {/* Right Column: Down Clues (3 cols) */}
        <aside className="col-span-3 border-l border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
          <ClueColumn
            label="DOWN"
            entries={puzzle.entries.down}
            activeEntryKey={activeEntryKey}
            onEntryClick={handleEntryClick}
          />
        </aside>

      </main>
    </div>
  )
}

export default App
