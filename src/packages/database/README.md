# Database

## Overview

This package owns the local database schema, generated SQL migrations, Drizzle
configuration, and package-level database scripts.

- Schema: `src/packages/database/schema.ts`
- Migrations: `src/packages/database/migrations`
- Drizzle config: `src/packages/database/drizzle.config.ts`

## Environment

Bun and local Docker load their environment variables from `.env` in this package directory when these
package scripts are run from `src/packages/database` or via Bun workspace
filtering from the repository root.(e.g running the `db:reset` command from root would be
`bun run --filter @database db:reset`).

If this file is not defined, the setup script will try to create it by copying `.env.example`.

Runtime and tooling load database configuration differently:

- The application runtime uses `runtime-db-config.ts`. In Lambda it fetches managed database credentials from Secrets Manager; outside Lambda it falls back to the local `DB_*` environment variables.
- Drizzle CLI tooling uses `drizzle.config.ts`, which always reads the local `DB_*` environment variables synchronously. This keeps migration commands compatible with Drizzle's config loader in local development and CI.

## Database migrations

Run the following commands from `src/packages/database`.

Create a migration:

```sh
bun run db:migration:create YOUR_MIGRATION_NAME
```

The wrapper validates the migration name, passes it to Drizzle, and writes the
generated SQL to `src/packages/database/migrations`.

Apply pending migrations:

```sh
bun run db:migration:apply
```

Reset the local database:

```sh
bun run db:reset
```

`db:reset` recreates the local Postgres container, removes local database
files, restarts Postgres, and applies pending migrations from this package.
