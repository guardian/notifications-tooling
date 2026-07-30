#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../../../../.." && pwd)"
compose_file="$repo_root/docker/docker-compose.local.yml"
bun_bin="${BUN_BIN:-$(command -v bun 2>/dev/null || true)}"

if [[ -z "$bun_bin" ]]; then
	echo "Bun is required to apply database migrations. Install it or run this script via 'bun run db:reset'." >&2
	exit 1
fi

cd "$repo_root"

echo "Recreating local database..."
docker compose -f "$compose_file" down -v

echo "Removing database files..."
rm -rf "$repo_root/docker/postgres_data"

echo "Starting database..."
docker compose -f "$compose_file" up -d --wait

echo "Applying migrations..."
cd "$repo_root/src/apps/backend"
"$bun_bin" run db:migration:apply

echo "Done."