use leptos::prelude::*;
use leptos_meta::{provide_meta_context, MetaTags, Stylesheet, Title};
use leptos_router::{
    components::{Route, Router, Routes},
    StaticSegment,
};

use crate::pages::*;

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                <AutoReload options=options.clone() />
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    // Provides context that manages stylesheets, titles, meta tags, etc.
    provide_meta_context();
    // Signal to control modal visibility
    let show_about_modal = RwSignal::new(false);
    let close_about_modal = move |_| show_about_modal.set(false);

    // Toggle function for the modal
    let toggle_about_modal = move |_| {
        println!("Toggling about modal visibility");
        show_about_modal.update(|show| *show = !*show);
    };

    // Inside your App component:
    Effect::new(move |_| {
        if show_about_modal.get() {
            document()
                .body()
                .unwrap()
                .class_list()
                .add_1("modal-open")
                .unwrap();
        } else {
            document()
                .body()
                .unwrap()
                .class_list()
                .remove_1("modal-open")
                .unwrap();
        }
    });
    view! {
        // injects a stylesheet into the document <head>
        // id=leptos means cargo-leptos will hot-reload this stylesheet
        <Stylesheet id="leptos" href="/pkg/molmine.css"/>

        // sets the document title
        <Title text="Welcome to Leptos"/>
        <NavBar toggle_about_modal=Callback::new(move |()| toggle_about_modal(())) />
        // Add the modal component here
        <AboutModal
            show=show_about_modal
            on_close=Callback::new(move |()| close_about_modal(()))
        />
        // content for this welcome page
        <Router>
            <main>
                <Routes fallback=|| "Page not found.".into_view()>
                    <Route path=StaticSegment("") view=HomePage/>
                    // <Route path=StaticSegment("about") view=AboutPage/>
                </Routes>
            </main>
        </Router>
    }
}

/// Renders the home page of your application.
#[component]
fn HomePage() -> impl IntoView {
    // Creates a reactive value to update the button
    view! {
       <div></div>
    }
}
