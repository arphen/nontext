import { DIRECTIONS, createGrid, withNumbers, isInBounds } from './gridEngine';

export function entryKey(entry) {
  return `${entry.startR},${entry.startC},${entry.dir}`;
}

export function computeEntryCells(grid, entry) {
  const cells = [];
  for (let i = 0; i < entry.answer.length; i++) {
    const r = entry.dir === DIRECTIONS.ACROSS ? entry.startR : entry.startR + i;
    const c = entry.dir === DIRECTIONS.ACROSS ? entry.startC + i : entry.startC;
    if (!isInBounds(grid, r, c) || grid[r][c].isBlack) break;
    cells.push({ r, c, i });
  }
  return cells;
}

export function buildEntryIndex(grid, entries) {
  const byKey = new Map();
  const cellToEntries = new Map(); // "r,c" -> { acrossKey?, downKey? }

  for (const entry of entries) {
    const key = entryKey(entry);
    const number = grid[entry.startR][entry.startC]?.number ?? null;
    const cells = computeEntryCells(grid, entry);

    const normalized = {
      ...entry,
      number,
      key,
      cells,
    };

    byKey.set(key, normalized);

    for (const cell of cells) {
      const cellKey = `${cell.r},${cell.c}`;
      const prev = cellToEntries.get(cellKey) || {};
      if (entry.dir === DIRECTIONS.ACROSS) cellToEntries.set(cellKey, { ...prev, acrossKey: key });
      else cellToEntries.set(cellKey, { ...prev, downKey: key });
    }
  }

  return { byKey, cellToEntries };
}

export function createPuzzleState({ size, blackCells, entries }) {
  const grid = withNumbers(createGrid({ size, blackCells }));
  const index = buildEntryIndex(grid, entries);

  const across = entries
    .filter((e) => e.dir === DIRECTIONS.ACROSS)
    .map((e) => ({ ...e, number: grid[e.startR][e.startC]?.number ?? null, key: entryKey(e) }))
    .sort((a, b) => (a.number ?? 9999) - (b.number ?? 9999));

  const down = entries
    .filter((e) => e.dir === DIRECTIONS.DOWN)
    .map((e) => ({ ...e, number: grid[e.startR][e.startC]?.number ?? null, key: entryKey(e) }))
    .sort((a, b) => (a.number ?? 9999) - (b.number ?? 9999));

  return {
    grid,
    entries: { across, down },
    index,
  };
}
