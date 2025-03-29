use leptos::prelude::*;
use leptos_meta::{MetaTags, Stylesheet, Title, provide_meta_context};
use leptos_router::{
    StaticSegment,
    components::{Route, Router, Routes},
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
    let count = RwSignal::new(0);
    let on_click = move |_| *count.write() += 1;

    view! {
        <h1>"Welcome to Molmine!"</h1>
        <button on:click=on_click>"Click Me: " {count}</button>
        <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nec augue placerat, dignissim enim ut, hendrerit lorem. Quisque dui neque, rhoncus nec maximus sit amet, malesuada vel lectus. Sed molestie magna ut lectus feugiat, eget molestie mauris facilisis. Pellentesque lobortis arcu venenatis tincidunt tincidunt. Aliquam et porttitor enim, vitae sollicitudin lorem. Nullam ornare euismod ipsum et vestibulum. Proin fermentum mi et mauris finibus vestibulum. Mauris tortor quam, sodales ac elit in, scelerisque efficitur nulla. Quisque luctus auctor metus ut posuere. Praesent sed ligula sed lacus fermentum malesuada. Donec molestie mattis quam.
        </p>
        <p>
        Maecenas erat sapien, aliquam sed leo sed, condimentum ullamcorper urna. Mauris hendrerit vitae eros efficitur vestibulum. Vestibulum in iaculis nunc. Sed nec finibus nisl, eu euismod eros. Donec convallis ac ligula quis imperdiet. Vestibulum pharetra at magna eu laoreet. Ut quis diam a dolor tempor hendrerit et ut ligula. Donec quam felis, vulputate ut pulvinar et, hendrerit non massa. Pellentesque nec dapibus turpis, id rutrum orci. Donec egestas ut metus eu tristique. Proin id commodo magna. Proin purus lacus, sollicitudin nec fermentum vel, ornare sit amet quam.
        </p>
        <p>
        Aliquam vel lorem vestibulum, facilisis sem a, scelerisque nunc. Phasellus eu quam porta dui faucibus mollis. Nunc viverra elit quis sollicitudin fermentum. Pellentesque quis euismod leo. Quisque aliquet leo eros. Sed ac sapien arcu. Proin pulvinar ligula et porttitor faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In tincidunt ut ante maximus laoreet. Fusce suscipit gravida scelerisque.
        </p>
        <p>
        Morbi vehicula a eros eget sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu porta leo. Aliquam dictum mi quis nisi blandit, nec placerat risus tristique. Aliquam volutpat dui et sagittis lobortis. Sed pharetra ullamcorper convallis. Curabitur non velit consequat massa finibus condimentum eu blandit orci.
        </p>
        <p>
        Praesent id libero nulla. Vestibulum eleifend augue non nisi condimentum venenatis. Ut nec nunc sit amet ligula malesuada scelerisque nec eu dui. Nam maximus elit eu ligula ultrices ultrices. Donec lacinia massa dui, sed fermentum nisi bibendum nec. Praesent sollicitudin semper dolor eu commodo. Nam nulla mi, placerat in pulvinar eu, vehicula congue nulla. Sed sollicitudin arcu at elit accumsan, in mattis magna accumsan. Sed aliquet ultricies nisl non ornare. Sed id quam placerat, fermentum massa in, euismod velit. Morbi finibus sem ligula, porttitor tempus arcu ullamcorper eget. In lacus ligula, consequat a purus rutrum, bibendum aliquam dolor. Pellentesque tempus elit eu mi maximus dictum. Praesent ultrices porttitor purus, aliquam aliquet nisi hendrerit convallis.
        </p>
        <p>
        Maecenas erat sapien, aliquam sed leo sed, condimentum ullamcorper urna. Mauris hendrerit vitae eros efficitur vestibulum. Vestibulum in iaculis nunc. Sed nec finibus nisl, eu euismod eros. Donec convallis ac ligula quis imperdiet. Vestibulum pharetra at magna eu laoreet. Ut quis diam a dolor tempor hendrerit et ut ligula. Donec quam felis, vulputate ut pulvinar et, hendrerit non massa. Pellentesque nec dapibus turpis, id rutrum orci. Donec egestas ut metus eu tristique. Proin id commodo magna. Proin purus lacus, sollicitudin nec fermentum vel, ornare sit amet quam.
        </p>
        <p>
        Aliquam vel lorem vestibulum, facilisis sem a, scelerisque nunc. Phasellus eu quam porta dui faucibus mollis. Nunc viverra elit quis sollicitudin fermentum. Pellentesque quis euismod leo. Quisque aliquet leo eros. Sed ac sapien arcu. Proin pulvinar ligula et porttitor faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In tincidunt ut ante maximus laoreet. Fusce suscipit gravida scelerisque.
        </p>
        <p>
        Morbi vehicula a eros eget sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu porta leo. Aliquam dictum mi quis nisi blandit, nec placerat risus tristique. Aliquam volutpat dui et sagittis lobortis. Sed pharetra ullamcorper convallis. Curabitur non velit consequat massa finibus condimentum eu blandit orci.
        </p>
        <p>
        Praesent id libero nulla. Vestibulum eleifend augue non nisi condimentum venenatis. Ut nec nunc sit amet ligula malesuada scelerisque nec eu dui. Nam maximus elit eu ligula ultrices ultrices. Donec lacinia massa dui, sed fermentum nisi bibendum nec. Praesent sollicitudin semper dolor eu commodo. Nam nulla mi, placerat in pulvinar eu, vehicula congue nulla. Sed sollicitudin arcu at elit accumsan, in mattis magna accumsan. Sed aliquet ultricies nisl non ornare. Sed id quam placerat, fermentum massa in, euismod velit. Morbi finibus sem ligula, porttitor tempus arcu ullamcorper eget. In lacus ligula, consequat a purus rutrum, bibendum aliquam dolor. Pellentesque tempus elit eu mi maximus dictum. Praesent ultrices porttitor purus, aliquam aliquet nisi hendrerit convallis.
        </p>
        <p>
        Maecenas erat sapien, aliquam sed leo sed, condimentum ullamcorper urna. Mauris hendrerit vitae eros efficitur vestibulum. Vestibulum in iaculis nunc. Sed nec finibus nisl, eu euismod eros. Donec convallis ac ligula quis imperdiet. Vestibulum pharetra at magna eu laoreet. Ut quis diam a dolor tempor hendrerit et ut ligula. Donec quam felis, vulputate ut pulvinar et, hendrerit non massa. Pellentesque nec dapibus turpis, id rutrum orci. Donec egestas ut metus eu tristique. Proin id commodo magna. Proin purus lacus, sollicitudin nec fermentum vel, ornare sit amet quam.
        </p>
        <p>
        Aliquam vel lorem vestibulum, facilisis sem a, scelerisque nunc. Phasellus eu quam porta dui faucibus mollis. Nunc viverra elit quis sollicitudin fermentum. Pellentesque quis euismod leo. Quisque aliquet leo eros. Sed ac sapien arcu. Proin pulvinar ligula et porttitor faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In tincidunt ut ante maximus laoreet. Fusce suscipit gravida scelerisque.
        </p>
        <p>
        Morbi vehicula a eros eget sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu porta leo. Aliquam dictum mi quis nisi blandit, nec placerat risus tristique. Aliquam volutpat dui et sagittis lobortis. Sed pharetra ullamcorper convallis. Curabitur non velit consequat massa finibus condimentum eu blandit orci.
        </p>
        <p>
        Praesent id libero nulla. Vestibulum eleifend augue non nisi condimentum venenatis. Ut nec nunc sit amet ligula malesuada scelerisque nec eu dui. Nam maximus elit eu ligula ultrices ultrices. Donec lacinia massa dui, sed fermentum nisi bibendum nec. Praesent sollicitudin semper dolor eu commodo. Nam nulla mi, placerat in pulvinar eu, vehicula congue nulla. Sed sollicitudin arcu at elit accumsan, in mattis magna accumsan. Sed aliquet ultricies nisl non ornare. Sed id quam placerat, fermentum massa in, euismod velit. Morbi finibus sem ligula, porttitor tempus arcu ullamcorper eget. In lacus ligula, consequat a purus rutrum, bibendum aliquam dolor. Pellentesque tempus elit eu mi maximus dictum. Praesent ultrices porttitor purus, aliquam aliquet nisi hendrerit convallis.
        </p>
        <p>
        Maecenas erat sapien, aliquam sed leo sed, condimentum ullamcorper urna. Mauris hendrerit vitae eros efficitur vestibulum. Vestibulum in iaculis nunc. Sed nec finibus nisl, eu euismod eros. Donec convallis ac ligula quis imperdiet. Vestibulum pharetra at magna eu laoreet. Ut quis diam a dolor tempor hendrerit et ut ligula. Donec quam felis, vulputate ut pulvinar et, hendrerit non massa. Pellentesque nec dapibus turpis, id rutrum orci. Donec egestas ut metus eu tristique. Proin id commodo magna. Proin purus lacus, sollicitudin nec fermentum vel, ornare sit amet quam.
        </p>
        <p>
        Aliquam vel lorem vestibulum, facilisis sem a, scelerisque nunc. Phasellus eu quam porta dui faucibus mollis. Nunc viverra elit quis sollicitudin fermentum. Pellentesque quis euismod leo. Quisque aliquet leo eros. Sed ac sapien arcu. Proin pulvinar ligula et porttitor faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In tincidunt ut ante maximus laoreet. Fusce suscipit gravida scelerisque.
        </p>
        <p>
        Morbi vehicula a eros eget sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu porta leo. Aliquam dictum mi quis nisi blandit, nec placerat risus tristique. Aliquam volutpat dui et sagittis lobortis. Sed pharetra ullamcorper convallis. Curabitur non velit consequat massa finibus condimentum eu blandit orci.
        </p>
        <p>
        Praesent id libero nulla. Vestibulum eleifend augue non nisi condimentum venenatis. Ut nec nunc sit amet ligula malesuada scelerisque nec eu dui. Nam maximus elit eu ligula ultrices ultrices. Donec lacinia massa dui, sed fermentum nisi bibendum nec. Praesent sollicitudin semper dolor eu commodo. Nam nulla mi, placerat in pulvinar eu, vehicula congue nulla. Sed sollicitudin arcu at elit accumsan, in mattis magna accumsan. Sed aliquet ultricies nisl non ornare. Sed id quam placerat, fermentum massa in, euismod velit. Morbi finibus sem ligula, porttitor tempus arcu ullamcorper eget. In lacus ligula, consequat a purus rutrum, bibendum aliquam dolor. Pellentesque tempus elit eu mi maximus dictum. Praesent ultrices porttitor purus, aliquam aliquet nisi hendrerit convallis.
        </p>
        <p>
        Maecenas erat sapien, aliquam sed leo sed, condimentum ullamcorper urna. Mauris hendrerit vitae eros efficitur vestibulum. Vestibulum in iaculis nunc. Sed nec finibus nisl, eu euismod eros. Donec convallis ac ligula quis imperdiet. Vestibulum pharetra at magna eu laoreet. Ut quis diam a dolor tempor hendrerit et ut ligula. Donec quam felis, vulputate ut pulvinar et, hendrerit non massa. Pellentesque nec dapibus turpis, id rutrum orci. Donec egestas ut metus eu tristique. Proin id commodo magna. Proin purus lacus, sollicitudin nec fermentum vel, ornare sit amet quam.
        </p>
        <p>
        Aliquam vel lorem vestibulum, facilisis sem a, scelerisque nunc. Phasellus eu quam porta dui faucibus mollis. Nunc viverra elit quis sollicitudin fermentum. Pellentesque quis euismod leo. Quisque aliquet leo eros. Sed ac sapien arcu. Proin pulvinar ligula et porttitor faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In tincidunt ut ante maximus laoreet. Fusce suscipit gravida scelerisque.
        </p>
        <p>
        Morbi vehicula a eros eget sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu porta leo. Aliquam dictum mi quis nisi blandit, nec placerat risus tristique. Aliquam volutpat dui et sagittis lobortis. Sed pharetra ullamcorper convallis. Curabitur non velit consequat massa finibus condimentum eu blandit orci.
        </p>
        <p>
        Praesent id libero nulla. Vestibulum eleifend augue non nisi condimentum venenatis. Ut nec nunc sit amet ligula malesuada scelerisque nec eu dui. Nam maximus elit eu ligula ultrices ultrices. Donec lacinia massa dui, sed fermentum nisi bibendum nec. Praesent sollicitudin semper dolor eu commodo. Nam nulla mi, placerat in pulvinar eu, vehicula congue nulla. Sed sollicitudin arcu at elit accumsan, in mattis magna accumsan. Sed aliquet ultricies nisl non ornare. Sed id quam placerat, fermentum massa in, euismod velit. Morbi finibus sem ligula, porttitor tempus arcu ullamcorper eget. In lacus ligula, consequat a purus rutrum, bibendum aliquam dolor. Pellentesque tempus elit eu mi maximus dictum. Praesent ultrices porttitor purus, aliquam aliquet nisi hendrerit convallis.
        </p>
    }
}
