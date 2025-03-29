document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const projectsList = document.getElementById('projectsList');
  const noProjectsMessage = document.getElementById('noProjectsMessage');
  const addFieldBtn = document.getElementById('addFieldBtn');
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const dataFields = document.getElementById('dataFields');
  const createProjectModal = new bootstrap.Modal(document.getElementById('createProjectModal'));
  const editProjectModal = new bootstrap.Modal(document.getElementById('editProjectModal'));
  const editDataFields = document.getElementById('editDataFields');
  const editAddFieldBtn = document.getElementById('editAddFieldBtn');
  const updateProjectBtn = document.getElementById('updateProjectBtn');
  
  // Load projects on page load
  loadProjects();
  
  // Event listeners
  addFieldBtn.addEventListener('click', addField.bind(null, dataFields));
  editAddFieldBtn.addEventListener('click', addField.bind(null, editDataFields));
  saveProjectBtn.addEventListener('click', createNewProject);
  updateProjectBtn.addEventListener('click', updateProject);
  
  // Add field to form
  function addField(container) {
    const fieldRow = document.createElement('div');
    fieldRow.className = 'data-field row mb-2';
    fieldRow.innerHTML = `
      <div class="col-md-5">
        <input type="text" class="form-control field-name" placeholder="Field name" required>
      </div>
      <div class="col-md-5">
        <select class="form-select field-type">
          <option value="number">Numeric</option>
          <option value="string">Text (categorical)</option>
        </select>
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger remove-field">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    
    // Add event listener for remove button
    const removeBtn = fieldRow.querySelector('.remove-field');
    removeBtn.addEventListener('click', () => {
      fieldRow.remove();
    });
    
    container.appendChild(fieldRow);
  }
  
  // Load projects from API
  async function loadProjects() {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      
      if (data.projects && data.projects.length > 0) {
        noProjectsMessage.style.display = 'none';
        renderProjects(data.projects, data.activeProject);
      } else {
        noProjectsMessage.style.display = 'block';
        projectsList.innerHTML = '';
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      showAlert('danger', 'Failed to load projects. Please try again.');
    }
  }
  
  // Render projects list
  function renderProjects(projects, activeProjectId) {
    projectsList.innerHTML = '';
    
    projects.forEach(project => {
      const isActive = project.id === activeProjectId;
      
      const projectEl = document.createElement('div');
      projectEl.className = `list-group-item list-group-item-action ${isActive ? 'active' : ''}`;
      
      projectEl.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${project.name}</h5>
            <small class="text-muted">Created: ${new Date(project.created_at).toLocaleDateString()}</small>
            ${isActive ? '<span class="badge bg-success ms-2">Active</span>' : ''}
          </div>
          <div class="btn-group">
            ${!isActive ? `
              <button class="btn btn-sm btn-primary btn-activate" data-id="${project.id}">
                <i class="bi bi-play-fill"></i> Activate
              </button>
            ` : ''}
            <button class="btn btn-sm ${isActive ? 'btn-light' : 'btn-outline-primary'} btn-edit" data-id="${project.id}">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${project.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      
      projectsList.appendChild(projectEl);
      
      // Add event listeners
      const activateBtn = projectEl.querySelector('.btn-activate');
      if (activateBtn) {
        activateBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await activateProject(project.id);
        });
      }
      
      const editBtn = projectEl.querySelector('.btn-edit');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(project.id);
      });
      
      const deleteBtn = projectEl.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteProject(project.id, project.name);
      });
      
      // Make entire row clickable to activate
      if (!isActive) {
        projectEl.addEventListener('click', () => activateProject(project.id));
      }
    });
  }
  
  // Create a new project
  async function createNewProject() {
    const projectName = document.getElementById('projectName').value.trim();
    if (!projectName) {
      showAlert('danger', 'Project name is required.');
      return;
    }
    
    const fieldRows = dataFields.querySelectorAll('.data-field');
    if (fieldRows.length === 0) {
      showAlert('danger', 'At least one chemical data field is required.');
      return;
    }
    
    const fields = [];
    for (const row of fieldRows) {
      const nameInput = row.querySelector('.field-name');
      const typeSelect = row.querySelector('.field-type');
      
      const name = nameInput.value.trim();
      const type = typeSelect.value;
      
      if (!name) {
        showAlert('danger', 'All field names are required.');
        return;
      }
      
      fields.push({ name, type });
    }
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          fields
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert('success', 'Project created successfully.');
        createProjectModal.hide();
        document.getElementById('createProjectForm').reset();
        
        // Clear the fields except for the first one
        const fieldRows = dataFields.querySelectorAll('.data-field');
        for (let i = 1; i < fieldRows.length; i++) {
          fieldRows[i].remove();
        }
        
        loadProjects();
        
        // Redirect to home page after project creation
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showAlert('danger', data.error || 'Failed to create project.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      showAlert('danger', 'Failed to create project. Please try again.');
    }
  }
  
  // Activate a project
  async function activateProject(id) {
    try {
      const response = await fetch(`/api/projects/${id}/activate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        showAlert('success', 'Project activated successfully.');
        loadProjects();
        
        // Redirect to home page after activation
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        const data = await response.json();
        showAlert('danger', data.error || 'Failed to activate project.');
      }
    } catch (error) {
      console.error('Error activating project:', error);
      showAlert('danger', 'Failed to activate project. Please try again.');
    }
  }
  
  // Open edit modal
  async function openEditModal(id) {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const project = await response.json();
      
      document.getElementById('editProjectId').value = project.id;
      document.getElementById('editProjectName').value = project.name;
      
      // Clear existing fields
      editDataFields.innerHTML = '';
      
      // Add fields
      project.fields.forEach(field => {
        const fieldRow = document.createElement('div');
        fieldRow.className = 'data-field row mb-2';
        fieldRow.innerHTML = `
          <div class="col-md-5">
            <input type="text" class="form-control field-name" placeholder="Field name" required value="${field.name}">
          </div>
          <div class="col-md-5">
            <select class="form-select field-type">
              <option value="number" ${field.type === 'number' ? 'selected' : ''}>Numeric</option>
              <option value="string" ${field.type === 'string' ? 'selected' : ''}>Text (categorical)</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger remove-field">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        `;
        
        // Add event listener for remove button
        const removeBtn = fieldRow.querySelector('.remove-field');
        removeBtn.addEventListener('click', () => {
          fieldRow.remove();
        });
        
        editDataFields.appendChild(fieldRow);
      });
      
      editProjectModal.show();
    } catch (error) {
      console.error('Error loading project details:', error);
      showAlert('danger', 'Failed to load project details. Please try again.');
    }
  }
  
  // Update project
  async function updateProject() {
    const projectId = document.getElementById('editProjectId').value;
    const projectName = document.getElementById('editProjectName').value.trim();
    
    if (!projectName) {
      showAlert('danger', 'Project name is required.');
      return;
    }
    
    const fieldRows = editDataFields.querySelectorAll('.data-field');
    if (fieldRows.length === 0) {
      showAlert('danger', 'At least one chemical data field is required.');
      return;
    }
    
    const fields = [];
    for (const row of fieldRows) {
      const nameInput = row.querySelector('.field-name');
      const typeSelect = row.querySelector('.field-type');
      
      const name = nameInput.value.trim();
      const type = typeSelect.value;
      
      if (!name) {
        showAlert('danger', 'All field names are required.');
        return;
      }
      
      fields.push({ name, type });
    }
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          fields
        })
      });
      
      if (response.ok) {
        showAlert('success', 'Project updated successfully.');
        editProjectModal.hide();
        loadProjects();
      } else {
        const data = await response.json();
        showAlert('danger', data.error || 'Failed to update project.');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      showAlert('danger', 'Failed to update project. Please try again.');
    }
  }
  
  // Confirm delete project
  function confirmDeleteProject(id, name) {
    if (confirm(`Are you sure you want to delete the project "${name}"? This action cannot be undone.`)) {
      deleteProject(id);
    }
  }
  
  // Delete project
  async function deleteProject(id) {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showAlert('success', 'Project deleted successfully.');
        loadProjects();
      } else {
        const data = await response.json();
        showAlert('danger', data.error || 'Failed to delete project.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showAlert('danger', 'Failed to delete project. Please try again.');
    }
  }
  
  // Initialize existing field remove buttons
  document.querySelectorAll('.remove-field').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.data-field').remove();
    });
  });
  
  // Show alert
  function showAlert(type, message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert at the top of the page
    document.querySelector('.container').prepend(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      alertContainer.remove();
    }, 5000);
  }
});