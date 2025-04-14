DATABASE_FILE=src-tauri/src/molmine.db
DATABASE_URL="sqlite://$(DATABASE_FILE)"

dev: 
	cargo tauri dev

migrate:
	diesel migration run --database-url $(DATABASE_URL)

delete-db:
	rm $(DATABASE_FILE)

reset-db: delete-db migrate

