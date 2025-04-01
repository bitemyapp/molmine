-- Your SQL goes here
PRAGMA foreign_keys = ON;

CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fields TEXT NOT NULL
);

CREATE TABLE project_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
);

CREATE TABLE pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    year INTEGER NOT NULL,
    journal TEXT NOT NULL,
    volume TEXT NOT NULL,
    data BLOB NOT NULL
);

CREATE TABLE compounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    pdf_id INTEGER NOT NULL,
    smiles TEXT NOT NULL,
    inchi TEXT NOT NULL,
    image TEXT NOT NULL,
    chemical_data TEXT NOT NULL,
    FOREIGN KEY(pdf_id) REFERENCES pdfs(id)
);
