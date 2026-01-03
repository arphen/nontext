use std::collections::HashMap;

#[derive(Default, Debug, Clone)]
pub struct DawgNode {
    pub children: HashMap<char, usize>, // char -> index in nodes vector
    pub is_terminal: bool,
}

#[derive(Debug, Clone)]
pub struct Dawg {
    pub nodes: Vec<DawgNode>,
}

impl Dawg {
    pub fn new() -> Self {
        Dawg {
            nodes: vec![DawgNode::default()], // Root is at index 0
        }
    }

    pub fn insert(&mut self, word: &str) {
        let mut node_idx = 0;
        for c in word.chars() {
            let c = c.to_ascii_uppercase();
            if !self.nodes[node_idx].children.contains_key(&c) {
                let new_node_idx = self.nodes.len();
                self.nodes.push(DawgNode::default());
                self.nodes[node_idx].children.insert(c, new_node_idx);
            }
            node_idx = *self.nodes[node_idx].children.get(&c).unwrap();
        }
        self.nodes[node_idx].is_terminal = true;
    }

    pub fn is_word(&self, word: &str) -> bool {
        let mut node_idx = 0;
        for c in word.chars() {
            let c = c.to_ascii_uppercase();
            match self.nodes[node_idx].children.get(&c) {
                Some(&idx) => node_idx = idx,
                None => return false,
            }
        }
        self.nodes[node_idx].is_terminal
    }

    pub fn is_valid_prefix(&self, prefix: &str) -> bool {
        let mut node_idx = 0;
        for c in prefix.chars() {
            let c = c.to_ascii_uppercase();
            match self.nodes[node_idx].children.get(&c) {
                Some(&idx) => node_idx = idx,
                None => return false,
            }
        }
        true
    }
    
    // Returns the set of valid next characters for a given prefix
    // This is crucial for the domain intersection logic
    pub fn next_chars(&self, prefix: &str) -> Option<Vec<char>> {
        let mut node_idx = 0;
        for c in prefix.chars() {
            let c = c.to_ascii_uppercase();
            match self.nodes[node_idx].children.get(&c) {
                Some(&idx) => node_idx = idx,
                None => return None,
            }
        }
        Some(self.nodes[node_idx].children.keys().cloned().collect())
    }
}
