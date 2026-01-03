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
      return { ...state, cursor: setCursorPos(state.grid, state.cursor, action.r, action.c) };
    }
    case 'TOGGLE_DIR': {
      return { ...state, cursor: { ...state.cursor, dir: toggleDirection(state.cursor.dir) } };
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
      setCursor: (r, c) => dispatch({ type: 'SET_CURSOR', r, c }),
      toggleDir: () => dispatch({ type: 'TOGGLE_DIR' }),
    },
  };
}
