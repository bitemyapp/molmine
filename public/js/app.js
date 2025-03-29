pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Check if a project is active before initializing the app
async function checkActiveProject() {
    try {
        const response = await fetch('/api/projects');
        const data = await response.json();

        if (!data.activeProject) {
            // No active project, redirect to projects page
            window.location.href = 'projects.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking active project:', error);
        // If there's an error, we'll still try to initialize
        return true;
    }
}

// Initialize app only if a project is active
async function initApp() {
    const hasActiveProject = await checkActiveProject();
    if (!hasActiveProject) return;

    const pdfHandler = new PDFHandler();
    const compoundManager = new CompoundManager();
    window.pdfHandler = pdfHandler;
    window.compoundManager = compoundManager;

    // Initial load
    loadPDFList();
}

// Start the app
initApp();

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('pdf', document.getElementById('pdfFile').files[0]);

    // Get values from individual BibTeX fields
    const bibtexData = {
        title: document.getElementById('titleInput').value,
        authors: document.getElementById('authorsInput').value,
        year: document.getElementById('yearInput').value,
        journal: document.getElementById('journalInput').value,
        volume: document.getElementById('volumeInput').value
    };

    formData.append('bibtexData', JSON.stringify(bibtexData));

    try {
        const response = await fetch('/api/pdfs', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            loadPDFList();
        }
    } catch (error) {
        console.error('Error uploading PDF:', error);
    }
});

async function loadPDFList() {
    try {
        const response = await fetch('/api/pdfs');
        const pdfs = await response.json();

        const pdfList = document.getElementById('pdfList');
        pdfList.innerHTML = pdfs.map(pdf => `
            <div class="list-group-item" onclick="loadPDF(${pdf.id})">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${pdf.title || 'Untitled'}</h6>
                        <small>${pdf.authors || 'Unknown authors'}</small>
                        <div class="text-muted">
                            ${pdf.journal ? `${pdf.journal}, ` : ''}
                            ${pdf.volume ? `Volume ${pdf.volume}, ` : ''}
                            ${pdf.year || ''}
                        </div>
                    </div>
                    <button onclick="deletePDF(${pdf.id}, event)" class="btn btn-danger btn-sm">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading PDF list:', error);
    }
}

async function loadPDF(id) {
    try {
        const response = await fetch(`/api/pdfs/${id}`);
        const pdfData = await response.arrayBuffer();
        await pdfHandler.loadDocument(pdfData);
        compoundManager.loadCompounds(id);
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

async function deletePDF(id, event) {
    event.stopPropagation();
    try {
        const response = await fetch(`/api/pdfs/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadPDFList();
        }
    } catch (error) {
        console.error('Error deleting PDF:', error);
    }
}

// Remove this as we now call loadPDFList() in initApp