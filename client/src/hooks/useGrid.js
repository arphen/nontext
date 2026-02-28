import { useMemo, useReducer } from 'react';
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
} from '../engine/gridEngine';

const DEFAULT_CURSOR = { r: 0, c: 0, dir: DIRECTIONS.ACROSS };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CHAR': {
      const grid = setCellChar(state.grid, state.cursor, action.char);
      const cursor = action.char ? advanceCursor(grid, state.cursor) : state.cursor;
      return { ...state, grid, cursor };
    }
    case 'BACKSPACE': {
      return { ...state, ...backspace(state.grid, state.cursor) };
    }
    case 'MOVE': {
      return { ...state, cursor: moveCursor(state.grid, state.cursor, action.dr, action.dc) };
    }
    case 'SET_CURSOR': {
      if (action.dir) {
        // Explicit direction set (e.g., clicking a clue in the sidebar)
        return { ...state, cursor: { ...state.cursor, r: action.r, c: action.c, dir: action.dir } };
      }

      // Implicit set (e.g., clicking a cell) preserves the classic behavior
      // where clicking the same cell toggles direction.
      return { ...state, cursor: setCursorPos(state.grid, state.cursor, action.r, action.c) };
    }
    case 'TOGGLE_DIR': {
      return { ...state, cursor: { ...state.cursor, dir: toggleDirection(state.cursor.dir) } };
    }
    case 'RESET': {
      return {
        grid: createGrid({ size: action.size, blackCells: action.blackCells }),
        cursor: DEFAULT_CURSOR,
      };
    }
    case 'SET_GRID_DATA': {
      // action.data is a 2D array of chars from the solver
      const newGrid = state.grid.map((row, r) => 
        row.map((cell, c) => {
          const char = action.data[r][c];
          // Solver returns '#' for black cells, and chars for letters.
          // Our grid model already knows where black cells are, but let's be safe.
          if (char === '#') return cell; 
          return { ...cell, value: char === ' ' ? '' : char };
        })
      );
      return { ...state, grid: newGrid };
    }
    default:
      return state;
  }
}

export function useGrid({ size = 15, blackCells } = {}) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    grid: createGrid({ size, blackCells }),
    cursor: DEFAULT_CURSOR,
  }));

  // Reset grid when config changes
  useMemo(() => {
     // We can't dispatch in useMemo. 
     // But we can use a key pattern in the parent, or useEffect here.
     // However, useMemo runs during render.
     // Let's use useEffect for the reset.
  }, [size, blackCells]);
  
  // Actually, the cleanest way to handle config changes in a hook like this 
  // without a key is to use useEffect to dispatch a reset.
  // But that causes a double render.
  // Better: The parent component should use a key on the component that calls this hook, 
  // or we accept that we need to dispatch reset.
  
  // Let's just expose the reset action and let the parent handle it, 
  // OR handle it here.
  
  // Since I'm editing this file, I'll add the actions.
  
  const activeWordCells = useMemo(
    () => getActiveWordCells(state.grid, state.cursor),
    [state.grid, state.cursor]
  );

  return {
    grid: state.grid,
    cursor: state.cursor,
    activeWordCells,
    actions: {
      setChar: (char) => dispatch({ type: 'SET_CHAR', char }),
      backspace: () => dispatch({ type: 'BACKSPACE' }),
      move: (dr, dc) => dispatch({ type: 'MOVE', dr, dc }),
      setCursor: (r, c, dir) => dispatch({ type: 'SET_CURSOR', r, c, dir }),
      toggleDir: () => dispatch({ type: 'TOGGLE_DIR' }),
      reset: (size, blackCells) => dispatch({ type: 'RESET', size, blackCells }),
      setGridData: (data) => dispatch({ type: 'SET_GRID_DATA', data }),
    },
  };
}
