class PDFHandler {
    constructor() {
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = 1.5;
        this.canvas = document.getElementById('pdfCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectionOverlay = document.getElementById('selectionOverlay');
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.pdfViewer = document.getElementById('pdfViewer');
        this.zoomSlider = document.getElementById('zoomSlider');
        this.zoomLevel = document.getElementById('zoomLevel');

        this.setupEventListeners();
        this.setupZoomControls();
    }

    setupEventListeners() {
        document.getElementById('prevPage').addEventListener('click', () => this.onPrevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.onNextPage());

        this.canvas.addEventListener('mousedown', (e) => this.startSelection(e));
        this.canvas.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.canvas.addEventListener('mouseup', () => this.endSelection());
    }

    setupZoomControls() {
        document.getElementById('zoomIn').addEventListener('click', () => {
            const newValue = Math.min(200, parseInt(this.zoomSlider.value) + 10);
            this.zoomSlider.value = newValue;
            this.updateZoom();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            const newValue = Math.max(50, parseInt(this.zoomSlider.value) - 10);
            this.zoomSlider.value = newValue;
            this.updateZoom();
        });

        this.zoomSlider.addEventListener('input', () => this.updateZoom());
    }

    updateZoom() {
        const zoomValue = parseInt(this.zoomSlider.value);
        this.scale = zoomValue / 100;
        this.zoomLevel.textContent = `${zoomValue}%`;
        
        // Store current scroll position before resizing
        const pdfViewerRect = this.pdfViewer.getBoundingClientRect();
        const centerX = this.pdfViewer.scrollLeft + pdfViewerRect.width / 2;
        const centerY = this.pdfViewer.scrollTop + pdfViewerRect.height / 2;
        const centerXRatio = centerX / this.canvas.width;
        const centerYRatio = centerY / this.canvas.height;
        
        if (this.pdfDoc) {
            this.queueRenderPage(this.pageNum);
            
            // After rendering, we need to adjust the scroll position
            // This is done in renderPage after the canvas dimensions are updated
            this._centerXRatio = centerXRatio;
            this._centerYRatio = centerYRatio;
        }
    }

    async loadDocument(pdfData) {
        try {
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            this.pdfDoc = await loadingTask.promise;
            document.getElementById('pageInfo').textContent = `Page: ${this.pageNum} / ${this.pdfDoc.numPages}`;
            this.queueRenderPage(this.pageNum);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }

    async renderPage(num) {
        this.pageRendering = true;
        try {
            const page = await this.pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: this.scale });

            // Save previous dimensions for proper scaling
            const prevHeight = this.canvas.height;
            const prevWidth = this.canvas.width;

            // Set new dimensions
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            
            // Restore scroll position if we have stored ratios
            if (this._centerXRatio !== undefined && this._centerYRatio !== undefined) {
                const newCenterX = this.canvas.width * this._centerXRatio;
                const newCenterY = this.canvas.height * this._centerYRatio;
                
                const pdfViewerRect = this.pdfViewer.getBoundingClientRect();
                this.pdfViewer.scrollLeft = newCenterX - pdfViewerRect.width / 2;
                this.pdfViewer.scrollTop = newCenterY - pdfViewerRect.height / 2;
                
                // Clear the stored ratios
                this._centerXRatio = undefined;
                this._centerYRatio = undefined;
            }
            
            this.pageRendering = false;

            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
        } catch (error) {
            console.error('Error rendering PDF page:', error);
            this.pageRendering = false;
        }
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    onPrevPage() {
        if (this.pageNum <= 1) return;
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
        document.getElementById('pageInfo').textContent = `Page: ${this.pageNum} / ${this.pdfDoc.numPages}`;
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) return;
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
        document.getElementById('pageInfo').textContent = `Page: ${this.pageNum} / ${this.pdfDoc.numPages}`;
    }

    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startSelection(e) {
        const pos = this.getMousePosition(e);
        this.isSelecting = true;
        this.startX = pos.x;
        this.startY = pos.y;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;

        this.selectionOverlay.style.display = 'block';
        this.selectionOverlay.style.left = `${this.startX * scaleX}px`;
        this.selectionOverlay.style.top = `${this.startY * scaleY}px`;
        this.selectionOverlay.style.width = '0px';
        this.selectionOverlay.style.height = '0px';
    }

    updateSelection(e) {
        if (!this.isSelecting) return;

        const pos = this.getMousePosition(e);
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / this.canvas.width;
        const scaleY = rect.height / this.canvas.height;

        const width = pos.x - this.startX;
        const height = pos.y - this.startY;

        this.selectionOverlay.style.width = `${Math.abs(width) * scaleX}px`;
        this.selectionOverlay.style.height = `${Math.abs(height) * scaleY}px`;
        this.selectionOverlay.style.left = `${(width < 0 ? pos.x : this.startX) * scaleX}px`;
        this.selectionOverlay.style.top = `${(height < 0 ? pos.y : this.startY) * scaleY}px`;
    }

    endSelection() {
        this.isSelecting = false;
    }

    captureSelection() {
        const rect = this.selectionOverlay.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / canvasRect.width;
        const scaleY = this.canvas.height / canvasRect.height;

        const x = (rect.left - canvasRect.left) * scaleX;
        const y = (rect.top - canvasRect.top) * scaleY;
        const width = rect.width * scaleX;
        const height = rect.height * scaleY;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(
            this.canvas,
            x, y, width, height,
            0, 0, width, height
        );

        return tempCanvas.toDataURL('image/png');
    }
}