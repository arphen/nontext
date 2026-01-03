import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS,
  advanceCursor,
  backspace,
  createGrid,
  getActiveWordCells,
  moveCursor,
  setCellChar,
  setCursorPos,
  toggleDirection,
  withNumbers,
} from './gridEngine';

describe('gridEngine', () => {
  it('creates a sized grid', () => {
    const grid = createGrid({ size: 3 });
    expect(grid).toHaveLength(3);
    expect(grid[0]).toHaveLength(3);
    expect(grid[0][0].char).toBe('');
  });

  it('toggleDirection flips across/down', () => {
    expect(toggleDirection(DIRECTIONS.ACROSS)).toBe(DIRECTIONS.DOWN);
    expect(toggleDirection(DIRECTIONS.DOWN)).toBe(DIRECTIONS.ACROSS);
  });

  it('moveCursor clamps to bounds', () => {
    const grid = createGrid({ size: 3 });
    const cursor = { r: 0, c: 0, dir: DIRECTIONS.ACROSS };

    expect(moveCursor(grid, cursor, -1, -1)).toMatchObject({ r: 0, c: 0 });
    expect(moveCursor(grid, cursor, 100, 100)).toMatchObject({ r: 2, c: 2 });
  });

  it('setCursorPos toggles direction on same cell', () => {
    const grid = createGrid({ size: 3 });
    const cursor = { r: 1, c: 1, dir: DIRECTIONS.ACROSS };
    const next = setCursorPos(grid, cursor, 1, 1);
    expect(next.dir).toBe(DIRECTIONS.DOWN);
  });

  it('setCellChar uppercases and truncates', () => {
    const grid = createGrid({ size: 3 });
    const cursor = { r: 0, c: 0, dir: DIRECTIONS.ACROSS };
    const next = setCellChar(grid, cursor, 'ab');
    expect(next[0][0].char).toBe('A');
  });

  it('advanceCursor steps based on direction', () => {
    const grid = createGrid({ size: 3 });
    const cursorAcross = { r: 0, c: 0, dir: DIRECTIONS.ACROSS };
    const cursorDown = { r: 0, c: 0, dir: DIRECTIONS.DOWN };

    expect(advanceCursor(grid, cursorAcross)).toMatchObject({ r: 0, c: 1 });
    expect(advanceCursor(grid, cursorDown)).toMatchObject({ r: 1, c: 0 });
  });

  it('backspace clears current if filled, else moves back', () => {
    let grid = createGrid({ size: 3 });
    let cursor = { r: 0, c: 1, dir: DIRECTIONS.ACROSS };

    grid = setCellChar(grid, cursor, 'Z');
    const cleared = backspace(grid, cursor);
    expect(cleared.grid[0][1].char).toBe('');
    expect(cleared.cursor).toEqual(cursor);

    const moved = backspace(cleared.grid, cursor);
    expect(moved.cursor.c).toBe(0);
  });

  it('getActiveWordCells returns contiguous cells until black', () => {
    const blackCells = new Set(['0,2']);
    const grid = createGrid({ size: 4, blackCells });
    const cursor = { r: 0, c: 1, dir: DIRECTIONS.ACROSS };

    expect(getActiveWordCells(grid, cursor)).toEqual([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
    ]);
  });

  it('withNumbers assigns clue numbers to starts', () => {
    // A 3x3 with center black means corners start entries.
    const blackCells = new Set(['1,1']);
    const grid = withNumbers(createGrid({ size: 3, blackCells }));

    // (0,0) starts across and down
    expect(grid[0][0].number).toBe(1);
    // (0,1) starts down because above edge and below black? below is black at (1,1) so NO down
    // and left not black so NO across start
    expect(grid[0][1].number).toBe(null);
  });
});
