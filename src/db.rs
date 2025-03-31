use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_async::AsyncConnection;
use diesel_async::sync_connection_wrapper::SyncConnectionWrapper;
use diesel_migrations::MigrationHarness;
use diesel_migrations::{EmbeddedMigrations, embed_migrations};

use crate::error::MolmineError;

pub type SyncConn = SqliteConnection;
pub type AsyncConn = SyncConnectionWrapper<SyncConn>;

pub fn establish_sync(db_url: &str) -> ConnectionResult<SyncConn> {
    // It is necessary to specify the specific inner connection type because of inference issues
    SyncConn::establish(db_url)
}

pub async fn establish_async(db_url: &str) -> ConnectionResult<AsyncConn> {
    // It is necessary to specify the specific inner connection type because of inference issues
    SyncConnectionWrapper::<SqliteConnection>::establish(db_url).await
}

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub async fn run_migrations(db_url: &str) -> Result<(), MolmineError> {
    let mut conn = establish_sync(db_url)?;
    // Run all necessary migrations
    let migrations = conn
        .run_pending_migrations(MIGRATIONS)
        .map_err(MolmineError::DieselMigrationError)?;
    eprintln!("Applied {:?} migrations", migrations);
    Ok(())
}
