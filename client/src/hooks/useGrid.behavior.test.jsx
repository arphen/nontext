import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGrid } from './useGrid';
import { DIRECTIONS } from '../engine/gridEngine';

describe('useGrid Behavior (App Clone Verification)', () => {
  const createHook = (props = {}) => renderHook(() => useGrid({ size: 5, ...props }));

  describe('Navigation & Selection', () => {
    it('initializes at (0,0) Across', () => {
      const { result } = createHook();
      expect(result.current.cursor).toMatchObject({ r: 0, c: 0, dir: DIRECTIONS.ACROSS });
    });

    it('moves cursor with arrow keys (move action)', () => {
      const { result } = createHook();
      
      act(() => result.current.actions.move(0, 1)); // Right
      expect(result.current.cursor).toMatchObject({ r: 0, c: 1 });

      act(() => result.current.actions.move(1, 0)); // Down
      expect(result.current.cursor).toMatchObject({ r: 1, c: 1 });
    });

    it('skips black cells when moving', () => {
      // Black cell at (0,1)
      const blackCells = new Set(['0,1']);
      const { result } = createHook({ blackCells });

      // Start at (0,0), move right. Should skip (0,1) and land on (0,2)
      act(() => result.current.actions.move(0, 1));
      expect(result.current.cursor).toMatchObject({ r: 0, c: 2 });
    });

    it('toggles direction when clicking the active cell', () => {
      const { result } = createHook();
      
      // Initial: Across
      expect(result.current.cursor.dir).toBe(DIRECTIONS.ACROSS);

      // Click (0,0) again
      act(() => result.current.actions.setCursor(0, 0));
      expect(result.current.cursor.dir).toBe(DIRECTIONS.DOWN);

      // Click (0,0) again
      act(() => result.current.actions.setCursor(0, 0));
      expect(result.current.cursor.dir).toBe(DIRECTIONS.ACROSS);
    });

    it('moves to clicked cell without changing direction if different', () => {
      const { result } = createHook();
      
      // Click (1,1)
      act(() => result.current.actions.setCursor(1, 1));
      expect(result.current.cursor).toMatchObject({ r: 1, c: 1, dir: DIRECTIONS.ACROSS });
    });

    it('allows explicit direction setting (e.g. from clue list)', () => {
      const { result } = createHook();
      
      // Force set to (2,2) DOWN
      act(() => result.current.actions.setCursor(2, 2, DIRECTIONS.DOWN));
      expect(result.current.cursor).toMatchObject({ r: 2, c: 2, dir: DIRECTIONS.DOWN });
    });
  });

  describe('Typing & Input', () => {
    it('enters character and advances cursor', () => {
      const { result } = createHook();

      act(() => result.current.actions.setChar('H'));
      
      expect(result.current.grid[0][0].char).toBe('H');
      expect(result.current.cursor).toMatchObject({ r: 0, c: 1 }); // Advanced
    });

    it('skips black cells when typing (advancing)', () => {
      const blackCells = new Set(['0,1']);
      const { result } = createHook({ blackCells });

      act(() => result.current.actions.setChar('A'));
      
      expect(result.current.grid[0][0].char).toBe('A');
      expect(result.current.cursor).toMatchObject({ r: 0, c: 2 }); // Skipped (0,1)
    });

    it('overwrites existing character and advances', () => {
      const { result } = createHook();

      act(() => result.current.actions.setChar('A'));
      // Reset cursor to (0,0)
      act(() => result.current.actions.setCursor(0, 0));
      
      act(() => result.current.actions.setChar('B'));
      expect(result.current.grid[0][0].char).toBe('B');
      expect(result.current.cursor).toMatchObject({ r: 0, c: 1 });
    });
  });

  describe('Backspace Behavior', () => {
    it('clears current cell if filled and does NOT move', () => {
      const { result } = createHook();

      // Fill (0,0)
      act(() => result.current.actions.setChar('A'));
      // Cursor is now at (0,1). Move back to (0,0)
      act(() => result.current.actions.move(0, -1));
      
      expect(result.current.grid[0][0].char).toBe('A');
      expect(result.current.cursor).toMatchObject({ r: 0, c: 0 });

      // Backspace
      act(() => result.current.actions.backspace());
      
      expect(result.current.grid[0][0].char).toBe(''); // Cleared
      expect(result.current.cursor).toMatchObject({ r: 0, c: 0 }); // Stayed
    });

    it('moves back and clears previous cell if current is empty', () => {
      const { result } = createHook();

      // Fill (0,0), cursor moves to (0,1)
      act(() => result.current.actions.setChar('A'));
      expect(result.current.cursor).toMatchObject({ r: 0, c: 1 });
      expect(result.current.grid[0][1].char).toBe(''); // (0,1) is empty

      // Backspace from (0,1)
      act(() => result.current.actions.backspace());

      expect(result.current.cursor).toMatchObject({ r: 0, c: 0 }); // Moved back
      expect(result.current.grid[0][0].char).toBe(''); // Cleared previous
    });

    it('skips black cells when backspacing', () => {
      const blackCells = new Set(['0,1']);
      const { result } = createHook({ blackCells });

      // Fill (0,0), cursor skips (0,1) to (0,2)
      act(() => result.current.actions.setChar('A'));
      expect(result.current.cursor).toMatchObject({ r: 0, c: 2 });

      // Backspace from (0,2) (empty)
      act(() => result.current.actions.backspace());

      expect(result.current.cursor).toMatchObject({ r: 0, c: 0 }); // Skipped (0,1) back to (0,0)
      expect(result.current.grid[0][0].char).toBe(''); // Cleared (0,0)
    });
  });
});
