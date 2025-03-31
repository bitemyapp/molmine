DATABASE_URL=sqlite://molmine.db

build: build-backend build-frontend

build-backend:
	cargo build --features ssr

build-frontend:
	cargo build --features hydrate --target wasm32-unknown-unknown

migrate:
	diesel migration run --database-url $(DATABASE_URL)
