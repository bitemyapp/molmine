pub mod keys;
pub use keys::*;

pub use crate::db::{get_last_rowid, AsyncConn};
pub use crate::schema::*;
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

impl Compound {
    pub async fn get_by_id(
        compound_id: CompoundId,
        conn: &mut AsyncConn,
    ) -> Result<Compound, diesel::result::Error> {
        use crate::schema::compounds::dsl::*;
        compounds.find(compound_id).first(conn).await
    }

    pub async fn get_all(conn: &mut AsyncConn) -> Result<Vec<Compound>, diesel::result::Error> {
        use crate::schema::compounds::dsl::*;
        compounds.load::<Compound>(conn).await
    }

    pub async fn delete(compound_id: CompoundId, conn: &mut AsyncConn) -> Result<usize, diesel::result::Error> {
        use crate::schema::compounds::dsl::*;
        diesel::delete(compounds.find(compound_id)).execute(conn).await
    }

    pub async fn update(&self, conn: &mut AsyncConn) -> Result<Self, diesel::result::Error> {
        use crate::schema::compounds::dsl::*;
        diesel::update(compounds.find(self.id))
            .set((
                pdf_id.eq(self.pdf_id),
                smiles.eq(&self.smiles),
                inchi.eq(&self.inchi),
                image.eq(&self.image),
                chemical_data.eq(&self.chemical_data),
            ))
            .execute(conn)
            .await?;
        Self::get_by_id(self.id, conn).await
    }
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

impl NewCompound {
    // needs to check for valid pdf_id exists
    pub async fn insert(&self, conn: &mut AsyncConn) -> Result<Compound, diesel::result::Error> {
        use crate::schema::compounds::dsl::*;
        use crate::schema::pdfs::dsl::*;
        // check if pdf_id exists by queriying the pdfs table
        let pdf_exists = pdfs.find(self.pdf_id).first::<Pdf>(conn).await.is_ok();
        if !pdf_exists {
            return Err(diesel::result::Error::NotFound);
        }
        let compound = conn
            .transaction::<_, diesel::result::Error, _>(|conn| {
                Box::pin(async move {
                    diesel::insert_into(compounds)
                        .values(self)
                        .execute(conn)
                        .await?;
                    let compound_id = get_last_rowid(conn).await?;
                    Compound::get_by_id(CompoundId(compound_id), conn).await
                })
            })
            .await?;
        Ok(compound)
    }
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

    pub async fn get_all(conn: &mut AsyncConn) -> Result<Vec<Pdf>, diesel::result::Error> {
        use crate::schema::pdfs::dsl::*;
        pdfs.load::<Pdf>(conn).await
    }

    pub async fn delete(pdf_id: PdfId, conn: &mut AsyncConn) -> Result<usize, diesel::result::Error> {
        use crate::schema::pdfs::dsl::*;
        diesel::delete(pdfs.find(pdf_id)).execute(conn).await
    }

    pub async fn update(&self, conn: &mut AsyncConn) -> Result<Self, diesel::result::Error> {
        use crate::schema::pdfs::dsl::*;
        diesel::update(pdfs.find(self.id))
            .set((
                title.eq(&self.title),
                authors.eq(&self.authors),
                year.eq(self.year),
                journal.eq(&self.journal),
                volume.eq(&self.volume),
                data.eq(&self.data),
            ))
            .execute(conn)
            .await?;
        Self::get_by_id(self.id, conn).await
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

// Represents key-value data for a project
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

impl Project {
    // Helper method to parse JSON fields
    pub fn get_fields_json(&self) -> serde_json::Result<serde_json::Value> {
        serde_json::from_str(&self.fields)
    }
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

impl NewProject {
    // Create NewProject from JSON fields
    pub fn with_json_fields(
        name: String, 
        path: String, 
        created_at: NaiveDateTime, 
        fields: serde_json::Value
    ) -> Self {
        Self {
            name,
            path,
            created_at,
            fields: fields.to_string(),
        }
    }
}

// Association between compounds and PDFs
#[derive(Associations, Debug)]
#[diesel(belongs_to(Pdf))]
#[diesel(table_name = compounds)]
pub struct CompoundPdf {
    pub id: CompoundId,
    pub pdf_id: PdfId,
}
