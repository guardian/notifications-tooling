# Backend

See the [root README](../../../README.md#run-locally) for how to run this app
locally, including the login tool and permissions setup required for authorised
endpoints.

## Notification channel configuration

Locally, notification channel configuration is read from the CODE SSM namespace
using the `composer` AWS profile. Fetch fresh Composer credentials through Janus
before starting the backend. An ignored `.env.local` file may define any of the
variables in `.env.example` when a local override is needed.

- `BRAZE_API_KEY` needs the Braze `campaigns.trigger.send`, `users.track`, and
  `messages.send` permissions.
- `BRAZE_REST_ENDPOINT` is the Braze REST instance URL.
- `BRAZE_APP_ID` identifies the Braze app used for direct test emails.
- `BRAZE_TEST_EMAIL_FROM` is the approved sender used for direct test emails. It
  defaults to `dev testing <dev-testing@email.theguardian.com>`.
- `BRAZE_TEST_EMAIL_REPLY_TO` is an email address or Braze's `NO_REPLY_TO`
  sentinel. It defaults to `NO_REPLY_TO`, which omits the Reply-To header.
- `EMAIL_RENDERING_ENDPOINT` is the base URL of the email-rendering service.

UK, US, and AU newsletter labels, email-rendering newsletter IDs, and Braze
campaign IDs are configured in `src/packages/config/audiences.ts`. The public
segment key, display label, and downstream IDs are independent values. Campaign
IDs point to Braze dev environment test campaigns.

The mobile-n10n client receives the translated topic and content request and
posts it to mobile-n10n's `POST /push/topic`.

`POST /v1/notifications` validates and dispatches app-push requests to the
mobile-n10n client. For newsletter segments it renders the selected article
through email-rendering and triggers the mapped Braze campaign.

## Test email behaviour

`POST /v1/notification-tests` accepts any syntactically valid email address,
with up to 20 recipients per request. The plan's `variants` field selects one or
more newsletter rendering configurations. The current email-rendering
endpoint supports one article. Access remains protected by Panda authentication
and the `dispatch_access` permission; the recipient policy must be reviewed
before production. Each selected variant is rendered and sent through Braze's
`/messages/send` endpoint; the production campaign is not triggered. Recipient
addresses are normalized to lowercase.
After all selected variants render, the client creates or updates the
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
for the alternatives and rationale. Scheduled delivery is not accepted by the
test endpoint. A dry run renders every selected variant without registering
recipients or sending messages through Braze.
