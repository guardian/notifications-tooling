#!/usr/bin/env bash

# Creates the database migration artifact for Riff-Raff deployment.
#
# The artifact is a zip file containing:
#   - migrations/   — Drizzle SQL migration files and journal metadata
#   - drizzle.config.mjs — Plain-JS Drizzle config (no TypeScript compilation needed at deploy time)
#   - package.json  — Minimal package manifest for drizzle-kit
#   - node_modules/ — Pre-installed drizzle-kit, drizzle-orm, pg
#                     (dependencies are baked in during CI, not installed at deployment time)
#
# The artifact is placed at dist/database-migrations.zip and must be listed under the
# 'database-migrations' contentDirectory in the Riff-Raff upload step (see .github/workflows/ci.yml).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(realpath "${SCRIPT_DIR}/..")"
DATABASE_DIR="${ROOT_DIR}/src/packages/database"
OUTPUT_DIR="${ROOT_DIR}/dist/database-migrations"
OUTPUT_ZIP="${ROOT_DIR}/dist/database-migrations.zip"

echo "Creating database migration artifact..."

rm -rf "${OUTPUT_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Copy Drizzle migration files (SQL + journal metadata)
cp -r "${DATABASE_DIR}/migrations" "${OUTPUT_DIR}/migrations"

# Write a plain-JS Drizzle config so the artifact can run under Node.js without TypeScript.
# DATABASE_URL is injected at runtime from Secrets Manager via ECS task secrets.
cat > "${OUTPUT_DIR}/drizzle.config.mjs" <<'EOF'
import { defineConfig } from 'drizzle-kit';

// DATABASE_URL is injected at runtime as an ECS secret (******host:5432/dispatchdb).
// eslint-disable-next-line import/no-default-export
export default defineConfig({
	out: './migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
});
EOF

# Read pinned dependency versions from the workspace package manifests so the
# artifact stays in sync with the rest of the monorepo.
DRIZZLE_KIT_VERSION=$(jq -r '.devDependencies["drizzle-kit"]' "${DATABASE_DIR}/package.json")
DRIZZLE_ORM_VERSION=$(jq -r '.dependencies["drizzle-orm"]' "${DATABASE_DIR}/package.json")
PG_VERSION=$(jq -r '.dependencies["pg"]' "${DATABASE_DIR}/package.json")

cat > "${OUTPUT_DIR}/package.json" <<EOF
{
  "type": "module",
  "dependencies": {
    "drizzle-kit": "${DRIZZLE_KIT_VERSION}",
    "drizzle-orm": "${DRIZZLE_ORM_VERSION}",
    "pg": "${PG_VERSION}"
  }
}
EOF

echo "Installing dependencies into artifact (drizzle-kit ${DRIZZLE_KIT_VERSION}, drizzle-orm ${DRIZZLE_ORM_VERSION}, pg ${PG_VERSION})..."
(
	cd "${OUTPUT_DIR}"
	npm install --omit=dev --quiet
)

# Create the zip artifact
rm -f "${OUTPUT_ZIP}"
(
	cd "${OUTPUT_DIR}"
	zip -qr "${OUTPUT_ZIP}" .
)

echo "Created: ${OUTPUT_ZIP} ($(du -sh "${OUTPUT_ZIP}" | cut -f1))"
