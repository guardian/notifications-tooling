# AGENTS.md — backend app

Guidance for AI agents working on the notifications broker backend
(`src/apps/backend`). Follow these rules for **every** change you make here.

## Definition of done

Implementing what the user asked for is only step one. A change is not complete
until you have also:

1. **Run the tests.** Execute `bun test` (from `src/apps/backend`) and make sure
   everything passes.
2. **Updated the tests.** If your change alters behaviour, adds a branch, or
   introduces new inputs/outputs, add or amend tests so they cover it. Do not
   leave stale assertions or untested code paths. New functionality ships with
   new tests.
3. **Kept the OpenAPI docs in sync.** After any change that touches request
   shapes, response shapes, validation rules, routes, or the config the schemas
   read from (e.g. `@config` allow-lists), verify the OpenAPI document still
   reflects reality. If it drifted, fix it. See "OpenAPI docs" below.
4. **Type-checked.** Run `tsc --noEmit` (`bun run typecheck`) and resolve any
   errors your change introduced.

Never report a task as finished without doing the above. If any of these reveal
follow-up work, do it or flag it explicitly.

## Naming

Use **clear, specific, self-documenting** names — never generic or loosely
defined ones.

- Prefer `appPushNotificationSegments`, `notificationChannelContentLimits`,
  `notificationSendRequestSchema` over `data`, `items`, `config`, `schema`,
  `result`, `temp`, `obj`, `value`.
- A reader should understand what a variable holds from its name alone, without
  tracing where it came from.
- Match the domain vocabulary already in the codebase (channels, segments,
  audiences, compose, plan) rather than inventing synonyms.
- Follow the repo's `@guardian/eslint-config` conventions: enums use PascalCase
  for the enum name and its members (e.g. `NotificationChannel.AppPushNotification`);
  module-level constants use camelCase (e.g. `newsletterSegments`). Do **not** use
  UPPER_SNAKE_CASE for consts/enums (except pre-existing exceptions like
  `MAX_AUDIENCE_SEGMENTS`).

## Comments

Comment sparingly — prefer self-documenting code (see "Naming") over narration.
Only add a comment when it carries information the code cannot:

- Context a reader can't infer locally: external services and their quirks
  (Braze, mobile-n10n, FCM/APNS), why a limit or value exists, links to specs
  (e.g. RFC 6901), or a non-obvious constraint (e.g. idempotency not yet
  persisted).
- A deliberate rule that isn't obvious from the code (e.g. the 400 vs 422
  split, Express's 4-arg error-handler signature).

Do **not** add comments that restate the code, label obvious sections
(`// --- Routes ---`), or duplicate a self-explanatory name or type. Keep the
comments you do write short. API-facing descriptions belong in Zod `.meta(...)`
/ OpenAPI, not in code comments.

## OpenAPI docs

The OpenAPI document is served by Swagger UI at `/docs/api` and lives under
`routers/docs/openapi`. It **must stay split into small, single-purpose files**
so schemas and responses are reusable and easy to find. Do not inline large
blobs or collapse these into one file.

Structure to preserve and extend:

- `openapi/index.ts` — assembles `info`, `paths`, and `components` only.
- `openapi/paths/` — **one file per route** (e.g. `notifications.ts`,
  `health.ts`), re-exported from `paths/index.ts` keyed by route. Path files
  reference schemas by `$ref`; they must not define schema bodies inline.
- `openapi/components/schemas/` — **one file per schema**, re-exported from
  `schemas/index.ts` and registered under a named key so it is addressable via
  `#/components/schemas/<Name>`.
  - Request bodies, response payloads, and shared/nested objects each get their
    own named schema so they can be `$ref`-ed and reused, not duplicated.
  - Derive schemas from the Zod source of truth where one exists
    (`z.toJSONSchema(...)`) so the docs cannot drift from validation. Prefer
    extending the Zod schema (descriptions/examples via `.meta(...)`) over
    hand-writing JSON Schema.

When you add or change an endpoint:

- Add/point to the request body schema as a named component and `$ref` it.
- Give **every** response status its own named response-payload schema (success
  and error alike) and `$ref` it — do not inline response bodies in the path
  file.
- Add examples that reflect real, valid values (e.g. real segment ids from
  `@config`), not placeholders.

## Quick commands

Run from `src/apps/backend`:

- `bun test` — run the test suite.
- `bun run typecheck` — type-check without emitting.
- `bun run dev` — run the server locally with hot reload.
