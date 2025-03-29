const RECOG_SERVER_PORT = 5000;

document.addEventListener('DOMContentLoaded', function () {
    // Initialize DataTable
    const papersTable = $('#papersTable').DataTable({
        columns: [
            { data: 'id' },
            { data: 'title' },
            { data: 'authors' },
            { data: 'year' },
            { data: 'journal' },
            { data: 'volume' },
            {
                data: null,
                defaultContent: '',
                orderable: false,
                render: function (data, type, row) {
                    return `
                        <div class="btn-group" role="group">
                            <button type="button" class="btn btn-sm btn-primary view-pdf" data-id="${row.id}" title="View PDF">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-secondary edit-paper" data-id="${row.id}" title="Edit">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-danger delete-paper" data-id="${row.id}" title="Delete">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        responsive: true,
        order: [[0, 'desc']]
    });

    // Load papers
    loadPapers();

    // Event listeners
    document.getElementById('savePaperBtn').addEventListener('click', savePaper);
    document.getElementById('updatePaperBtn').addEventListener('click', updatePaper);

    // Action buttons event delegation
    document.getElementById('papersTableBody').addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (!target) return;

        const paperId = target.getAttribute('data-id');

        if (target.classList.contains('view-pdf')) {
            viewPdf(paperId);
        } else if (target.classList.contains('edit-paper')) {
            editPaper(paperId);
        } else if (target.classList.contains('delete-paper')) {
            showDeleteConfirmation(paperId);
        }
    });

    // Confirm delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        const paperId = this.getAttribute('data-id');
        deletePaper(paperId);
    });

    // Load papers from server
    async function loadPapers() {
        try {
            const response = await fetch('/api/pdfs');
            const papers = await response.json();

            // Clear and reload table
            papersTable.clear();
            papersTable.rows.add(papers).draw();
        } catch (error) {
            console.error('Error loading papers:', error);
            showAlert('Error loading papers. Please try again later.', 'danger');
        }
    }

    // Save new paper
    async function savePaper() {
        const paperFile = document.getElementById('paperFile').files[0];
        const title = document.getElementById('paperTitle').value;
        const authors = document.getElementById('paperAuthors').value;
        const year = document.getElementById('paperYear').value;
        const journal = document.getElementById('paperJournal').value;
        const volume = document.getElementById('paperVolume').value;

        if (!paperFile || !title || !authors || !year || !journal) {
            showAlert('Please fill in all required fields.', 'warning', 'addPaperModal');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('pdf', paperFile);
            formData.append('bibtexData', JSON.stringify({
                title, authors, year, journal, volume
            }));

            const response = await fetch('/api/pdfs', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addPaperModal'));
                modal.hide();
                document.getElementById('addPaperForm').reset();

                // Reload papers
                loadPapers();
                showAlert('Paper added successfully', 'success');
            } else {
                const data = await response.json();
                showAlert(`Error adding paper: ${data.error}`, 'danger', 'addPaperModal');
            }
        } catch (error) {
            console.error('Error adding paper:', error);
            showAlert('Error adding paper. Please try again.', 'danger', 'addPaperModal');
        }
    }

    // PDF.js variables
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let canvas = document.getElementById('pdfCanvas');
    let ctx = canvas ? canvas.getContext('2d') : null;
    let scale = 1.0;

    // View PDF
    async function viewPdf(paperId) {
        try {
            // Create a URL for the PDF with explicit inline viewing parameter
            const pdfUrl = `/api/pdfs/${paperId}?inline=true`;

            // Reset PDF viewer state
            pageNum = 1;

            // Show the modal first so canvas is visible for rendering
            const viewPdfModal = new bootstrap.Modal(document.getElementById('viewPdfModal'));
            viewPdfModal.show();

            // Show loading indicator
            document.getElementById('pdfLoadingIndicator').style.display = 'block';
            document.getElementById('pdfCanvas').style.display = 'none';

            // Ensure canvas is ready
            canvas = document.getElementById('pdfCanvas');
            ctx = canvas.getContext('2d');

            // Set up button event listeners
            document.getElementById('prevPage').onclick = onPrevPage;
            document.getElementById('nextPage').onclick = onNextPage;

            // Load the PDF using PDF.js
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            loadingTask.promise.then(function (pdf) {
                pdfDoc = pdf;
                document.getElementById('pageInfo').textContent = `Page: ${pageNum}/${pdfDoc.numPages}`;

                // Hide loading indicator and show canvas
                document.getElementById('pdfLoadingIndicator').style.display = 'none';
                document.getElementById('pdfCanvas').style.display = 'block';

                // Initial render of the first page
                renderPage(pageNum);
            }).catch(function (error) {
                console.error('Error loading PDF:', error);
                document.getElementById('pdfLoadingIndicator').style.display = 'none';
                showAlert('Error loading PDF: ' + error.message, 'danger');
            });
        } catch (error) {
            console.error('Error viewing PDF:', error);
            document.getElementById('pdfLoadingIndicator').style.display = 'none';
            showAlert('Error loading PDF. Please try again.', 'danger');
        }
    }

    // Render a specific page of the PDF
    function renderPage(num) {
        pageRendering = true;

        // Get the page
        pdfDoc.getPage(num).then(function (page) {
            // Determine scale based on viewport
            const viewport = page.getViewport({ scale: 1.0 });
            const container = document.getElementById('pdfViewerContainer');

            // Calculate available width accounting for padding
            const availableWidth = container.clientWidth - 30;

            // Calculate scale to fit width while maintaining aspect ratio
            const widthScale = availableWidth / viewport.width;

            // Use a reasonable scale (not too small, not too large)
            scale = Math.min(Math.max(widthScale, 0.8), 1.8);

            // Get the viewport at the new scale
            const scaledViewport = page.getViewport({ scale });

            // Set canvas dimensions
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            // Render PDF page
            const renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };

            const renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then(function () {
                pageRendering = false;

                // If there's a page pending, render it
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });

        // Update page counter
        document.getElementById('pageInfo').textContent = `Page: ${num}/${pdfDoc.numPages}`;
    }

    // Queue rendering of a page if another rendering is in progress
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    // Go to previous page
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }

    // Go to next page
    function onNextPage() {
        if (pdfDoc === null || pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }

    // Edit paper
    async function editPaper(paperId) {
        try {
            // Get paper details
            const papers = papersTable.data().toArray();
            const paper = papers.find(p => p.id == paperId);

            if (!paper) {
                showAlert('Paper not found', 'danger');
                return;
            }

            // Fill the form
            document.getElementById('editPaperId').value = paper.id;
            document.getElementById('editPaperTitle').value = paper.title;
            document.getElementById('editPaperAuthors').value = paper.authors;
            document.getElementById('editPaperYear').value = paper.year;
            document.getElementById('editPaperJournal').value = paper.journal;
            document.getElementById('editPaperVolume').value = paper.volume || '';

            // Show the modal
            const editPaperModal = new bootstrap.Modal(document.getElementById('editPaperModal'));
            editPaperModal.show();
        } catch (error) {
            console.error('Error editing paper:', error);
            showAlert('Error loading paper details. Please try again.', 'danger');
        }
    }

    // Update paper
    async function updatePaper() {
        const paperId = document.getElementById('editPaperId').value;
        const title = document.getElementById('editPaperTitle').value;
        const authors = document.getElementById('editPaperAuthors').value;
        const year = document.getElementById('editPaperYear').value;
        const journal = document.getElementById('editPaperJournal').value;
        const volume = document.getElementById('editPaperVolume').value;

        if (!title || !authors || !year || !journal) {
            showAlert('Please fill in all required fields.', 'warning', 'editPaperModal');
            return;
        }

        try {
            const response = await fetch(`/api/pdfs/${paperId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title, authors, year, journal, volume
                })
            });

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editPaperModal'));
                modal.hide();

                // Reload papers
                loadPapers();
                showAlert('Paper updated successfully', 'success');
            } else {
                const data = await response.json();
                showAlert(`Error updating paper: ${data.error}`, 'danger', 'editPaperModal');
            }
        } catch (error) {
            console.error('Error updating paper:', error);
            showAlert('Error updating paper. Please try again.', 'danger', 'editPaperModal');
        }
    }

    // Show delete confirmation
    function showDeleteConfirmation(paperId) {
        document.getElementById('confirmDeleteBtn').setAttribute('data-id', paperId);
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();
    }

    // Delete paper
    async function deletePaper(paperId) {
        try {
            const response = await fetch(`/api/pdfs/${paperId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
                modal.hide();

                // Reload papers
                loadPapers();
                showAlert('Paper deleted successfully', 'success');
            } else {
                const data = await response.json();
                showAlert(`Error deleting paper: ${data.error}`, 'danger');
            }
        } catch (error) {
            console.error('Error deleting paper:', error);
            showAlert('Error deleting paper. Please try again.', 'danger');
        }
    }

    // Helper function to show alerts
    function showAlert(message, type, modalId = null) {
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.role = 'alert';
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Append to appropriate container
        if (modalId) {
            // Inside modal
            const modalBody = document.querySelector(`#${modalId} .modal-body`);
            modalBody.insertBefore(alertElement, modalBody.firstChild);
        } else {
            // Main page
            const container = document.querySelector('.container');
            container.insertBefore(alertElement, container.firstChild);
        }

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => alertElement.remove(), 150);
        }, 5000);
    }
});