# Backend

## Notification channel configuration

Copy the variable names from `.env.example` into the ignored `.env.local` file
and populate them with the environment values.

- `BRAZE_API_KEY` needs the Braze `campaigns.trigger.send`, `users.track`, and
  `messages.send` permissions.
- `BRAZE_REST_ENDPOINT` is the Braze REST instance URL.
- `BRAZE_APP_ID` identifies the Braze app used for direct test emails.
- `BRAZE_TEST_EMAIL_FROM` is the approved sender used for direct test emails. It
  defaults to `dev testing <dev-testing@email.theguardian.com>`.
- `BRAZE_TEST_EMAIL_REPLY_TO` is an email address or Braze's `NO_REPLY_TO`
  sentinel. It defaults to `NO_REPLY_TO`, which omits the Reply-To header.
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

## Test email behaviour

The current email-rendering endpoint supports one article. During pre-production
testing, test-email audiences accept any syntactically valid email address, with
up to 20 recipients per request, and one or more newsletter segments. Access
remains protected by Panda authentication and the `dispatch_access` permission;
the recipient policy must be reviewed before production. Each selected segment
is rendered and sent through Braze's `/messages/send` endpoint; the production
campaign is not triggered. Recipient addresses are normalized to lowercase.
After all selected segments render, the client creates or updates the
stable alias-only test profiles once under the `dispatch-tool-test-email` alias
label through `/users/track`, then sends each rendered variant. Braze matches
that alias, not an existing profile's email, so a separate same-email test
profile may be created intentionally. Braze
processes profile updates asynchronously, so the first send to a new address may
not be delivered until the profile has propagated; subsequent sends reuse the
same alias. Dispatch intentionally sends immediately without a fixed delay or
automatic retry. A successful API response confirms Braze accepted the calls,
not inbox delivery. If a first send does not arrive, allow time for the new
profile to propagate before retrying.

See the [Braze test email send flow](../../../docs/braze/braze-test-email-send-flow.md)
for the runtime sequence and failure behaviour, and
[Braze test email delivery options](../../../docs/braze/braze-test-email-delivery-options.md)
for the alternatives and rationale. Scheduled delivery is rejected until its
downstream contract is implemented. Dry runs are accepted without calling either
downstream client.
