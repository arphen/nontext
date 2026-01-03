use crate::dawg::Dawg;
use crate::domain::Domain;
use crate::grid::Grid;
use std::collections::VecDeque;

#[derive(Clone, Debug)]
pub struct Slot {
    pub id: usize,
    pub r: usize,
    pub c: usize,
    pub length: usize,
    pub is_across: bool,
    pub cells: Vec<(usize, usize)>, // Coordinates of cells in this slot
}

pub struct Solver {
    grid: Grid,
    dawg: Dawg,
    slots: Vec<Slot>,
    // Map from (r, c) to list of slot indices that pass through this cell
    cell_to_slots: Vec<Vec<usize>>, 
}

impl Solver {
    pub fn new(grid: Grid, dawg: Dawg) -> Self {
        let (slots, cell_to_slots) = Self::identify_slots(&grid);
        Solver {
            grid,
            dawg,
            slots,
            cell_to_slots,
        }
    }

    fn identify_slots(grid: &Grid) -> (Vec<Slot>, Vec<Vec<usize>>) {
        let mut slots = Vec::new();
        let mut cell_to_slots = vec![vec![]; grid.width * grid.height];

        // Identify Across slots
        for r in 0..grid.height {
            let mut c = 0;
            while c < grid.width {
                if grid.get_cell(r, c).is_black {
                    c += 1;
                    continue;
                }
                let start = c;
                while c < grid.width && !grid.get_cell(r, c).is_black {
                    c += 1;
                }
                let length = c - start;
                if length > 1 {
                    let slot_id = slots.len();
                    let mut cells = Vec::new();
                    for i in 0..length {
                        let idx = grid.get_index(r, start + i);
                        cell_to_slots[idx].push(slot_id);
                        cells.push((r, start + i));
                    }
                    slots.push(Slot {
                        id: slot_id,
                        r,
                        c: start,
                        length,
                        is_across: true,
                        cells,
                    });
                }
            }
        }

        // Identify Down slots
        for c in 0..grid.width {
            let mut r = 0;
            while r < grid.height {
                if grid.get_cell(r, c).is_black {
                    r += 1;
                    continue;
                }
                let start = r;
                while r < grid.height && !grid.get_cell(r, c).is_black {
                    r += 1;
                }
                let length = r - start;
                if length > 1 {
                    let slot_id = slots.len();
                    let mut cells = Vec::new();
                    for i in 0..length {
                        let idx = grid.get_index(start + i, c);
                        cell_to_slots[idx].push(slot_id);
                        cells.push((start + i, c));
                    }
                    slots.push(Slot {
                        id: slot_id,
                        r: start,
                        c,
                        length,
                        is_across: false,
                        cells,
                    });
                }
            }
        }

        (slots, cell_to_slots)
    }

    // AC-3 Arc Consistency
    // Returns false if any domain becomes empty (inconsistency found)
    pub fn propagate(&mut self) -> bool {
        let mut queue: VecDeque<usize> = (0..self.slots.len()).collect();
        let mut in_queue = vec![true; self.slots.len()];

        while let Some(slot_idx) = queue.pop_front() {
            in_queue[slot_idx] = false;
            
            // Calculate valid letters for each cell in this slot based on the DAWG
            // and the CURRENT domains of the cells.
            if let Some(valid_masks) = self.compute_slot_valid_masks(slot_idx) {
                let slot = &self.slots[slot_idx];
                
                for (i, &(r, c)) in slot.cells.iter().enumerate() {
                    let cell_idx = self.grid.get_index(r, c);
                    let current_domain = self.grid.cells[cell_idx].domain;
                    let new_domain = current_domain.intersect(valid_masks[i]);

                    if new_domain != current_domain {
                        if new_domain.is_empty() {
                            return false; // Domain wiped out, invalid state
                        }
                        
                        // Update cell domain
                        self.grid.cells[cell_idx].domain = new_domain;

                        // Add all intersecting slots to queue
                        for &neighbor_slot_idx in &self.cell_to_slots[cell_idx] {
                            if neighbor_slot_idx != slot_idx && !in_queue[neighbor_slot_idx] {
                                queue.push_back(neighbor_slot_idx);
                                in_queue[neighbor_slot_idx] = true;
                            }
                        }
                    }
                }
            } else {
                return false; // No words fit this slot
            }
        }
        true
    }

    // Computes the bitmask of valid letters for each position in the slot
    // by traversing the DAWG with the current cell constraints.
    fn compute_slot_valid_masks(&self, slot_idx: usize) -> Option<Vec<Domain>> {
        let slot = &self.slots[slot_idx];
        let mut masks = vec![Domain::empty(); slot.length];
        
        // Recursive DFS on DAWG to find all matching words
        let found = self.find_valid_paths(
            0, 
            0, // Root of DAWG
            slot, 
            &mut masks
        );

        if !found {
            return None;
        }

        // If any position has an empty mask, then no valid word exists
        if masks.iter().any(|m| m.is_empty()) {
            None
        } else {
            Some(masks)
        }
    }

    fn find_valid_paths(
        &self, 
        pos: usize, 
        node_idx: usize, 
        slot: &Slot, 
        masks: &mut Vec<Domain>
    ) -> bool {
        // Base case: end of slot
        if pos == slot.length {
            return self.dawg.nodes[node_idx].is_terminal;
        }

        let (r, c) = slot.cells[pos];
        let cell_domain = self.grid.get_cell(r, c).domain;
        let node = &self.dawg.nodes[node_idx];
        
        let mut found_path = false;

        // Try all transitions that are valid in the current cell's domain
        for char_code in 0..26 {
            let char_char = (b'A' + char_code as u8) as char;
            
            if cell_domain.contains(char_char) {
                if let Some(&next_node_idx) = node.children.get(&char_char) {
                    // Recurse
                    if self.find_valid_paths(pos + 1, next_node_idx, slot, masks) {
                        found_path = true;
                        // Add this char to the valid mask for this position
                        masks[pos] = masks[pos].union(Domain::from_char(char_char));
                    }
                }
            }
        }
        
        found_path
    }

    pub fn solve(&mut self) -> Option<Grid> {
        // Initial propagation
        if !self.propagate() {
            return None;
        }

        self.backtrack()
    }

    fn backtrack(&mut self) -> Option<Grid> {
        // Check if solved
        if self.is_solved() {
            return Some(self.grid.clone());
        }

        // MRV Heuristic: Find cell with minimum remaining values (> 1)
        let mut min_count = 32;
        let mut best_cell_idx = None;

        for (i, cell) in self.grid.cells.iter().enumerate() {
            if cell.is_black { continue; }
            let count = cell.domain.count();
            if count == 0 { return None; } // Should be caught by propagate
            if count > 1 && count < min_count {
                min_count = count;
                best_cell_idx = Some(i);
                if count == 2 { break; } // Optimization: can't get better than 2
            }
        }

        let cell_idx = match best_cell_idx {
            Some(idx) => idx,
            None => return Some(self.grid.clone()), // All cells are singletons
        };

        // Try values
        let current_domain = self.grid.cells[cell_idx].domain;
        // Save state
        let saved_grid = self.grid.clone();

        for char_val in current_domain.iter() {
            // Assign value
            self.grid.cells[cell_idx].domain = Domain::from_char(char_val);
            
            // Propagate
            if self.propagate() {
                if let Some(solution) = self.backtrack() {
                    return Some(solution);
                }
            }

            // Restore state for next iteration
            self.grid = saved_grid.clone();
        }

        None
    }

    fn is_solved(&self) -> bool {
        self.grid.cells.iter().all(|c| c.is_black || c.domain.count() == 1)
    }
}
