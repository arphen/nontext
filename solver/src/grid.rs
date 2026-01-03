use crate::domain::Domain;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug)]
pub struct Cell {
    pub domain: Domain,
    pub is_black: bool,
    pub fixed_char: Option<char>, // If a cell is pre-filled or solved
}

impl Cell {
    pub fn new(is_black: bool) -> Self {
        Cell {
            domain: if is_black { Domain::empty() } else { Domain::full() },
            is_black,
            fixed_char: None,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Grid {
    pub width: usize,
    pub height: usize,
    pub cells: Vec<Cell>,
}

impl Grid {
    pub fn new(width: usize, height: usize) -> Self {
        let cells = vec![Cell::new(false); width * height];
        Grid { width, height, cells }
    }

    pub fn get_index(&self, r: usize, c: usize) -> usize {
        r * self.width + c
    }

    pub fn get_cell(&self, r: usize, c: usize) -> &Cell {
        &self.cells[self.get_index(r, c)]
    }

    pub fn get_cell_mut(&mut self, r: usize, c: usize) -> &mut Cell {
        let idx = self.get_index(r, c);
        &mut self.cells[idx]
    }

    pub fn set_black(&mut self, r: usize, c: usize, is_black: bool) {
        let cell = self.get_cell_mut(r, c);
        cell.is_black = is_black;
        cell.domain = if is_black { Domain::empty() } else { Domain::full() };
    }
}

// DTOs for JS communication
#[derive(Serialize, Deserialize)]
pub struct GridConfig {
    pub width: usize,
    pub height: usize,
    pub black_cells: Vec<(usize, usize)>,
    pub fixed_cells: Vec<(usize, usize, char)>,
}
