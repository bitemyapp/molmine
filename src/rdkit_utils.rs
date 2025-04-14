use reqwest::Client;
use serde_json::Value;
use std::error::Error;

pub const HOST: &str = "localhost";
pub const PORT: &str = "5000";

// Validate smiles:
// method POST, expects json body with 'smiles' string, returns json
// with 'valid' boolean, 'smiles' string, 'inchi' string, 'structure_image' string, and molblock
pub async fn validate_smiles(smiles: String) -> Result<Value, Box<dyn Error>> {
    let client = Client::new();
    let response = client
        .post(format!("http://{}:{}/api/validate-smiles", HOST, PORT))
        .json(&serde_json::json!({ "smiles": smiles }))
        .send()
        .await?;
    if response.status().is_success() {
        let json_response: Value = response.json().await?;
        Ok(json_response)
    } else {
        Err(format!("Failed to validate SMILES: {}", response.status()).into())
    }
}

// Recognize structure:
// method POST, expects json body with 'image' string, returns json
// with 'smiles' string, 'inchi' string, 'structure_image' string, and molblock
pub async fn recognize_structure(image: String) -> Result<Value, Box<dyn Error>> {
    let client = Client::new();
    let response = client
        .post(format!("http://{}:{}/api/recognize-structure", HOST, PORT))
        .json(&serde_json::json!({ "image": image }))
        .send()
        .await?;
    if response.status().is_success() {
        let json_response: Value = response.json().await?;
        Ok(json_response)
    } else {
        Err(format!("Failed to recognize structure: {}", response.status()).into())
    }
}

// with 'smiles' string, 'inchi' string, 'structure_image' string, and molblock
pub async fn molfile_to_structure(molfile: String) -> Result<Value, Box<dyn Error>> {
    let client = Client::new();
    let response = client
        .post(format!("http://{}:{}/api/molfile-to-structure", HOST, PORT))
        .json(&serde_json::json!({ "molfile": molfile }))
        .send()
        .await?;
    if response.status().is_success() {
        let json_response: Value = response.json().await?;
        Ok(json_response)
    } else {
        Err(format!("Failed to convert molfile to structure: {}", response.status()).into())
    }
}