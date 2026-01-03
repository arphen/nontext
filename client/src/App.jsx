import { useEffect, useMemo } from 'react';
import { ClueColumn } from './components/ClueColumn';
import { CrosswordGrid } from './components/CrosswordGrid';
import { DIRECTIONS } from './engine/gridEngine';
import { createPuzzleState } from './engine/puzzleEngine';
import { useGrid } from './hooks/useGrid';
import { samplePuzzle } from './puzzle/samplePuzzle';

function App() {
  const puzzle = useMemo(() => createPuzzleState(samplePuzzle), []);
  const { grid, cursor, activeWordCells, actions } = useGrid({
    size: samplePuzzle.size,
    blackCells: samplePuzzle.blackCells,
  });

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
    actions.setCursor(r, c);
  };

  const handleEntryClick = (entry) => {
    actions.setCursor(entry.startR, entry.startC, entry.dir);
  };

  return (
    <div className="h-screen w-screen bg-neutral-900 text-neutral-100 overflow-hidden flex flex-col">
      {/* Header / Status Bar */}
      <header className="h-12 border-b border-neutral-800 flex items-center px-4 justify-between">
        <h1 className="font-mono text-sm tracking-widest text-neutral-400">LACUNA // ENGINE</h1>
        <div className="text-xs text-neutral-600">DIR: {cursor.dir.toUpperCase()}</div>
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
