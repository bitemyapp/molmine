#[cfg(test)]
mod test {
    #[test]
    fn test_rdkit() {
        let mol = rdkit::ROMol::from_smiles("CCO").unwrap();
        assert_eq!(mol.num_atoms(true), 3);
    }
}
