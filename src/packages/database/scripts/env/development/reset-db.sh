#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
database_dir="$(cd "$script_dir/../../.." && pwd)"
repo_root="$(cd "$script_dir/../../../../../.." && pwd)"
compose_file="$repo_root/docker/docker-compose.local.yml"
compose_env_file="$database_dir/.env"
compose_env_example_file="$database_dir/.env.example"
bun_bin="${BUN_BIN:-$(command -v bun 2>/dev/null || true)}"

fail() {
	echo "$1" >&2
	exit 1
}

cd "$repo_root"

if [ ! -f "$compose_env_file" ]; then
	if [ ! -f "$compose_env_example_file" ]; then
		fail "Missing $compose_env_example_file; cannot create $compose_env_file."
	fi

	echo "No .env file found, creating one from .env.example..."
	cp "$compose_env_example_file" "$compose_env_file"
fi

echo "Recreating local database..."
docker compose --env-file "$compose_env_file" -f "$compose_file" down -v

echo "Removing database files..."
rm -rf "$repo_root/docker/postgres_data"

echo "Starting database..."
docker compose --env-file "$compose_env_file" -f "$compose_file" up -d --wait

echo "Applying migrations..."
cd "$database_dir"

if ! output=$("$bun_bin" run db:migration:apply 2>&1); then
	echo "$output" >&2
	fail "Failed to apply database migrations."
fi

echo "$output"

echo "Done."
