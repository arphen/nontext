import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGrid } from './useGrid';

describe('useGrid', () => {
  it('initializes', () => {
    const { result } = renderHook(() => useGrid({ size: 5 }));
    expect(result.current.grid).toHaveLength(5);
    expect(result.current.grid[0]).toHaveLength(5);
    expect(result.current.cursor).toMatchObject({ r: 0, c: 0, dir: 'across' });
  });

  it('sets a char and advances', () => {
    const { result } = renderHook(() => useGrid({ size: 5 }));

    act(() => {
      result.current.actions.setChar('a');
    });

    expect(result.current.grid[0][0].char).toBe('A');
    expect(result.current.cursor.c).toBe(1);
  });
});
