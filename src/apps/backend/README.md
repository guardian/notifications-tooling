# Backend

## Notification channel configuration

Copy the variable names from `.env.example` into the ignored `.env.local` file
and populate them with the environment values.

- `BRAZE_API_KEY` needs the Braze `campaigns.trigger.send` permission.
- `BRAZE_REST_ENDPOINT` is the Braze REST instance URL.
- `EMAIL_RENDERING_ENDPOINT` is the base URL of the email-rendering service.
- `PROVIDER_REQUEST_TIMEOUT_MS` limits each provider request and defaults to 10
  seconds.

UK, US, and AU newsletter labels, email-rendering newsletter IDs, and Braze
campaign IDs are configured in `src/packages/config/audiences.ts`. The public
segment key, display label, and downstream IDs are independent values. Campaign
IDs point to Braze dev environment test campaigns.

The app-notification client is currently a mock. It receives the translated
topic and content request but does not make a network call.

`POST /v1/notifications` validates and dispatches app-push requests to the mock
client. For newsletter segments it renders the selected article through
email-rendering and triggers the mapped Braze campaign.

## Database migrations

Drizzle schema lives in `src/apps/backend/db/schema.ts`, and generated SQL
migrations are stored in `src/apps/backend/db/migrations`.

The Drizzle config lives in `src/apps/backend/drizzle.config.ts`.

Create a migration from your schema changes from the repo root:

```sh
bun run db:migration:create add-notification-status
```

The wrapper passes the supplied name to Drizzle, which prefixes it with its own
timestamp and creates one directory per migration under
`src/apps/backend/db/migrations`.

Apply pending migrations from the repo root:

```sh
bun run db:migration:apply
```

The same scripts are also available from `src/apps/backend` via:

```sh
bun run db:migration:create add-notification-status
bun run db:migration:apply
```

## Test the notification endpoint

With the backend running on port 4000 and `.env.local` populated, run the
following request to test newsletter rendering and dispatch through the mapped
UK Braze dev campaign. This uses `dryRun: false`, so it makes real downstream
requests.

```sh
curl --include \
  --silent \
  --show-error \
  --fail-with-body \
  --request POST \
  'http://localhost:4000/v1/notifications' \
  --header 'Content-Type: application/json' \
  --data '{
    "idempotencyKey": "newsletter-live-2026-07-23-oil-price-01",
    "sender": "manual-e2e-test",
    "content": {
      "items": {
        "lead": {
          "type": "newsletter",
          "title": "Oil price test",
          "body": "Manual end-to-end newsletter test.",
          "link": "https://www.theguardian.com/business/2026/jul/23/oil-price-passes-100-a-barrel-again-as-middle-east-conflict-escalates"
        }
      }
    },
    "channels": {
      "newsletter": {
        "audience": {
          "type": "segment",
          "items": ["UK"]
        },
        "compose": {
          "items": ["lead"],
          "subject": "[TEST] Oil price newsletter rendering"
        }
      }
    },
    "options": {
      "dryRun": false,
      "scheduledFor": null
    }
  }'
```

The current email-rendering endpoint supports one article.
Direct test-email audiences, and scheduled delivery are rejected
until their downstream contracts are implemented. Dry runs are accepted without
calling either downstream client.
