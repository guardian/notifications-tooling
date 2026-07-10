# Notifications tooling monorepo

## Install dev tools

The DevX tooling relies on [Bun](https://bun.com/)

On Mac OS install its latest version using Homebrew:

```sh
brew install bun
```

## Biome as alternative to prettier and eslint

Biome acts as a formatter and linter all in a single package. Biome is highly configurable, is just as opinionated as prettier. We can add additional overrides to biome very easily when needed.

It's helpful to install VSCode, install Biome extension so that the file will be formatted on save. [Biome extension can be downloaded from here](https://marketplace.visualstudio.com/items?itemName=biomejs.biome).

## Install dependencies

To install the dependencies for every app, package etc, simply invoke this while current working dir is the root of the repo:

```sh
bun install
```

## Install biome formatter as pre-commit hook using `lefthook`

```sh
bunx lefthook install
```

Now biome will auto-format supported files as part of each `git commit` command run.

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