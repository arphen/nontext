#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Domain(u32);

impl Domain {
    pub fn full() -> Self {
        // Bits 0-25 set (A-Z)
        Domain((1 << 26) - 1)
    }

    pub fn empty() -> Self {
        Domain(0)
    }

    pub fn from_char(c: char) -> Self {
        let c = c.to_ascii_uppercase();
        if c >= 'A' && c <= 'Z' {
            Domain(1 << (c as u8 - b'A'))
        } else {
            Domain::empty()
        }
    }

    pub fn contains(&self, c: char) -> bool {
        let c = c.to_ascii_uppercase();
        if c >= 'A' && c <= 'Z' {
            (self.0 & (1 << (c as u8 - b'A'))) != 0
        } else {
            false
        }
    }

    pub fn intersect(&self, other: Domain) -> Domain {
        Domain(self.0 & other.0)
    }

    pub fn union(&self, other: Domain) -> Domain {
        Domain(self.0 | other.0)
    }

    pub fn remove(&mut self, c: char) {
        let c = c.to_ascii_uppercase();
        if c >= 'A' && c <= 'Z' {
            self.0 &= !(1 << (c as u8 - b'A'));
        }
    }

    pub fn count(&self) -> u32 {
        self.0.count_ones()
    }

    pub fn is_empty(&self) -> bool {
        self.0 == 0
    }

    pub fn is_singleton(&self) -> Option<char> {
        if self.count() == 1 {
            let idx = self.0.trailing_zeros();
            Some((b'A' + idx as u8) as char)
        } else {
            None
        }
    }
    
    pub fn iter(&self) -> impl Iterator<Item = char> + '_ {
        (0..26).filter_map(move |i| {
            if (self.0 & (1 << i)) != 0 {
                Some((b'A' + i as u8) as char)
            } else {
                None
            }
        })
    }
}
