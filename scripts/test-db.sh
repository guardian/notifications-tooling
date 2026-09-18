#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
database_env_file="$repo_root/src/packages/database/.env"
scope="${1:-all}"

cd "$repo_root"

if [ -f "$database_env_file" ]; then
	set -a
	# shellcheck disable=SC1090
	source "$database_env_file"
	set +a
fi

: "${DB_NAME:?DB_NAME must be set}"

export DB_TEST_NAME="${DB_TEST_NAME:-${DB_NAME}_test}"

if [[ "$DB_TEST_NAME" != *_test ]]; then
	echo "DB_TEST_NAME must end with _test." >&2
	exit 1
fi

bun run --cwd src/packages/database scripts/ensure-test-database.ts
export DB_NAME="$DB_TEST_NAME"

case "$scope" in
	all)
		bun run --filter '*' test:db:run
		;;
	backend)
		bun run --cwd src/apps/backend test:db:run
		;;
	database)
		bun run --cwd src/packages/database test:db:run
		;;
	*)
		echo "Unknown database test scope: $scope" >&2
		exit 1
		;;
esac