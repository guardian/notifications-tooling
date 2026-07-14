# Notifications tooling monorepo

## Install dev tools

The DevX tooling relies on [Bun](https://bun.com/)

On Mac OS install its latest version using Homebrew:

```sh
brew install bun
```

## Linting & formatting

This repo follows the [Guardian's linting recommendations](https://github.com/guardian/recommendations/blob/main/client-side.md#coding-style) using the shared department configs:

- [`@guardian/eslint-config`](https://github.com/guardian/csnx/tree/main/libs/%40guardian/eslint-config) for linting JavaScript, TypeScript and React (this bundles the TypeScript, React, hooks, a11y, imports and comments rule sets).
- [`@guardian/prettier`](https://github.com/guardian/csnx/tree/main/libs/%40guardian/prettier) for formatting.

ESLint is configured via [`eslint.config.js`](./eslint.config.js) (flat config). The React ruleset is scoped to the frontend app only.

Available scripts (run from the repo root):

```sh
# Lint everything
bun run lint

# Lint and auto-fix where possible
bun run lint:fix

# Format all files
bun run format

# Check formatting without writing
bun run format:check
```

Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) VSCode extensions to get inline linting and format-on-save.

## Install dependencies

To install the dependencies for every app, package etc, simply invoke this while current working dir is the root of the repo:

```sh
bun install
```

## Install lint & format checks as a git hook using `lefthook`

The git hooks are installed automatically after `bun install` via the `prepare`
script. If you ever need to (re)install them manually, run:

```sh
bunx lefthook install
```

Now, on each `git push`, ESLint and Prettier will check the files being pushed.

### To add dependencies

As we rely on Bun on pretty much everything here, to install npm modules we need to use bun. An example:

```sh
bun add some_npm_dependency

# dev dependency
bun add -D dev_dependency

# targetting a specific app, package etc
bun --filter @backend add some_npm_module
```

Bun will generate or update the existing `bun.lock` file, similar to `package-lock.json`.

## Docker compose

Should we require to rely on Postgres DB. There's a minimal working `./docker/docker-compose.local.yml` file and project root `package.json` contains two helper scripts to start & stop docker services.

To start services:

```sh
bun docker:compose:up
```

To stop them:

```sh
bun docker:compose:down
```

## Start backend server app

Backend server app currently uses Express.js as its REST server. To start the backend app:

```sh
cd ./src/apps/backend
bun run dev
```

The server will restart seamlessly upon any file changed during it's code changes.

## Start frontend app

Frontend app uses React. To start the app:

```sh
cd ./src/apps/frontend
bun run dev
```

## Running tests

To run tests in the scope of the entire project:

```sh
bun test
```

To run on a specific app or package there are couple of ways:

Having current working dir open inside that app:

```sh
cd ./src/apps/backend
bun test
```

Using workspace filters, ie:

```sh
bun --filter @backend test
```
