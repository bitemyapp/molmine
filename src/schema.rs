diesel::table! {
    compounds (id) {
        id -> Integer,
        pdf_id -> Integer,
        smiles -> Text,
        inchi -> Text,
        image -> Text,
        chemical_data -> Text,
    }
}

diesel::table! {
    pdfs (id) {
        id -> Integer,
        title -> Text,
        authors -> Text,
        year -> Integer,
        journal -> Text,
        volume -> Text,
        data -> Binary,
    }
}

diesel::table! {
    project_data (key) {
        key -> Nullable<Text>,
        value -> Text,
    }
}

diesel::table! {
    projects (id) {
        id -> Integer,
        name -> Text,
        path -> Text,
        created_at -> Nullable<Timestamp>,
        fields -> Text,
    }
}

diesel::joinable!(compounds -> pdfs (pdf_id));

diesel::allow_tables_to_appear_in_same_query!(compounds, pdfs, project_data, projects,);
