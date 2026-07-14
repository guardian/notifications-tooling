# Notification tooling

This prototype turns a Guardian article into a templated email and sends it through Braze.

## Development

The project uses [Bun](https://bun.com/). On macOS, install it with Homebrew:

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

To install dependencies for every workspace, run this from the repository root:

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

## Start the apps

Start the backend and frontend from the repository root:

```sh
bun run dev
```

The backend runs on `http://localhost:3000` and the frontend on `http://localhost:3001`.

Run the test suite with:

```sh
bun test
```

## Flow

1. The frontend sends a Guardian article URL to `POST /v1/notifications/guardian-article`.
2. The backend extracts the article ID and fetches its headline, standfirst, image and canonical URL from Guardian CAPI.
3. The frontend uses those fields to populate an editable draft and render an email preview.
4. The email template is stored as HTML in `src/packages/breaking-news-template/breaking-news-us-template.html`. The renderer replaces its named placeholders with the article content.
5. The frontend sends the edited draft to `POST /v1/notifications/braze-email`.
6. The backend renders the final HTML and sends it to Braze using `/campaigns/trigger/send`.

## Braze payload

The backend sends the subject and rendered HTML as shared trigger properties. The recipient is identified by email.

```json
{
	"campaign_id": "<BRAZE_CAMPAIGN_ID>",
	"trigger_properties": {
		"subject": "Breaking news: Example headline",
		"body": "<html>...rendered email...</html>"
	},
	"recipients": [
		{
			"email": "recipient@example.com",
			"prioritization": ["unidentified", "most_recently_updated"],
			"attributes": {
				"email": "recipient@example.com"
			},
			"send_to_existing_only": false
		}
	]
}
```

The Braze campaign reads the trigger properties with:

```liquid
{{api_trigger_properties.subject}}
{{api_trigger_properties.body}}
```
