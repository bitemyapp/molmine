pub mod keys;
pub use keys::*;

use crate::schema::*;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

/// Represents a compound in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = compounds)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Compound {
    pub id: Option<CompoundId>,
    pub pdf_id: Option<PdfId>,
    pub smiles: Option<String>,
    pub inchi: Option<String>,
    pub image: Option<String>,
    pub chemical_data: Option<String>,
}

/// Used for inserting a new compound
#[derive(Insertable, Debug, Serialize, Deserialize)]
#[diesel(table_name = compounds)]
pub struct NewCompound {
    pub pdf_id: Option<PdfId>,
    pub smiles: Option<String>,
    pub inchi: Option<String>,
    pub image: Option<String>,
    pub chemical_data: Option<String>,
}

/// Represents a PDF document in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = pdfs)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Pdf {
    pub id: Option<PdfId>,
    pub title: Option<String>,
    pub authors: Option<String>,
    pub year: Option<i32>,
    pub journal: Option<String>,
    pub volume: Option<String>,
    pub data: Option<Vec<u8>>,
}

/// Used for inserting a new PDF
#[derive(Insertable, Debug)]
#[diesel(table_name = pdfs)]
pub struct NewPdf {
    pub title: Option<String>,
    pub authors: Option<String>,
    pub year: Option<i32>,
    pub journal: Option<String>,
    pub volume: Option<String>,
    pub data: Option<Vec<u8>>,
}

/// Represents key-value data for a project
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = project_data)]
#[diesel(primary_key(key))]
pub struct ProjectData {
    pub key: Option<String>,
    pub value: Option<String>,
}

/// Used for inserting new project data
#[derive(Insertable, Debug)]
#[diesel(table_name = project_data)]
pub struct NewProjectData {
    pub key: Option<String>,
    pub value: Option<String>,
}

/// Represents a project in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = projects)]
pub struct Project {
    pub id: Option<ProjectId>,
    pub name: String,
    pub path: String,
    pub created_at: Option<NaiveDateTime>,
    pub fields: String,
}

/// Used for inserting a new project
#[derive(Insertable, Debug)]
#[diesel(table_name = projects)]
pub struct NewProject {
    pub name: String,
    pub path: String,
    pub created_at: Option<NaiveDateTime>,
    pub fields: String,
}

// Association between compounds and PDFs
#[derive(Associations, Debug)]
#[diesel(belongs_to(Pdf))]
#[diesel(table_name = compounds)]
pub struct CompoundPdf {
    pub id: Option<CompoundId>,
    pub pdf_id: Option<PdfId>,
}
