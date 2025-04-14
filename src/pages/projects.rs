use leptos::prelude::*;

#[component]
pub fn ConfirmModal(
    #[prop(into)] show: WriteSignal<bool>,
    #[prop(into)] show: ReadSignal<bool>,
    #[prop(into)] on_close: Callback<()>,
) -> impl IntoView { 
    // 
    let handle_confirm = move |_| {
        on_close.call(()); // ?? needs a proper callback implementation for the delete button 
        set_show.set(false);
    };

    view! {
        <div class="modal fade show" class:d-block=move || show.get() class:d-none=move || !show.get() tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="confirmModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" on.click=move |_| set_show.set(false) aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this compound?</p>
                    <p><strong>This action cannot be undone.</strong></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" 
                        on:click=move |_| set_show.set(false)>Cancel</button>
                    <button type="button" class="btn btn-danger">
                        on:click=handle_confirm>Delete</button>
                </div>
            </div>
        </div>
    </div>
    }
}

#[component]
pub fn compoundModal( 
    #[prop(into)] show: RwSignal<bool>,
    #[prop(into)] on_close: Callback<()>,
) -> impl IntoView {
    view! { 
    }
}


#[component]
pub fn Projects() -> impl IntoView { 
    view! { 
        <NavBar /> 
        <div class="container">
            <div class="card mb-4">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 class="mb-0"><i class="bi bi-hexagon"></i> Manage Compounds</h4>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="paperFilter" class="form-label">Filter by Paper:</label>
                        <select class="form-select" id="paperFilter">
                            <option value="all">All Papers</option>
                            <!-- Papers will be loaded here dynamically -->
                        </select>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover w-100" id="compoundsTable">
                            <thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="10%">Structure</th>
                                    <th width="20%">SMILES</th>
                                    <th width="20%">InChI</th>
                                    <th width="20%">Chemical Data</th>
                                    <th width="15%">Paper</th>
                                    <th width="10%">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="compoundsTableBody">
                                <!-- Compounds will be loaded here dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    }
}
