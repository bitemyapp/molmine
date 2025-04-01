use diesel::sql_types::Integer;
use diesel::sqlite::SqliteConnection;
use diesel::{Connection, ConnectionResult, QueryableByName};
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

const DATABASE_URL: &str = "sqlite://molmine.db";
pub async fn establish() -> Result<AsyncConn, MolmineError> {
    // Establish a synchronous connection to the database
    let conn = establish_async(DATABASE_URL).await?;
    Ok(conn)
}
pub async fn establish_test() -> Result<AsyncConn, MolmineError> {
    // Run all necessary migrations
    run_migrations(DATABASE_URL).await?;
    // Establish a synchronous connection to the database
    let conn = establish().await?;
    Ok(conn)
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

#[derive(QueryableByName)]
struct LastId {
    #[diesel(sql_type = Integer)]
    id: i32,
}

pub async fn get_last_rowid(conn: &mut AsyncConn) -> Result<i32, diesel::result::Error> {
    use diesel_async::RunQueryDsl;
    // Get the last inserted row ID
    let last_id = diesel::sql_query("SELECT last_insert_rowid() as id")
        .get_result::<LastId>(conn)
        .await?;
    Ok(last_id.id)
}
