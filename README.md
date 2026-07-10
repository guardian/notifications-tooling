# Notifications tooling monorepo

## Install dev tools

The DevX tooling relies on [Bun](https://bun.com/)

On Mac OS install its latest version using Homebrew:

```sh
brew install bun
```

## Biome as alternative to prettier and eslint

Biome acts as a formatter and linter all in a single package. Biome is highly configurable, is just as opinionated as prettier. We can add additional overrides to biome very easily when needed.

It's helpful to install VSCode, install Biome extension so that the file will be formatted on save. https://marketplace.visualstudio.com/items?itemName=biomejs.biome

## Install dependencies

To install the dependencies for every app, and package, install npm dependencies on from the repo root:

```sh
bun install
```

## Start backend server app

Backend server app currently uses Express.js as its REST server. To start the backend app:

```sh
cd ./src/apps/backend-server
bun run dev
```

The server will restart seamlessly upon any file changed during it's code changes.

## Start frontend app

Frontend app uses React. To start the app:

```sh
cd ./src/apps/frontend
bun run dev
```