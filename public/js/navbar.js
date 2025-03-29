document.addEventListener('DOMContentLoaded', async () => {
  // Load the navbar HTML
  async function loadNavbar() {
    try {
      const response = await fetch('/static/html/navbar.html');
      const html = await response.text();
      
      // Get the navbar placeholder and replace with the loaded HTML
      const navbarContainer = document.getElementById('navbar-container');
      if (navbarContainer) {
        navbarContainer.innerHTML = html;
        // After loading the navbar, initialize it
        await initNavbar();
      }
    } catch (error) {
      console.error('Error loading navbar:', error);
    }
  }
  
  // Load the about modal HTML
  async function loadAboutModal() {
    try {
      const response = await fetch('/static/html/about.html');
      const html = await response.text();
      
      // Get the about modal placeholder and replace with the loaded HTML
      const aboutContainer = document.getElementById('about-container');
      if (aboutContainer) {
        aboutContainer.innerHTML = html;
      }
    } catch (error) {
      console.error('Error loading about modal:', error);
    }
  }
  
  // Get the current active page to set the active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Check if a project is active
  async function checkActiveProject() {
    try {
      const response = await fetch('/api/projects/active');
      const data = await response.json();
      return data.project || null;
    } catch (error) {
      console.error('Error checking active project:', error);
      return null;
    }
  }

  // Initialize the navbar
  async function initNavbar() {
    const activeProject = await checkActiveProject();
    const projectDisplay = document.getElementById('currentProjectDisplay');
    
    // Show or hide project-dependent navigation items
    const projectDependentItems = document.querySelectorAll('.project-dependent');
    projectDependentItems.forEach(item => {
      item.style.display = activeProject ? 'block' : 'none';
    });
    
    // Display current project name if available
    if (projectDisplay && activeProject) {
      projectDisplay.textContent = `Project: ${activeProject.name}`;
      projectDisplay.style.display = 'block';
    } else if (projectDisplay) {
      projectDisplay.style.display = 'none';
    }
    
    // Set the active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    
    // If we're not on the projects page and no project is active,
    // redirect to projects page
    if (currentPage !== 'projects.html' && !activeProject && !window.location.href.includes('projects.html')) {
      window.location.href = 'projects.html';
    }
  }
  
  // Load the navbar and about modal
  loadNavbar();
  loadAboutModal();
});