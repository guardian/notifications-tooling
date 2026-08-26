#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$DIR/..
ENV_FILE="$ROOT_DIR/.env"
ENV_LOCAL_FILE="$ROOT_DIR/.env.local"
ENV_EXAMPLE_FILE="$ROOT_DIR/.env.example"

setupNginx() {
	echo "Setting up Nginx"
	dev-nginx setup-app "$ROOT_DIR/dev-nginx.yaml"
}

setupBun() {
	echo "Installing packages with Bun"
	bun install
}

setupPostgres() {
	echo "Setting up Postgres"
	if [ ! -f "$ENV_FILE" ] && [ ! -f "$ENV_LOCAL_FILE" ]; then
		if [ ! -f "$ENV_EXAMPLE_FILE" ]; then
			echo "Missing $ENV_EXAMPLE_FILE; cannot create $ENV_FILE." >&2
			exit 1
		fi

		echo "No .env or .env.local found, creating .env from .env.example..."
		cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
	fi
	bun run db:start
}

runDatabaseMigrations() {
	echo "Running database migrations"
	bun run --filter @database db:migration:apply
}

setupNginx
setupBun
setupPostgres
runDatabaseMigrations

echo "Set up complete! You can now run the application."
