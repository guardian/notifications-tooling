#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
database_dir="$(cd "$script_dir/../../.." && pwd)"
repo_root="$(cd "$script_dir/../../../../../.." && pwd)"
compose_helper="$repo_root/scripts/db-compose.sh"
env_file="$repo_root/.env"
env_local_file="$repo_root/.env.local"
env_example_file="$repo_root/.env.example"
bun_bin="${BUN_BIN:-$(command -v bun 2>/dev/null || true)}"

fail() {
	echo "$1" >&2
	exit 1
}

cd "$repo_root"

if [ ! -f "$env_file" ] && [ ! -f "$env_local_file" ]; then
	if [ ! -f "$env_example_file" ]; then
		fail "Missing $env_example_file; cannot create $env_file."
	fi

	echo "No .env or .env.local found, creating .env from .env.example..."
	cp "$env_example_file" "$env_file"
fi

echo "Recreating local database..."
bash "$compose_helper" down -v

echo "Removing database files..."
rm -rf "$repo_root/docker/postgres_data"

echo "Starting database..."
bash "$compose_helper" up -d --wait

echo "Applying migrations..."
cd "$database_dir"

if ! output=$("$bun_bin" run db:migration:apply 2>&1); then
	echo "$output" >&2
	fail "Failed to apply database migrations."
fi

echo "$output"

echo "Done."
