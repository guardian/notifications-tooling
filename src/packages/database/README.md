# Database

## Overview

This package owns the local database schema, generated SQL migrations, Drizzle
configuration, and package-level database scripts.

- Schema: `src/packages/database/schema.ts`
- Migrations: `src/packages/database/migrations`
- Drizzle config: `src/packages/database/drizzle.config.ts`

## Environment

The Drizzle config loads `DATABASE_URL` from `.env` in this package directory.

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
