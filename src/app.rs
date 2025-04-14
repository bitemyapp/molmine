use leptos::ev::{MouseEvent, SubmitEvent};
use leptos::*;
use leptos::{prelude::*, task::spawn_local};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "__TAURI__", "core"])]
    async fn invoke(cmd: &str, args: JsValue) -> JsValue;
}

#[derive(Serialize, Deserialize)]
struct GreetArgs<'a> {
    name: &'a str,
}

#[derive(Serialize, Deserialize)]
struct CounterArgs {
    count: i32,
}

#[component]
pub fn App() -> impl IntoView {
    let (name, set_name) = signal(String::new());
    let (greet_msg, set_greet_msg) = signal(String::new());

    let (count, set_count) = signal(0);

    let increase_me = move |ev: MouseEvent| {
        ev.prevent_default();
        spawn_local(async move {
            let count = count.get_untracked();
            let args = to_value(&CounterArgs { count }).unwrap();
            let new_value = invoke("increase", args).await.as_f64().unwrap();
            set_count.set(new_value as i32);
        });
    };

    let decrease_me = move |ev: MouseEvent| {
        ev.prevent_default();
        spawn_local(async move {
            let count = count.get_untracked();
            let args = to_value(&CounterArgs { count }).unwrap();
            let new_value = invoke("decrease", args).await.as_f64().unwrap();
            set_count.set(new_value as i32);
        });
    };

    let update_name = move |ev| {
        let v = event_target_value(&ev);
        set_name.set(v);
    };

    let greet = move |ev: SubmitEvent| {
        ev.prevent_default();
        spawn_local(async move {
            let name = name.get_untracked();
            if name.is_empty() {
                return;
            }

            let args = serde_wasm_bindgen::to_value(&GreetArgs { name: &name }).unwrap();
            // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
            let new_msg = invoke("greet", args).await.as_string().unwrap();
            set_greet_msg.set(new_msg);
        });
    };

    view! {
        <main class="container">
            <h1>"Welcome to Tauri + Leptos"</h1>

            <div class="row">
                <a href="https://tauri.app" target="_blank">
                    <img src="public/tauri.svg" class="logo tauri" alt="Tauri logo"/>
                </a>
                <a href="https://docs.rs/leptos/" target="_blank">
                    <img src="public/leptos.svg" class="logo leptos" alt="Leptos logo"/>
                </a>
            </div>
            <p>"Click on the Tauri and Leptos logos to learn more."</p>

            <form class="row" on:submit=greet>
                <input
                    id="greet-input"
                    placeholder="Enter a name..."
                    on:input=update_name
                />
                <button type="submit">"Greet"</button>
            </form>
            <p>{ move || greet_msg.get() }</p>

            <div class="row">
                <button on:click=decrease_me>"-1"</button>
                <button on:click=increase_me>"+1"</button>
            </div>
            <p class:red=move || (count() < 0) >
                     "Count: " {count}
            </p>
        </main>
    }
}
