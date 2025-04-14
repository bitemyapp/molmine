pub mod keys;
pub use keys::*;

use crate::db::{get_last_rowid, AsyncConn};
use crate::schema::*;
use chrono::NaiveDateTime;
use diesel::prelude::*;
use diesel_async::AsyncConnection;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};

/// Represents a compound in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = compounds)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Compound {
    pub id: CompoundId,
    pub pdf_id: PdfId,
    pub smiles: String,
    pub inchi: String,
    pub image: String,
    pub chemical_data: String,
}

/// Used for inserting a new compound
#[derive(Insertable, Debug, Serialize, Deserialize)]
#[diesel(table_name = compounds)]
pub struct NewCompound {
    pub pdf_id: PdfId,
    pub smiles: String,
    pub inchi: String,
    pub image: String,
    pub chemical_data: String,
}

/// Represents a PDF document in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = pdfs)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Pdf {
    pub id: PdfId,
    pub title: String,
    pub authors: String,
    pub year: i32,
    pub journal: String,
    pub volume: String,
    pub data: Vec<u8>,
}

impl Pdf {
    pub async fn get_by_id(
        pdf_id: PdfId,
        conn: &mut AsyncConn,
    ) -> Result<Pdf, diesel::result::Error> {
        use crate::schema::pdfs::dsl::*;
        pdfs.find(pdf_id).first(conn).await
    }
}

/// Used for inserting a new PDF
#[derive(Insertable, Debug)]
#[diesel(table_name = pdfs)]
pub struct NewPdf {
    pub title: String,
    pub authors: String,
    pub year: i32,
    pub journal: String,
    pub volume: String,
    pub data: Vec<u8>,
}

impl NewPdf {
    pub async fn insert(&self, conn: &mut AsyncConn) -> Result<Pdf, diesel::result::Error> {
        use crate::schema::pdfs::dsl::*;
        let pdf = conn
            .transaction::<_, diesel::result::Error, _>(|conn| {
                Box::pin(async move {
                    diesel::insert_into(pdfs).values(self).execute(conn).await?;
                    let pdf_id = get_last_rowid(conn).await?;
                    Pdf::get_by_id(PdfId(pdf_id), conn).await
                })
            })
            .await?;
        Ok(pdf)
    }
}

/// Represents key-value data for a project
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = project_data)]
#[diesel(primary_key(key))]
pub struct ProjectData {
    pub key: String,
    pub value: String,
}

/// Used for inserting new project data
#[derive(Insertable, Debug)]
#[diesel(table_name = project_data)]
pub struct NewProjectData {
    pub key: String,
    pub value: String,
}

/// Represents a project in the database
#[derive(Queryable, Selectable, Identifiable, Debug, Serialize, Deserialize)]
#[diesel(table_name = projects)]
pub struct Project {
    pub id: ProjectId,
    pub name: String,
    pub path: String,
    pub created_at: NaiveDateTime,
    pub fields: String,
}

/// Used for inserting a new project
#[derive(Insertable, Debug)]
#[diesel(table_name = projects)]
pub struct NewProject {
    pub name: String,
    pub path: String,
    pub created_at: NaiveDateTime,
    pub fields: String,
}

// Association between compounds and PDFs
#[derive(Associations, Debug)]
#[diesel(belongs_to(Pdf))]
#[diesel(table_name = compounds)]
pub struct CompoundPdf {
    pub id: CompoundId,
    pub pdf_id: PdfId,
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::db::establish_test;

    #[tokio::test]
    async fn test_insert_pdf() {
        let mut conn = establish_test().await.unwrap();
        let new_pdf = NewPdf {
            title: "Test PDF".to_string(),
            authors: "Author".to_string(),
            year: 2023,
            journal: "Journal".to_string(),
            volume: "1".to_string(),
            data: vec![1, 2, 3],
        };
        let pdf = new_pdf.insert(&mut conn).await.unwrap();
        assert_eq!(pdf.title, "Test PDF");
    }
}
