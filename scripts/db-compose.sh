#!/usr/bin/env bash

# Runs docker compose for the local database, wiring up whichever root env files
# exist. Docker Compose errors on a missing --env-file, so only existing files
# are passed. Later files take precedence, matching Bun's `.env` < `.env.local`
# loading order.

set -eo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
compose_file="$repo_root/docker/docker-compose.local.yml"

env_file_args=()
for env_file in "$repo_root/.env" "$repo_root/.env.local"; do
	if [ -f "$env_file" ]; then
		env_file_args+=("--env-file" "$env_file")
	fi
done

exec docker compose "${env_file_args[@]}" -f "$compose_file" "$@"
