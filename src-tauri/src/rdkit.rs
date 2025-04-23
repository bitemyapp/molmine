use rdkit::{RWMol,ROMol};
use std::ffi::CString;
pub(crate) use crate::error::MolmineError;

pub struct Molecule {
    rw_mol: Option<RWMol>,
    ro_mol: Option<ROMol>,
}

impl Molecule {

    pub fn new() -> Self {
        Self {
            rw_mol: None,
            ro_mol: None,
        }
    }

}