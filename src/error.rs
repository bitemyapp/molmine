use thiserror::Error;

#[derive(Error, Debug)]
pub enum MolmineError {
    #[error("Error establishing database connection: {0}")]
    DieselConnectionError(#[from] diesel::ConnectionError),
    #[error("Error running database migrations: {0}")]
    DieselMigrationError(Box<dyn std::error::Error + Send + std::marker::Sync>),
    // #[error("Failed to parse the PDF file")]
    // PdfParseError(#[from] pdf::PdfError),
    // #[error("Failed to parse the PDF file")]
    // PdfiumError(#[from] pdfium_render::PdfiumError),
    // #[error("Failed to parse the PDF file")]
    // PdfiumRenderError(#[from] pdfium_render::PdfiumRenderError),
    // #[error("Failed to parse the PDF file")]
    // PdfiumPageError(#[from] pdfium_render::PdfiumPageError),
    // #[error("Failed to parse the PDF file")]
    // PdfiumBitmapError(#[from] pdfium_render::PdfiumBitmapError),
}
