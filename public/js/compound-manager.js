const RECOG_SERVER_PORT = 5000;

class CompoundManager {
    constructor() {
        this.compounds = [];
        this.currentPDFId = null;
        this.chemicalDataFields = [];
        this.paperTitles = {};
        this.compoundsTable = null;

        // Setup for main page (index.html) or compounds page (compounds.html)
        this.isCompoundsPage = window.location.pathname.includes('compounds.html');
        this.setupEventListeners();
        this.loadChemicalDataFields();

        // Initialize DataTable if on compounds page
        if (this.isCompoundsPage) {
            this.initializeCompoundsTable();
            this.loadPapers();
            this.loadAllCompounds();
        }
    }

    setupEventListeners() {
        // Common event listeners
        const saveCompoundBtn = document.getElementById('saveCompound');
        if (saveCompoundBtn) {
            saveCompoundBtn.addEventListener('click', () => this.saveCompound());
        }

        const captureImageBtn = document.getElementById('captureImage');
        if (captureImageBtn) {
            captureImageBtn.addEventListener('click', () => this.captureImage());
        }

        const recognizeStructureBtn = document.getElementById('recognizeStructure');
        if (recognizeStructureBtn) {
            recognizeStructureBtn.addEventListener('click', () => this.recognizeStructure());
        }

        const validateStructureBtn = document.getElementById('validateStructure');
        if (validateStructureBtn) {
            validateStructureBtn.addEventListener('click', () => this.validateStructure());
        }

        const smilesInput = document.getElementById('smilesInput');
        if (smilesInput) {
            smilesInput.addEventListener('change', () => this.validateStructure());
        }

        // Compounds page specific event listeners
        if (this.isCompoundsPage) {
            const paperFilter = document.getElementById('paperFilter');
            if (paperFilter) {
                paperFilter.addEventListener('change', (e) => {
                    const paperId = e.target.value;
                    if (paperId === 'all') {
                        this.loadAllCompounds();
                    } else {
                        this.loadCompoundsByPaper(parseInt(paperId));
                    }
                });
            }

            const compoundsTableBody = document.getElementById('compoundsTableBody');
            if (compoundsTableBody) {
                compoundsTableBody.addEventListener('click', (e) => {
                    const target = e.target.closest('button');
                    if (!target) return;

                    const compoundId = target.getAttribute('data-id');

                    if (target.classList.contains('edit-compound')) {
                        this.editCompound(compoundId);
                    } else if (target.classList.contains('delete-compound')) {
                        this.confirmDeleteCompound(compoundId);
                    }
                });
            }

            const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', () => {
                    const compoundId = confirmDeleteBtn.getAttribute('data-id');
                    this.deleteCompound(compoundId);
                });
            }

            // Add event listener for update compound button
            const updateCompoundBtn = document.getElementById('updateCompoundBtn');
            if (updateCompoundBtn) {
                updateCompoundBtn.addEventListener('click', () => this.updateCompound());
            }
        }
    }

    // Initialize DataTable for compounds page
    initializeCompoundsTable() {
        this.compoundsTable = $('#compoundsTable').DataTable({
            columns: [
                {
                    data: 'id',
                    width: "5%"
                },
                {
                    data: 'image',
                    width: "10%",
                    render: function (data) {
                        return data ? `<img src="${data}" style="height: 60px; max-width: 100%;">` : '';
                    }
                },
                {
                    data: 'smiles',
                    width: "20%",
                    render: function (data, type) {
                        // For display, show truncated version with tooltip
                        if (type === 'display' && data && data.length > 30) {
                            return `<span title="${data}" data-bs-toggle="tooltip">${data.substring(0, 30)}...</span>`;
                        }
                        return data;
                    }
                },
                {
                    data: 'inchi',
                    width: "20%",
                    render: function (data, type) {
                        // For display, show truncated version with tooltip
                        if (type === 'display' && data && data.length > 30) {
                            return `<span title="${data}" data-bs-toggle="tooltip">${data.substring(0, 30)}...</span>`;
                        }
                        return data;
                    }
                },
                {
                    data: 'chemical_data',
                    width: "20%",
                    render: (data, type) => {
                        if (type !== 'display') return JSON.stringify(data);

                        let html = '';
                        if (data) {
                            Object.entries(data).forEach(([key, value]) => {
                                // Truncate long values
                                const displayValue = String(value).length > 20
                                    ? `${String(value).substring(0, 20)}...`
                                    : value;

                                // Add tooltip for long values
                                if (String(value).length > 20) {
                                    html += `<div><strong>${key}:</strong> <span title="${value}" data-bs-toggle="tooltip">${displayValue}</span></div>`;
                                } else {
                                    html += `<div><strong>${key}:</strong> ${displayValue}</div>`;
                                }
                            });
                        }
                        return html;
                    }
                },
                {
                    data: 'pdf_id',
                    width: "15%",
                    render: (data, type) => {
                        const title = this.paperTitles[data] || `Paper ID: ${data}`;
                        // For display, truncate long titles with tooltip
                        if (type === 'display' && title.length > 25) {
                            return `<span title="${title}" data-bs-toggle="tooltip">${title.substring(0, 25)}...</span>`;
                        }
                        return title;
                    }
                },
                {
                    data: null,
                    width: "10%",
                    defaultContent: '',
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-primary edit-compound" data-id="${row.id}" title="Edit">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-danger delete-compound" data-id="${row.id}" title="Delete">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            responsive: true,
            scrollX: false,
            order: [[0, 'desc']],
            // Initialize tooltips after draw
            drawCallback: function () {
                $('[data-bs-toggle="tooltip"]').tooltip();
            }
        });
    }

    // Load chemical data fields from the active project
    async loadChemicalDataFields() {
        try {
            const response = await fetch('/api/projects/active/fields');

            if (response.ok) {
                this.chemicalDataFields = await response.json();
                this.renderChemicalDataFields();
            } else {
                // If no active project, handle gracefully
                const errorData = await response.json();
                console.error('Error loading fields:', errorData.error);

                if (errorData.error === 'No active project') {
                    // Redirect to projects page
                    window.location.href = 'projects.html';
                }
            }
        } catch (error) {
            console.error('Error loading chemical data fields:', error);
        }
    }

    // Render chemical data fields in the form
    renderChemicalDataFields() {
        const container = document.getElementById('chemicalDataContainer');
        if (!container) {
            console.error('Chemical data container not found');
            return;
        }

        container.innerHTML = '';

        this.chemicalDataFields.forEach(field => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'mb-2';

            // Create different input types based on field type
            if (field.type === 'number') {
                inputGroup.innerHTML = `
                    <label for="field_${field.name}" class="form-label">${field.name}</label>
                    <input type="number" id="field_${field.name}"
                           class="form-control chemical-data-field"
                           data-field-name="${field.name}"
                           data-field-type="${field.type}"
                           step="0.01">
                `;
            } else {
                inputGroup.innerHTML = `
                    <label for="field_${field.name}" class="form-label">${field.name}</label>
                    <input type="text" id="field_${field.name}"
                           class="form-control chemical-data-field"
                           data-field-name="${field.name}"
                           data-field-type="${field.type}">
                `;
            }

            container.appendChild(inputGroup);
        });
    }

    // Get values from all chemical data fields
    getChemicalDataValues() {
        const chemicalData = {};
        const fields = document.querySelectorAll('.chemical-data-field');

        fields.forEach(field => {
            const name = field.getAttribute('data-field-name');
            const type = field.getAttribute('data-field-type');
            let value = field.value;

            // Convert to number if it's a numeric field
            if (type === 'number' && value) {
                value = parseFloat(value);
            }

            chemicalData[name] = value;
        });

        return chemicalData;
    }

    async saveCompound() {
        const smilesInput = document.getElementById('smilesInput');
        const inchiInput = document.getElementById('inchiInput');
        const capturedImage = document.getElementById('capturedImage');
        const chemicalData = this.getChemicalDataValues();

        const compound = {
            pdf_id: this.currentPDFId,
            smiles: smilesInput.value,
            inchi: inchiInput.value,
            image: capturedImage.getAttribute('data-image'),
            chemical_data: chemicalData
        };

        try {
            const response = await fetch('/api/compounds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(compound)
            });

            if (response.ok) {
                this.clearForm();
                this.loadCompounds(this.currentPDFId);
            } else {
                throw new Error('Failed to save compound');
            }
        } catch (error) {
            console.error('Error saving compound:', error);
        }
    }

    captureImage() {
        const pdfHandler = window.pdfHandler;
        const imageData = pdfHandler.captureSelection();
        const capturedImage = document.getElementById('capturedImage');
        capturedImage.innerHTML = `<img src="${imageData}" style="max-width: 100%">`;
        capturedImage.setAttribute('data-image', imageData);
    }

    async recognizeStructure() {
        const capturedImage = document.getElementById('capturedImage');
        const imageData = capturedImage.getAttribute('data-image');
        const structurePreview = document.getElementById('structurePreview');
        const smilesInput = document.getElementById('smilesInput');
        const inchiInput = document.getElementById('inchiInput');

        if (!imageData) {
            alert('Please capture an image first');
            return;
        }

        try {
            // Show loading indicator
            structurePreview.innerHTML = '<div class="alert alert-info">Recognizing structure...</div>';

            const response = await fetch('http://localhost:${RECOG_SERVER_PORT}/api/recognize-structure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: imageData })
            });

            const data = await response.json();
            if (response.ok) {
                // Update SMILES with canonical version
                smilesInput.value = data.smiles;

                // Populate InChI automatically
                inchiInput.value = data.inchi;

                // Add edit button to structure preview
                structurePreview.innerHTML = `
                    <div class="position-relative">
                        <img src="${data.structure_image}" style="max-width: 100%">
                        <button id="editStructure" class="btn btn-sm btn-primary position-absolute top-0 end-0 m-2">
                            Edit Structure
                        </button>
                    </div>
                `;

                // Store molblock for the editor
                structurePreview.setAttribute('data-molblock', data.molblock);

                // Add edit button event listener
                document.getElementById('editStructure').addEventListener('click', () => {
                    this.openStructureEditor(data.molblock);
                });
            } else {
                structurePreview.innerHTML = `<div class="alert alert-danger">Error: ${data.error}</div>`;
                alert('Error recognizing structure: ' + data.error);
            }
        } catch (error) {
            console.error('Error recognizing structure:', error);
            structurePreview.innerHTML = '<div class="alert alert-danger">Error connecting to chemical service</div>';
            alert('Error recognizing structure');
        }
    }

    async validateStructure() {
        const smilesInput = document.getElementById('smilesInput');
        const inchiInput = document.getElementById('inchiInput');
        const structurePreview = document.getElementById('structurePreview');
        const smiles = smilesInput.value;

        if (!smiles) {
            structurePreview.innerHTML = '';
            return;
        }

        try {
            const response = await fetch('http://localhost:${RECOG_SERVER_PORT}/api/validate-smiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ smiles })
            });

            const data = await response.json();
            if (response.ok && data.valid) {
                // Update SMILES with canonical version
                smilesInput.value = data.smiles;

                // Populate InChI automatically
                inchiInput.value = data.inchi;

                // Add edit button to structure preview
                structurePreview.innerHTML = `
                    <div class="position-relative">
                        <img src="${data.structure_image}" style="max-width: 100%">
                        <button id="editStructure" class="btn btn-sm btn-primary position-absolute top-0 end-0 m-2">
                            Edit Structure
                        </button>
                    </div>
                `;

                // Store molblock for the editor
                structurePreview.setAttribute('data-molblock', data.molblock);

                // Add edit button event listener
                document.getElementById('editStructure').addEventListener('click', () => {
                    this.openStructureEditor(data.molblock);
                });
            } else {
                structurePreview.innerHTML = '<div class="alert alert-danger">Invalid SMILES</div>';
            }
        } catch (error) {
            console.error('Error validating SMILES:', error);
            structurePreview.innerHTML = '<div class="alert alert-danger">Error validating structure</div>';
        }
    }

    openStructureEditor(molblock) {
        // Encode molblock for URL
        const encodedMolblock = encodeURIComponent(molblock);

        // Open the editor in a new window
        const editorWindow = window.open(
            `http://localhost:${RECOG_SERVER_PORT}/rdkit-editor.html?molblock=${encodedMolblock}`,
            'RDKitEditor',
            'width=800,height=600'
        );

        // Set up event listener to receive the edited molecule
        window.addEventListener('message', async (event) => {
            // Check if it's from our editor
            if (event.data && event.data.type === 'rdkit-molecule') {
                // Get the molfile from the editor
                const molblock = event.data.molblock;

                // Convert molfile to SMILES and InChI
                try {
                    const response = await fetch('http://localhost:${RECOG_SERVER_PORT}/api/molfile-to-structure', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ molfile: molblock })
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Update form values
                        document.getElementById('smilesInput').value = data.smiles;
                        document.getElementById('inchiInput').value = data.inchi;

                        // Update structure preview
                        const structurePreview = document.getElementById('structurePreview');
                        structurePreview.innerHTML = `
                            <div class="position-relative">
                                <img src="${data.structure_image}" style="max-width: 100%">
                                <button id="editStructure" class="btn btn-sm btn-primary position-absolute top-0 end-0 m-2">
                                    Edit Structure
                                </button>
                            </div>
                        `;

                        // Store new molblock
                        structurePreview.setAttribute('data-molblock', molblock);

                        // Add edit button event listener
                        document.getElementById('editStructure').addEventListener('click', () => {
                            this.openStructureEditor(molblock);
                        });
                    }
                } catch (error) {
                    console.error('Error converting molfile:', error);
                }
            }
        });
    }

    // Load papers for dropdown filter or selection
    async loadPapers() {
        try {
            const response = await fetch('/api/pdfs');
            const papers = await response.json();

            // Store paper titles for reference
            papers.forEach(paper => {
                this.paperTitles[paper.id] = paper.title;
            });

            // If on compounds page, populate paper filter dropdown
            if (this.isCompoundsPage) {
                const paperFilter = document.getElementById('paperFilter');
                if (paperFilter) {
                    paperFilter.innerHTML = '<option value="all">All Papers</option>';

                    papers.forEach(paper => {
                        const option = document.createElement('option');
                        option.value = paper.id;
                        option.textContent = paper.title;
                        paperFilter.appendChild(option);
                    });
                }

                // Also populate dropdown in add compound modal
                const compoundPaper = document.getElementById('compoundPaper');
                if (compoundPaper) {
                    compoundPaper.innerHTML = '<option value="">Select Paper</option>';

                    papers.forEach(paper => {
                        const option = document.createElement('option');
                        option.value = paper.id;
                        option.textContent = paper.title;
                        compoundPaper.appendChild(option);
                    });
                }
            }

            return papers;
        } catch (error) {
            console.error('Error loading papers:', error);
            this.showAlert('Error loading papers. Please try again later.', 'danger');
            return [];
        }
    }

    // Load all compounds from all papers (for compounds.html)
    async loadAllCompounds() {
        if (!this.isCompoundsPage || !this.compoundsTable) return;

        try {
            // Get list of papers first
            const papers = await this.loadPapers();

            // Clear table
            this.compoundsTable.clear();

            // Get compounds for each paper
            const promises = papers.map(paper =>
                fetch(`/api/compounds/${paper.id}`)
                    .then(response => response.json())
                    .catch(error => {
                        console.error(`Error loading compounds for paper ${paper.id}:`, error);
                        return [];
                    })
            );

            const compoundsByPaper = await Promise.all(promises);

            // Flatten array of compounds
            const allCompounds = compoundsByPaper.flat();

            // Parse chemical_data JSON strings if needed
            allCompounds.forEach(compound => {
                if (typeof compound.chemical_data === 'string') {
                    try {
                        compound.chemical_data = JSON.parse(compound.chemical_data);
                    } catch (e) {
                        console.error('Error parsing chemical data:', e);
                        compound.chemical_data = {};
                    }
                }
            });

            // Add all compounds to table
            this.compoundsTable.rows.add(allCompounds).draw();

            // Show message if no compounds
            if (allCompounds.length === 0) {
                this.showAlert('No compounds found. Add compounds from the home page or using the Add Compound button.', 'info');
            }
        } catch (error) {
            console.error('Error loading all compounds:', error);
            this.showAlert('Error loading compounds. Please try again later.', 'danger');
        }
    }

    // Load compounds by paper ID (for filtering in compounds.html)
    async loadCompoundsByPaper(paperId) {
        if (!this.isCompoundsPage || !this.compoundsTable) return;

        try {
            const response = await fetch(`/api/compounds/${paperId}`);
            const compounds = await response.json();

            // Parse chemical_data JSON strings if needed
            compounds.forEach(compound => {
                if (typeof compound.chemical_data === 'string') {
                    try {
                        compound.chemical_data = JSON.parse(compound.chemical_data);
                    } catch (e) {
                        console.error('Error parsing chemical data:', e);
                        compound.chemical_data = {};
                    }
                }
            });

            // Update table
            this.compoundsTable.clear();
            this.compoundsTable.rows.add(compounds).draw();

            // Show message if no compounds
            if (compounds.length === 0) {
                this.showAlert(`No compounds found for this paper. Add compounds from the home page or using the Add Compound button.`, 'info');
            }
        } catch (error) {
            console.error('Error loading compounds for paper:', error);
            this.showAlert('Error loading compounds. Please try again later.', 'danger');
        }
    }

    // Load compounds for a specific PDF ID (used on index.html)
    async loadCompounds(pdfId) {
        this.currentPDFId = pdfId;
        try {
            const response = await fetch(`/api/compounds/${pdfId}`);
            const compounds = await response.json();
            this.displayCompounds(compounds);
        } catch (error) {
            console.error('Error loading compounds:', error);
        }
    }

    displayCompounds(compounds) {
        const compoundList = document.getElementById('compoundList');

        compoundList.innerHTML = compounds.map(compound => {
            // Create chemical data HTML
            let chemicalDataHtml = '';
            if (compound.chemical_data) {
                Object.entries(compound.chemical_data).forEach(([key, value]) => {
                    chemicalDataHtml += `<div>${key}: ${value}</div>`;
                });
            }

            return `
                <div class="compound-item">
                    <img src="${compound.image}" class="compound-image">
                    <div class="structure-image"></div>
                    <div>SMILES: ${compound.smiles}</div>
                    <div>InChI: ${compound.inchi}</div>
                    ${chemicalDataHtml}
                    <button onclick="compoundManager.deleteCompound(${compound.id})" class="btn btn-danger btn-sm mt-2">
                        Delete
                    </button>
                </div>
            `;
        }).join('');
    }

    // Confirm delete compound (for compounds.html)
    confirmDeleteCompound(compoundId) {
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.setAttribute('data-id', compoundId);
            const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
            confirmModal.show();
        }
    }

    // Delete compound method (works for both pages)
    async deleteCompound(id) {
        try {
            const response = await fetch(`/api/compounds/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (this.isCompoundsPage) {
                    // Close modal if on compounds page
                    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
                    if (confirmModal) {
                        confirmModal.hide();
                    }

                    // Get current paper filter
                    const paperFilter = document.getElementById('paperFilter');
                    const paperId = paperFilter ? paperFilter.value : 'all';

                    // Reload compounds based on current filter
                    if (paperId === 'all') {
                        this.loadAllCompounds();
                    } else {
                        this.loadCompoundsByPaper(parseInt(paperId));
                    }

                    this.showAlert('Compound deleted successfully', 'success');
                } else {
                    // On index.html page
                    this.loadCompounds(this.currentPDFId);
                }
            }
        } catch (error) {
            console.error('Error deleting compound:', error);
            if (this.isCompoundsPage) {
                this.showAlert('Error deleting compound. Please try again.', 'danger');
            }
        }
    }

    // Edit compound method (for compounds.html)
    async editCompound(compoundId) {
        if (!this.isCompoundsPage) return;

        try {
            // Find the compound in the table data
            const compounds = this.compoundsTable.data().toArray();
            const compound = compounds.find(c => c.id == compoundId);

            if (!compound) {
                this.showAlert('Compound not found', 'danger');
                return;
            }

            // Set compound ID in hidden field
            document.getElementById('editCompoundId').value = compound.id;

            // Set paper title
            document.getElementById('editPaperTitle').value = this.paperTitles[compound.pdf_id] || `Paper ID: ${compound.pdf_id}`;

            // Set SMILES and InChI (read-only)
            document.getElementById('editCompoundSmiles').value = compound.smiles;
            document.getElementById('editCompoundInchi').value = compound.inchi;

            // Display structure image
            document.getElementById('editStructureImage').innerHTML = `
                <img src="${compound.image}" style="max-width: 100%; max-height: 200px;">
            `;

            // Create inputs for chemical data fields
            const container = document.getElementById('editChemicalDataContainer');
            container.innerHTML = '';

            if (compound.chemical_data) {
                Object.entries(compound.chemical_data).forEach(([key, value]) => {
                    const fieldType = typeof value === 'number' ? 'number' : 'text';
                    const step = fieldType === 'number' ? 'step="0.01"' : '';

                    const fieldGroup = document.createElement('div');
                    fieldGroup.className = 'mb-2';
                    fieldGroup.innerHTML = `
                        <label for="edit_field_${key}" class="form-label">${key}</label>
                        <input type="${fieldType}" id="edit_field_${key}"
                            class="form-control chemical-data-field"
                            data-field-name="${key}"
                            data-field-type="${fieldType}"
                            value="${value}" ${step}>
                    `;

                    container.appendChild(fieldGroup);
                });
            }

            // Show the edit modal
            const editModal = new bootstrap.Modal(document.getElementById('editCompoundModal'));
            editModal.show();
        } catch (error) {
            console.error('Error editing compound:', error);
            this.showAlert('Error loading compound details', 'danger');
        }
    }

    // Update compound method (for compounds.html)
    async updateCompound() {
        if (!this.isCompoundsPage) return;

        try {
            const compoundId = document.getElementById('editCompoundId').value;
            if (!compoundId) {
                this.showAlert('Compound ID is missing', 'danger');
                return;
            }

            // Get all chemical data inputs
            const chemicalData = {};
            const dataFields = document.querySelectorAll('#editChemicalDataContainer .chemical-data-field');

            dataFields.forEach(field => {
                const name = field.getAttribute('data-field-name');
                const type = field.getAttribute('data-field-type');
                let value = field.value;

                // Convert to number if it's a numeric field
                if (type === 'number' && value) {
                    value = parseFloat(value);
                }

                chemicalData[name] = value;
            });

            // Find original compound to get other required data
            const compounds = this.compoundsTable.data().toArray();
            const originalCompound = compounds.find(c => c.id == compoundId);

            if (!originalCompound) {
                this.showAlert('Original compound data not found', 'danger');
                return;
            }

            // Prepare updated compound data
            const updatedCompound = {
                pdf_id: originalCompound.pdf_id,
                smiles: originalCompound.smiles,
                inchi: originalCompound.inchi,
                image: originalCompound.image,
                chemical_data: chemicalData
            };

            // Send update request to server
            const response = await fetch(`/api/compounds/${compoundId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCompound)
            });

            if (response.ok) {
                // Close the modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editCompoundModal'));
                editModal.hide();

                // Reload compounds based on current filter
                const paperFilter = document.getElementById('paperFilter');
                const paperId = paperFilter ? paperFilter.value : 'all';

                if (paperId === 'all') {
                    this.loadAllCompounds();
                } else {
                    this.loadCompoundsByPaper(parseInt(paperId));
                }

                this.showAlert('Compound updated successfully', 'success');
            } else {
                const errorData = await response.json();
                this.showAlert(`Error updating compound: ${errorData.error || 'Unknown error'}`, 'danger');
            }
        } catch (error) {
            console.error('Error updating compound:', error);
            this.showAlert('Error updating compound', 'danger');
        }
    }

    // Helper function to show alerts
    showAlert(message, type) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Append to container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertElement, container.firstChild);

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                alertElement.classList.remove('show');
                setTimeout(() => alertElement.remove(), 150);
            }, RECOG_SERVER_PORT);
        }
    }

    clearForm() {
        document.getElementById('smilesInput').value = '';
        document.getElementById('inchiInput').value = '';
        document.getElementById('capturedImage').innerHTML = '';
        document.getElementById('capturedImage').removeAttribute('data-image');
        document.getElementById('structurePreview').innerHTML = '';

        // Clear all chemical data fields
        document.querySelectorAll('.chemical-data-field').forEach(field => {
            field.value = '';
        });
    }
}

// Initialize compound manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make it globally available for event handlers
    window.compoundManager = new CompoundManager();
});