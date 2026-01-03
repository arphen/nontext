import { useCallback, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';

export function CrosswordGrid({ grid, cursor, activeWordCells, onCellClick, onKey }) {
  const containerRef = useRef(null);

  const activeSet = useMemo(() => {
    const set = new Set();
    for (const cell of activeWordCells) set.add(`${cell.r},${cell.c}`);
    return set;
  }, [activeWordCells]);

  const focusGrid = useCallback(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    // keep keyboard capture stable
    focusGrid();
  }, [focusGrid]);

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div
        ref={containerRef}
        tabIndex={0}
        role="application"
        aria-label="Crossword grid"
        className={clsx(
          'outline-none',
          'border border-neutral-800 bg-neutral-950/20 backdrop-blur-sm',
          'p-[2px]'
        )}
        onKeyDown={(e) => onKey(e)}
        onMouseDown={() => focusGrid()}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${grid.length}, 2.25rem)`,
          gap: '1px',
        }}
      >
        {grid.map((row, r) => (
          <div
            key={r}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${row.length}, 2.25rem)`,
              gap: '1px',
            }}
          >
            {row.map((cell, c) => {
              const isActive = cursor.r === r && cursor.c === c;
              const isInWord = activeSet.has(`${r},${c}`);

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={clsx(
                    'relative h-[2.25rem] w-[2.25rem] p-0',
                    'border border-neutral-800/70',
                    'flex items-center justify-center',
                    'font-mono text-[1.1rem] leading-none',
                    cell.isBlack
                      ? 'bg-neutral-950'
                      : 'bg-neutral-900/60 hover:bg-neutral-800/60',
                    isInWord && !cell.isBlack && 'bg-neutral-800/60',
                    isActive && !cell.isBlack && 'ring-2 ring-neutral-200/70'
                  )}
                  onClick={() => onCellClick(r, c)}
                  disabled={cell.isBlack}
                  aria-label={cell.isBlack ? `Black cell ${r}-${c}` : `Cell ${r}-${c}`}
                >
                  {!cell.isBlack && cell.number ? (
                    <span className="absolute left-[2px] top-[1px] text-[0.55rem] text-neutral-200/60">
                      {cell.number}
                    </span>
                  ) : null}
                  <span className="text-neutral-100/90">{cell.char}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
