use thiserror::Error;

#[derive(Error, Debug)]
pub enum MolmineError {
    #[error("Error establishing database connection: {0}")]
    DieselConnectionError(#[from] diesel::ConnectionError),
    #[error("Error running database migrations: {0}")]
    DieselMigrationError(Box<dyn std::error::Error + Send + std::marker::Sync>),
    #[error("Error connecting to flask server: {0}")]
    ReqwestError(#[from] reqwest::Error)
}
