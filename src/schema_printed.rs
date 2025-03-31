// @generated automatically by Diesel CLI.

diesel::table! {
    compounds (id) {
        id -> Nullable<Integer>,
        pdf_id -> Nullable<Integer>,
        smiles -> Nullable<Text>,
        inchi -> Nullable<Text>,
        image -> Nullable<Text>,
        chemical_data -> Nullable<Text>,
    }
}

diesel::table! {
    pdfs (id) {
        id -> Nullable<Integer>,
        title -> Nullable<Text>,
        authors -> Nullable<Text>,
        year -> Nullable<Integer>,
        journal -> Nullable<Text>,
        volume -> Nullable<Text>,
        data -> Nullable<Binary>,
    }
}

diesel::table! {
    project_data (key) {
        key -> Nullable<Text>,
        value -> Nullable<Text>,
    }
}

diesel::table! {
    projects (id) {
        id -> Nullable<Integer>,
        name -> Text,
        path -> Text,
        created_at -> Nullable<Timestamp>,
        fields -> Text,
    }
}

diesel::joinable!(compounds -> pdfs (pdf_id));

diesel::allow_tables_to_appear_in_same_query!(
    compounds,
    pdfs,
    project_data,
    projects,
);
