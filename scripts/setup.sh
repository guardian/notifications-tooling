#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$DIR/..
DATABASE_DIR="$ROOT_DIR/src/packages/database"
COMPOSE_ENV_FILE="$DATABASE_DIR/.env"
COMPOSE_ENV_EXAMPLE_FILE="$DATABASE_DIR/.env.example"

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
	if [ ! -f "$COMPOSE_ENV_FILE" ]; then
		if [ ! -f "$COMPOSE_ENV_EXAMPLE_FILE" ]; then
			echo "Missing $COMPOSE_ENV_EXAMPLE_FILE; cannot create $COMPOSE_ENV_FILE." >&2
			exit 1
		fi

		echo "No .env found, creating one from .env.example..."
		cp "$COMPOSE_ENV_EXAMPLE_FILE" "$COMPOSE_ENV_FILE"
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
