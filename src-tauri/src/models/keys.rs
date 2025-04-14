use derive_more::From;
pub use diesel_derive_newtype::DieselNewType;
use serde::{Deserialize, Serialize};

#[derive(DieselNewType, Copy, Clone, Debug, From, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompoundId(pub i32);

#[derive(DieselNewType, Copy, Clone, Debug, From, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct PdfId(pub i32);

#[derive(DieselNewType, Copy, Clone, Debug, From, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProjectId(pub i32);
