from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rdkit import Chem
from rdkit.Chem import Draw, AllChem
from PIL import Image
import io
import base64
import logging
import json
import os
# Import DECIMER directly - app will fail if not available
from DECIMER import predict_SMILES

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/validate-smiles', methods=['POST'])
def validate_smiles():
    try:
        smiles = request.json.get('smiles')
        if not smiles:
            logger.warning("No SMILES provided in request")
            return jsonify({'error': 'No SMILES provided'}), 400

        logger.info(f"Validating SMILES: {smiles}")
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            logger.warning(f"Invalid SMILES string: {smiles}")
            return jsonify({'valid': False, 'error': 'Invalid SMILES'})

        # Generate InChI string
        inchi = Chem.MolToInchi(mol)
        logger.info(f"Generated InChI: {inchi}")
        
        # Ensure the SMILES is canonical
        canonical_smiles = Chem.MolToSmiles(mol, isomericSmiles=True)

        # Generate 2D structure image
        img = Draw.MolToImage(mol)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # Generate molfile for interactive editor
        molblock = Chem.MolToMolBlock(mol)

        logger.info("Successfully validated SMILES and generated structure data")
        return jsonify({
            'valid': True,
            'smiles': canonical_smiles,
            'inchi': inchi,
            'structure_image': f'data:image/png;base64,{img_str}',
            'molblock': molblock
        })

    except Exception as e:
        logger.error(f"Error in validate_smiles: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recognize-structure', methods=['POST'])
def recognize_structure():
    try:
        # Get base64 image from request
        image_data = request.json.get('image')
        if not image_data:
            logger.warning("No image provided in request")
            return jsonify({'error': 'No image provided'}), 400
            
        # Check if image is base64 and extract data
        if 'base64' in image_data:
            image_data = image_data.split('base64,')[1]
            
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(image_bytes))
        logger.info(f"Image decoded successfully: {img.size} pixels")
        
        # Create a temporary file for DECIMER
        import tempfile
        import os
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        temp_file_path = temp_file.name
        temp_file.close()
        
        # Save image to temporary file
        logger.info(f"Saving image to temporary file: {temp_file_path}")
        img.save(temp_file_path, format="PNG")
        
        try:
            # Predict SMILES from image file path using DECIMER
            logger.info("Starting SMILES prediction with DECIMER...")
            smiles = predict_SMILES(temp_file_path)
            logger.info(f"DECIMER predicted SMILES: {smiles}")
            
            # Generate structure image from predicted SMILES
            mol = Chem.MolFromSmiles(smiles)
            if mol is None:
                logger.warning(f"RDKit could not parse predicted SMILES: {smiles}")
                os.unlink(temp_file_path)  # Clean up temp file
                return jsonify({'error': 'Invalid predicted SMILES structure'}), 400
            
            # Ensure SMILES is canonical
            canonical_smiles = Chem.MolToSmiles(mol, isomericSmiles=True)
            
            # Generate InChI string
            inchi = Chem.MolToInchi(mol)
            logger.info(f"Generated InChI: {inchi}")
                
            # Generate 2D structure image
            structure_img = Draw.MolToImage(mol)
            buffered = io.BytesIO()
            structure_img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            # Generate molfile for interactive editor
            molblock = Chem.MolToMolBlock(mol)
            
            logger.info("Successfully generated structure data from SMILES")
            
            # Clean up
            os.unlink(temp_file_path)
            
            return jsonify({
                'smiles': canonical_smiles,
                'inchi': inchi,
                'structure_image': f'data:image/png;base64,{img_str}',
                'molblock': molblock
            })
        
        except Exception as e:
            # Clean up on error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
            
    except Exception as e:
        logger.error(f"Error in recognize_structure: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add endpoint to convert molfile to SMILES/InChI
@app.route('/api/molfile-to-structure', methods=['POST'])
def molfile_to_structure():
    try:
        molblock = request.json.get('molfile')
        if not molblock:
            logger.warning("No molfile provided in request")
            return jsonify({'error': 'No molfile provided'}), 400

        # Convert molfile to RDKit molecule
        mol = Chem.MolFromMolBlock(molblock)
        if mol is None:
            logger.warning("Invalid molfile structure")
            return jsonify({'error': 'Invalid molfile structure'}), 400
        
        # Generate SMILES and InChI
        smiles = Chem.MolToSmiles(mol, isomericSmiles=True)
        inchi = Chem.MolToInchi(mol)
        
        # Generate 2D structure image
        img = Draw.MolToImage(mol)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'smiles': smiles,
            'inchi': inchi,
            'structure_image': f'data:image/png;base64,{img_str}'
        })
        
    except Exception as e:
        logger.error(f"Error in molfile_to_structure: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try: 
        logger.info("Starting Chemical Service on port 5000...")
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        exit(1)