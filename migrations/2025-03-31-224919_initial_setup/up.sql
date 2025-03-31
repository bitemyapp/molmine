-- Your SQL goes here
PRAGMA foreign_keys = ON;

CREATE TABLE projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fields TEXT NOT NULL
);

CREATE TABLE project_data (
      key TEXT PRIMARY KEY,
      value TEXT
);

CREATE TABLE pdfs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    authors TEXT,
    year INTEGER,
    journal TEXT,
    volume TEXT,
    data BLOB
);

CREATE TABLE compounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pdf_id INTEGER,
    smiles TEXT,
    inchi TEXT,
    image TEXT,
    chemical_data TEXT,
    FOREIGN KEY(pdf_id) REFERENCES pdfs(id)
);
-- INSERT INTO project_data (key, value) VALUES ('activeProject', '')