# Backend

## Notification channel configuration

Copy the variable names from `.env.example` into the ignored `.env.local` file
and populate them with the CODE environment values.

- `BRAZE_API_KEY` needs the Braze `campaigns.trigger.send` permission.
- `BRAZE_REST_ENDPOINT` is the Braze REST instance URL.
- `EMAIL_RENDERING_ENDPOINT` is the base URL of the email-rendering service.

UK, US, and AU newsletter labels and their Braze campaign IDs are configured in
`src/packages/config/audiences.ts`. Campaign IDs contain placeholder values until
the real values are populated.

The app-notification client is currently a mock. It receives the translated
topic and content request but does not make a network call.

`POST /v1/notifications` validates and dispatches app-push requests to the mock
client. For newsletter segments it renders the selected article through
email-rendering and triggers the mapped Braze campaign.

The current email-rendering endpoint supports one article. Multi-item
newsletters, direct test-email audiences, and scheduled delivery are rejected
until their downstream contracts are implemented. Dry runs are accepted without
calling either downstream client.
