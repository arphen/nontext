export const DIRECTIONS = {
  ACROSS: 'across',
  DOWN: 'down',
};

export function createGrid({ size = 15, blackCells = new Set() } = {}) {
  const grid = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => ({
      char: '',
      isBlack: blackCells.has(`${r},${c}`),
      number: null,
    }))
  );

  return withNumbers(grid);
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function toggleDirection(dir) {
  return dir === DIRECTIONS.ACROSS ? DIRECTIONS.DOWN : DIRECTIONS.ACROSS;
}

export function isInBounds(grid, r, c) {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length;
}

export function moveCursor(grid, cursor, dr, dc) {
  const height = grid.length;
  const width = grid[0].length;

  let r = clamp(cursor.r + dr, 0, height - 1);
  let c = clamp(cursor.c + dc, 0, width - 1);

  // If we land on a black cell, keep stepping in same direction (limited)
  for (let i = 0; i < Math.max(height, width); i++) {
    if (!grid[r][c].isBlack) break;
    const nextR = clamp(r + dr, 0, height - 1);
    const nextC = clamp(c + dc, 0, width - 1);
    if (nextR === r && nextC === c) break;
    r = nextR;
    c = nextC;
  }

  return { ...cursor, r, c };
}

export function setCursorPos(grid, cursor, r, c) {
  if (!isInBounds(grid, r, c)) return cursor;
  if (grid[r][c].isBlack) return cursor;

  // Clicking same cell toggles direction
  if (cursor.r === r && cursor.c === c) {
    return { ...cursor, dir: toggleDirection(cursor.dir) };
  }

  return { ...cursor, r, c };
}

export function setCellChar(grid, cursor, char) {
  const next = cloneGrid(grid);
  const cell = next[cursor.r][cursor.c];
  if (cell.isBlack) return grid;
  cell.char = (char || '').slice(0, 1).toUpperCase();
  return next;
}

export function backspace(grid, cursor) {
  const cell = grid[cursor.r][cursor.c];
  if (cell.isBlack) return { grid, cursor };

  // If current has a char, clear and stay
  if (cell.char) {
    const nextGrid = setCellChar(grid, cursor, '');
    return { grid: nextGrid, cursor };
  }

  // Else move back and clear previous
  const step = cursor.dir === DIRECTIONS.ACROSS ? { dr: 0, dc: -1 } : { dr: -1, dc: 0 };
  const prevCursor = moveCursor(grid, cursor, step.dr, step.dc);
  const nextGrid = setCellChar(grid, prevCursor, '');
  return { grid: nextGrid, cursor: prevCursor };
}

export function advanceCursor(grid, cursor) {
  const step = cursor.dir === DIRECTIONS.ACROSS ? { dr: 0, dc: 1 } : { dr: 1, dc: 0 };
  return moveCursor(grid, cursor, step.dr, step.dc);
}

export function getActiveWordCells(grid, cursor) {
  const height = grid.length;
  const width = grid[0].length;
  const { r, c, dir } = cursor;

  if (!isInBounds(grid, r, c) || grid[r][c].isBlack) return [];

  const cells = [];

  if (dir === DIRECTIONS.ACROSS) {
    let startC = c;
    while (startC > 0 && !grid[r][startC - 1].isBlack) startC--;
    for (let cc = startC; cc < width && !grid[r][cc].isBlack; cc++) {
      cells.push({ r, c: cc });
    }
  } else {
    let startR = r;
    while (startR > 0 && !grid[startR - 1][c].isBlack) startR--;
    for (let rr = startR; rr < height && !grid[rr][c].isBlack; rr++) {
      cells.push({ r: rr, c });
    }
  }

  return cells;
}

export function withNumbers(grid) {
  // Standard crossword numbering: number a non-black cell if it starts an across and/or down entry.
  const next = cloneGrid(grid);
  const height = next.length;
  const width = next[0].length;

  let num = 1;
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell = next[r][c];
      if (cell.isBlack) {
        cell.number = null;
        continue;
      }

      const leftBlackOrEdge = c === 0 || next[r][c - 1].isBlack;
      const upBlackOrEdge = r === 0 || next[r - 1][c].isBlack;
      const hasAcross = leftBlackOrEdge && c + 1 < width && !next[r][c + 1].isBlack;
      const hasDown = upBlackOrEdge && r + 1 < height && !next[r + 1][c].isBlack;

      if (hasAcross || hasDown) {
        cell.number = num;
        num++;
      } else {
        cell.number = null;
      }
    }
  }

  return next;
}
