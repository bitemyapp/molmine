use leptos::prelude::*;

#[component]
pub fn NavBar(#[prop(into)] toggle_about_modal: Callback<()>) -> impl IntoView {
    view! {
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-3">
            <div class="container-fluid">
                <a class="navbar-brand" href="projects.html">Paperbase</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="projects.html"><i class="bi bi-folder"></i> Projects</a>
                        </li>
                        <li class="nav-item project-dependent">
                            <a class="nav-link" href="index.html"><i class="bi bi-house"></i> Home</a>
                        </li>
                        <li class="nav-item project-dependent">
                            <a class="nav-link" href="papers.html"><i class="bi bi-file-earmark-pdf"></i> View Papers</a>
                        </li>
                        <li class="nav-item project-dependent">
                            <a class="nav-link" href="compounds.html"><i class="bi bi-hexagon"></i> View Compounds</a>
                        </li>
                        <li class="nav-item project-dependent">
                            <a class="nav-link" href="model.html"><i class="bi bi-graph-up"></i> Produce Model</a>
                        </li>
                    </ul>
                    <div class="navbar-text me-2 text-white" id="currentProjectDisplay"></div>
                    <button on:click=move |_| toggle_about_modal.run(()) class="btn btn-light" id="aboutButton">
                        <i class="bi bi-info-circle"></i> About
                    </button>
                </div>
            </div>
        </nav>
    }
}
//  data-bs-toggle="modal" data-bs-target="#aboutModal"
