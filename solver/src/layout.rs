use crate::grid::Grid;
use rand::Rng;
use std::collections::VecDeque;

pub struct LayoutGenerator {
    width: usize,
    height: usize,
}

impl LayoutGenerator {
    pub fn new(width: usize, height: usize) -> Self {
        Self { width, height }
    }

    pub fn generate(&self) -> Grid {
        let mut rng = rand::thread_rng();
        
        // Try to generate a valid grid. If we get stuck, retry from scratch.
        loop {
            let mut grid = Grid::new(self.width, self.height);
            
            // Target black square density: ~16% (typical for open grids)
            let target_black_count = (self.width * self.height) as f64 * 0.16; 
            let mut current_black_count = 0;
            
            let mut attempts = 0;
            let max_attempts = 2000;

            while (current_black_count as f64) < target_black_count && attempts < max_attempts {
                attempts += 1;
                
                let r = rng.gen_range(0..self.height);
                let c = rng.gen_range(0..self.width);
                
                if grid.get_cell(r, c).is_black {
                    continue;
                }

                let sym_r = self.height - 1 - r;
                let sym_c = self.width - 1 - c;

                // Tentatively set black
                grid.set_black(r, c, true);
                grid.set_black(sym_r, sym_c, true);

                // Check constraints
                if self.is_valid_layout(&grid) {
                    // Keep it
                    current_black_count = grid.cells.iter().filter(|c| c.is_black).count();
                } else {
                    // Revert
                    grid.set_black(r, c, false);
                    grid.set_black(sym_r, sym_c, false);
                }
            }
            
            // Final check
            if self.is_valid_layout(&grid) {
                return grid;
            }
        }
    }

    fn is_valid_layout(&self, grid: &Grid) -> bool {
        // 1. Check connectivity
        if !self.check_connectivity(grid) {
            return false;
        }

        // 2. Check minimum word length (3)
        if !self.check_min_word_length(grid) {
            return false;
        }

        true
    }

    fn check_connectivity(&self, grid: &Grid) -> bool {
        let total_white = grid.cells.iter().filter(|c| !c.is_black).count();
        if total_white == 0 { return true; }

        // Find first white cell
        let start_node = match grid.cells.iter().position(|c| !c.is_black) {
            Some(idx) => idx,
            None => return true,
        };
        
        let (start_r, start_c) = (start_node / grid.width, start_node % grid.width);

        let mut visited = vec![false; grid.width * grid.height];
        let mut queue = VecDeque::new();
        queue.push_back((start_r, start_c));
        visited[start_node] = true;
        let mut count = 0;

        while let Some((r, c)) = queue.pop_front() {
            count += 1;

            // Neighbors
            let dr = [0, 0, 1, -1];
            let dc = [1, -1, 0, 0];

            for i in 0..4 {
                let nr = r as i32 + dr[i];
                let nc = c as i32 + dc[i];

                if nr >= 0 && nr < grid.height as i32 && nc >= 0 && nc < grid.width as i32 {
                    let nr = nr as usize;
                    let nc = nc as usize;
                    let idx = grid.get_index(nr, nc);
                    if !grid.cells[idx].is_black && !visited[idx] {
                        visited[idx] = true;
                        queue.push_back((nr, nc));
                    }
                }
            }
        }

        count == total_white
    }

    fn check_min_word_length(&self, grid: &Grid) -> bool {
        // Check rows
        for r in 0..grid.height {
            let mut len = 0;
            for c in 0..grid.width {
                if grid.get_cell(r, c).is_black {
                    if len > 0 && len < 3 { return false; }
                    len = 0;
                } else {
                    len += 1;
                }
            }
            if len > 0 && len < 3 { return false; }
        }

        // Check cols
        for c in 0..grid.width {
            let mut len = 0;
            for r in 0..grid.height {
                if grid.get_cell(r, c).is_black {
                    if len > 0 && len < 3 { return false; }
                    len = 0;
                } else {
                    len += 1;
                }
            }
            if len > 0 && len < 3 { return false; }
        }

        true
    }
}
