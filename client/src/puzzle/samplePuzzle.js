// Minimal local puzzle to exercise UI + engine.
// Coordinates are 0-indexed: r = row (y), c = col (x)

export const samplePuzzle = {
  size: 15,
  // Small pattern: a few black squares to create entries.
  blackCells: new Set([
    // a small cross near the center
    '7,7',
    '7,8',
    '8,7',
    // a couple blockers
    '3,3',
    '3,4',
    '4,3',
  ]),
  entries: [
    // Across
    { dir: 'across', startR: 2, startC: 2, clue: 'Local-only engine, first breath', answer: 'LACUNA' },
    { dir: 'across', startR: 6, startC: 4, clue: 'Not server, not cloud', answer: 'BROWSER' },

    // Down
    { dir: 'down', startR: 0, startC: 10, clue: 'A square of absence', answer: 'HOLE' },
    { dir: 'down', startR: 4, startC: 1, clue: 'Constraint propagator (abbr.)', answer: 'AC3' },
  ],
};
