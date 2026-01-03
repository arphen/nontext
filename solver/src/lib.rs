use wasm_bindgen::prelude::*;
use crate::grid::{Grid, GridConfig};
use crate::dawg::Dawg;
use crate::solver::Solver;

mod domain;
mod grid;
mod solver;
mod dawg;

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct CrosswordSolver {
}

#[wasm_bindgen]
impl CrosswordSolver {
    #[wasm_bindgen(constructor)]
    pub fn new() -> CrosswordSolver {
        init_panic_hook();
        CrosswordSolver {}
    }

    pub fn solve(&self, grid_json: String, words: Vec<String>) -> String {
        let config: GridConfig = match serde_json::from_str(&grid_json) {
            Ok(c) => c,
            Err(e) => return format!("{{ \"status\": \"error\", \"message\": \"Invalid JSON: {}\" }}", e),
        };

        let mut grid = Grid::new(config.width, config.height);
        for (r, c) in config.black_cells {
            grid.set_black(r, c, true);
        }
        // Handle fixed cells if any (pre-filled)
        for (r, c, char_val) in config.fixed_cells {
            let cell = grid.get_cell_mut(r, c);
            cell.domain = domain::Domain::from_char(char_val);
            cell.fixed_char = Some(char_val);
        }

        let mut dawg = Dawg::new();
        for word in words {
            dawg.insert(&word);
        }

        let mut solver = Solver::new(grid, dawg);
        
        match solver.solve() {
            Some(solution) => {
                // Convert solution to a simplified format for JS
                let mut output_grid = vec![vec![' '; solution.width]; solution.height];
                for r in 0..solution.height {
                    for c in 0..solution.width {
                        let cell = solution.get_cell(r, c);
                        if !cell.is_black {
                            if let Some(ch) = cell.domain.is_singleton() {
                                output_grid[r][c] = ch;
                            } else {
                                output_grid[r][c] = '?'; // Should not happen if solved
                            }
                        } else {
                            output_grid[r][c] = '#';
                        }
                    }
                }
                
                let json = serde_json::to_string(&output_grid).unwrap_or_default();
                format!("{{ \"status\": \"success\", \"grid\": {} }}", json)
            },
            None => {
                format!("{{ \"status\": \"failed\", \"message\": \"No solution found\" }}")
            }
        }
    }
}
