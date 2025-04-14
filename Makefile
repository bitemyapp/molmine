DATABASE_FILE=molmine.db
DATABASE_URL=sqlite://$(DATABASE_FILE)

build: build-backend build-frontend

build-backend:
	cargo build --features ssr

build-frontend:
	cargo build --features hydrate --target wasm32-unknown-unknown

migrate:
	diesel migration run --database-url $(DATABASE_URL)

delete-db:
	rm $(DATABASE_FILE)

reset-db: delete-db migrate

