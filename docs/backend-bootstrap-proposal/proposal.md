# Backend monorepo bootstrap proposal

## Assumptions

Backend app can be developed and run using `Bun` (a Nodejs alternative) that supports Typescript OOTB transparently, does not need any package managing tools, has built in testing `bun:test` module, native Postgres driver, native built-in SQLite v3 binary built in, is super fast to run and iterate, and the best of all - compiles and bundles TS code into a single outfile, and optionally generating sourcemap, builds nodejs target code for various node versions.

## Monorepo structure

