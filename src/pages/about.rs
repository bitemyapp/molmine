use leptos::prelude::*;

#[component]
pub fn AboutModal(
    #[prop(into)] show: RwSignal<bool>,
    #[prop(into)] on_close: Callback<()>,
) -> impl IntoView {
    view! {
        <div class="modal fade show" class:d-block=move || show.get() class:d-none=move || !show.get()
             tabindex="-1" role="dialog" aria-labelledby="aboutModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="aboutModalLabel">"About Paperbase"</h5>
                        <button type="button" class="btn-close btn-close-white"
                                on:click=move |_| on_close.run(())
                                aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h4>"Paperbase"</h4>
                        <p>"Paperbase helps researchers manage scientific papers and extract chemical compounds from them."</p>

                        <h5>"How to use:"</h5>
                        <ol>
                            <li>"Create or select a project from the Projects page"</li>
                            <li>"Upload a PDF with bibliographic information"</li>
                            <li>"Select a region containing a chemical structure"</li>
                            <li>"Use \"Recognize Structure\" to identify the molecule"</li>
                            <li>"Edit the structure if needed with the editor"</li>
                            // Add more content as needed
                        </ol>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"
                                on:click=move |_| on_close.run(())>"Close"</button>
                    </div>
                </div>
            </div>

            // Backdrop
            <div class="modal-backdrop fade show" on:click=move |_| on_close.run(())></div>
        </div>
    }
}

// #[component]
// pub fn AboutPage() -> impl IntoView {
//     view! {
//     <div class="modal fade" id="aboutModal" tabindex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
//         <div class="modal-dialog modal-lg">
//             <div class="modal-content">
//                 <div class="modal-header bg-primary text-white">
//                     <h5 class="modal-title" id="aboutModalLabel">About Paperbase</h5>
//                     <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
//                         aria-label="Close"></button>
//                 </div>
//                 <div class="modal-body">
//                     <h4>Paperbase</h4>
//                     <p>Paperbase helps researchers manage scientific papers and extract chemical compounds from them.</p>

//                     <h5>How to use:</h5>
//                     <ol>
//                         <li>Create or select a project from the Projects page</li>
//                         <li>Upload a PDF with bibliographic information</li>
//                         <li>Select a region containing a chemical structure</li>
//                         <li>Use "Recognize Structure" to identify the molecule</li>
//                         <li>Edit the structure if needed with the editor</li>
//                         <li>Enter chemical data values and save the compound</li>
//                     </ol>

//                     <h5>Features:</h5>
//                     <ul>
//                         <li>Project-based organization of research data</li>
//                         <li>Customizable chemical data fields for each project</li>
//                         <li>PDF management with bibliographic data</li>
//                         <li>Chemical structure recognition using DECIMER AI</li>
//                         <li>Interactive structure editing with RDKit</li>
//                         <li>Automatic SMILES and InChI generation</li>
//                         <li>Structure visualization</li>
//                     </ul>

//                     <h5>Project Repository:</h5>
//                     <p><a href="https://github.com/hpcdisrespecter/paperbase"
//                             target="_blank">
//                             https://github.com/hpcdisrespecter/paperbase <i class="bi bi-github"></i>
//                         </a>
//                     </p>
//                 </div>
//                 <div class="modal-footer">
//                     <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//                 </div>
//             </div>
//         </div>
//     </div>
//         }
// }
