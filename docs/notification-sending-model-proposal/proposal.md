# Suggested model to send notifications independent of channel or category

**Definitions**:

- SPA Frontend: React app + Guardian/Stand UI elements
- Backend App: Nodejs app. Expected to be a standalone EC2 instance, maybe with additional worker Lambda functions triggered by SQS per-channel notification push queues

**Assumption**:

- SPA communicates with the backend service via RESTful API
- Backend service acts as a broker, not a sender service
- Backend service should do 3 things: **authenticate**, **validate** and **translate** requests to other services
- Neither the SPA or Backend will handle any reader/customer data - any data defining an audience shall be by reference to group identifier and/or parameters such as the Braze segment ids rather than by listing specific individuals (other than for sending test messages to internal guardian users)
- Initial version of the application:
  - SPA requests are provided in an channel-agnostic envelope and then is translated by the backend into each downstream service's native contract, the end service(s) are called synchronously. Hence, most probably v1 of the app will have a different `POST /v1/notifications` response structure on HTTP 2XX response code.
- Nice to have ultimate setup:
  - SPA requests are provided in an channel-agnostic envelope and then is translated by the backend into each downstream service's native contract, and fanned out / tracked the dispatch
    - It never talks to APNs/FCM/Braze directly — it creates a number of per-channel specific SQS queues, where each per-channel SQS queue messages invoke their corresponding Lambda functions that are communicating with mobile-n10n, Braze etc

## Suggested Backend RESTful endpoints

- `GET | POST | DELETE /v1/user` - Expose ability to change test email address and test device token (if makes sense and relatively easy to extract one). Nice to have, instead of must have.
- `GET /v1/channels/audiences` - Ability to retrieve newsletter segments, push notification topics
- `GET /v1/channels/constraints` - Retrieves per-channel validation rules/constrains
- `GET /v1/notifications` - Retrieves a list of already enqueued notifications
- `POST /v1/notifications` - Validate and enqueue notification to be pushed out to every requested channel
- `GET /v1/notifications/abc123.../status` - Returns enqueued notification status having delivery statuses exposed for each supported channel

## Suggested backend architecture to support the model

- Persistence layer (Postgres?)
  - Notifications table. Contains valid request payloads, createdAt, updatedAt.
  - Notification-channel Enqueue table - contains log on external service call history, call Attempt history, retry history
  - Audit table: User actions log, request made, request payload, userId, timestamp
  - (Maybe) ACL table(s) containing user permissions
- SQS and their DLQ queues
  - Backend app upon a valid push invocation fans out `push` event to every requested channel (ie. newsletter adapter, mobile-app adapter, etc). A worker lambda attached to listen to the per channel SQS queue then tries to invoke external service
  - A retry and attempt outcome should be stored as a timestamped metadata row associated to the main notification idempotency key
  - AWS Alert on new items added to the DLQ should be implemented to raise service quality stats

## Suggested backend RESTful endpoints

### Channel constraints

Request:

```jsonc
// GET /v1/channels/constraints -> the SPA fetches this to drive its UI (char counters, etc.)
{
  "push": {
    "title": { "maxLength": 50, "onExceed": "reject" },
    "body": { "maxLength": 150, "onExceed": "truncate", "ellipsis": "…" },
    "supports": ["title", "body", "link", "media.imageUrl"], // no multi-item, no subject
  },
  "newsletter": {
    "subject": { "maxLength": 120, "onExceed": "reject" },
    "supports": ["items", "template", "subject"], // multi-item allowed
    "maxItems": 12,
  },
}
```

### Creating a notification push intent

Request:

```jsonc
// POST /v1/notifications
{
  "idempotencyKey": "morning-briefing-2026-07-08", // request-level; see idempotency note below
  "category": "editorial",
  "priority": "standard",

  // WHAT — a LIBRARY of reusable, channel-neutral content items
  // Plans below pick which item(s) to use, so one article can feed push while
  // several articles feed the newsletter — from a single request.
  "content": {
    "items": {
      "lead": {
        "title": "Ukraine summit begins",
        "body": "World leaders gather in Geneva as talks open...",
        "link": {
          "type": "guardianContent",
          "contentApiId": "world/2026/jul/08/ukraine-summit",
        },
        "media": {
          "type": "image",
          "imageUrl": "https://.../lead.jpg",
          "thumbnailUrl": "https://.../thumb.jpg",
        },
      },
      "secondary": {
        "title": "Markets react to summit news",
        "body": "The FTSE rose 1.2% in early trading...",
        "link": {
          "type": "guardianContent",
          "contentApiId": "business/2026/jul/08/markets",
        },
      },
      "opinion": {
        "title": "What the summit means for Europe",
        "body": "Our chief correspondent analyses...",
        "link": {
          "type": "guardianContent",
          "contentApiId": "commentisfree/2026/jul/08/europe",
        },
      },
    },
  },

  // WHERE — an ARRAY OF PLANS. Each plan is self-contained: its own channel,
  // its own audience, and its own content selection.
  // Multiple plans = multi-channel in one request.
  "channels": [
    {
      "channel": "push",
      "audience": {
        "type": "topic",
        "topics": [{ "type": "breaking", "name": "uk" }],
      },
      "compose": { "use": "lead" }, // push takes ONE item only
      "overrides": { "importance": "Major" },
    },
    {
      "channel": "newsletter",
      "audience": {
        "type": "segment",
        "segments": [
          { "name": "morning-briefing-subscribers" },
          { "name": "editorial-something-something" },
        ],
      },
      "compose": {
        // newsletter assembles MANY items
        "layout": "digest",
        "items": ["lead", "secondary", "opinion"],
        "subject": "Your morning briefing: Ukraine summit",
      },
    },
  ],

  "options": { "dryRun": false, "scheduledFor": null },
  "sender": "notifications-tooling-spa/v1", // consumer of the backend api (constant)
}
```

Response:

```jsonc
// 202 Accepted
{
  "notificationId": "a1b2c3d4-...",
  "status": "accepted",
  "plans": [
    { "channel": "push", "planId": "…#push", "status": "accepted" },
    { "channel": "newsletter", "planId": "…#newsletter", "status": "accepted" },
  ],

  // Status URL
  "statusUrl": "/v1/notifications/a1b2c3d4-.../status",

  // Ability to cancel notification send off before the `expiresAt` value
  "cancellable": {
    "cancelUrl": "/v1/notifications/a1b2c3d4-.../cancel",
    "expiresAt": "<unix_timestamp>",
  },
}
```

NOTE: Having a persistence layer, the `notificationId` is what gets generated on the persistence layer by our backend. As the multiple channels are called later on, each channel successful response will provide its own internal unique identifier. As such, in this case, the backend then updates the `notificationId` row with channel's UID in appropriate column or a nested table such as `notifications_channel_push_attempts`, this way we'd be able to log and track each attempt/retry individually and report back to the SPA accordingly.

```jsonc
// Retry of an already-submitted idempotencyKey where `push` succeeded earlier
// but `newsletter` had failed. HTTP 202 Accepted.
{
  "notificationId": "a1b2c3d4-...",
  "status": "accepted", // request-level: accepted for (re)processing
  "plans": [
    {
      "channel": "push",
      "planId": "a1b2c3d4-...#push",
      "status": "duplicate_ignored",
    },
    {
      "channel": "newsletter",
      "planId": "a1b2c3d4-...#newsletter",
      "status": "retrying",
    },
  ],
  "statusUrl": "/v1/notifications/a1b2c3d4-.../status",
}
```

### Test push (fixed recipients)

Note: We'll need to keep a list of device tokens somewhere attached as a list of recipients to a user's profile or app profile. A list of user friendly device name to device token would be more sensible from users' perspective and would allow us to validate whether device tokens are in our allow-list.

```jsonc
{
  "channel": "push",
  "audience": {
    "type": "test",
    "recipients": [
      { "deviceToken": "fZ9x...APNS_token...", "platform": "ios" },
      { "deviceToken": "eH2k...FCM_token...", "platform": "android" },
    ],
  },
  "compose": { "use": "lead" }, // push still takes ONE item
  "overrides": { "importance": "Major" },
}
```

### Test newsletter (fixed recipients)

Note: We'll need to keep a list of emails somewhere attached as a list of recipients to a user's profile or app profile. A list of user friendly device name to device token would be more sensible from users' perspective and would allow us to validate whether device tokens are in our allow-list.

Note: The emails persisted in the allow-list will have to be pre-validated so only internal Guardian user emails can be used.

```jsonc
{
  "channel": "newsletter",
  "audience": {
    "type": "test",
    "recipients": [
      { "email": "editor@guardian.co.uk" },
      { "email": "qa@guardian.co.uk" },
    ],
  },
  "compose": {
    "layout": "digest",
    "items": ["lead", "secondary", "opinion"],
    "subject": "[TEST] Your morning briefing: Ukraine summit",
  },
}
```

One important guard: the **retry body must be semantically equal** (same content + plans) (deep object equality test). If the same idempotencyKey arrives with a different payload, that's a client bug, and we should reject it rather than silently send the old or new version — see the 409 case in the errors below. This is standard idempotency-key hygiene and prevents a whole class of "why did it send the wrong thing" incidents.

NOTE: We need to be careful about situations such as `{ subject: "123" }` and `{ subject: "123", scheduled: null }` incoming request payloads will **NEED** to be treated as equal. To guarantee this, we'll need to carefully consider initialising attribute values with correct defaults. Only this way both payloads will pass deep object equality as both input payloads will produce identical final payload **AFTER** the validation stage.

### Validation error format

Use 422 Unprocessable Entity for semantic/business validation failures (well-formed JSON, but content is invalid — length limits, unknown item refs, bad cross-field combos) and 400 Bad Request for structurally malformed requests (missing required field, wrong type, unparseable JSON). Return all errors at once (don't fail on the first) so the SPA can highlight every field in one pass.

A single, consistent envelope with a machine-readable `code`, a JSON-Pointer path, and a human `message`:

Response:

```jsonc
// HTTP 422 Unprocessable Entity — multiple problems across the payload
{
  "error": "validation_failed",
  "message": "The notification request failed validation. See details.",
  "requestId": "req-7f3a...", // for log correlation
  "details": [
    {
      "code": "MAX_LENGTH_EXCEEDED",
      "path": "/content/items/lead/title",
      "message": "title exceeds the 50-character limit for channel 'push' (was 63).",
      "meta": {
        "channel": "push",
        "field": "title",
        "maxLength": 50,
        "actualLength": 63,
      },
    },
    {
      "code": "UNKNOWN_CONTENT_REF",
      "path": "/channels/1/compose/items/2",
      "message": "compose references content item 'opinion' which is not defined in content.items.",
      "meta": { "ref": "opinion" },
    },
    {
      "code": "TOO_MANY_ITEMS",
      "path": "/channels/1/compose/items",
      "message": "newsletter layout 'digest' allows at most 12 items (got 15).",
      "meta": { "channel": "newsletter", "maxItems": 12, "actualItems": 15 },
    },
    {
      "code": "UNSUPPORTED_COMPOSE_FOR_CHANNEL",
      "path": "/channels/0/compose",
      "message": "channel 'push' takes a single item via 'use'; 'items[]' is not supported.",
      "meta": { "channel": "push" },
    },
    {
      "code": "AUDIENCE_FIELD_MISMATCH",
      "path": "/channels/0/audience",
      "message": "audience.type 'userId' requires 'userIds' but 'topics' was provided.",
      "meta": { "type": "userId", "expected": "userIds", "got": "topics" },
    },
    {
      "code": "TEST_RECIPIENT_INCOMPLETE",
      "path": "/channels/1/audience/recipients/0",
      "message": "a test recipient with 'deviceToken' must also specify 'platform' (ios|android).",
      "meta": { "missing": "platform" },
    },
    {
      "code": "CHANNEL_AUDIENCE_INCOMPATIBLE",
      "path": "/channels/1/audience/recipients/1",
      "message": "a 'deviceToken' recipient is not valid for channel 'newsletter'.",
      "meta": { "channel": "newsletter", "recipientKind": "deviceToken" },
    },
  ],
}
```

Structural (schema) failures return 400 with the same envelope but schema-level codes:

Response:

```jsonc
// HTTP 400 Bad Request — structurally invalid (fails before business validation)
{
  "error": "bad_request",
  "message": "The request body is malformed.",
  "requestId": "req-9c1d...",
  "details": [
    {
      "code": "MISSING_REQUIRED_FIELD",
      "path": "/idempotencyKey",
      "message": "idempotencyKey is required.",
    },
    {
      "code": "INVALID_TYPE",
      "path": "/channels",
      "message": "channels must be a non-empty array of plan objects.",
      "meta": { "expected": "array", "got": "object" },
    },
    {
      "code": "INVALID_ENUM_VALUE",
      "path": "/channels/0/channel",
      "message": "unknown channel 'telegram'. Supported: push, newsletter.",
      "meta": { "got": "telegram", "allowed": ["push", "newsletter"] },
    },
  ],
}
```

And the idempotency-conflict case (same key, different body) mentioned above:

Response:

```jsonc
// HTTP 409 Conflict — key reused with a different payload
{
  "error": "idempotency_key_conflict",
  "message": "idempotencyKey 'morning-briefing-2026-07-08' was already used with a different request body.",
  "requestId": "req-2b8e...",
  "meta": {
    "notificationId": "a1b2c3d4-...",
    "originalRequestHash": "sha256:9f2c...",
    "submittedRequestHash": "sha256:4a71...",
  },
}
```

Missing/invalid auth: 401 / 403 HTTP status code

| Scenario                                | HTTP          | Key field(s)                            |
| --------------------------------------- | ------------- | --------------------------------------- |
| New request accepted                    | `202`         | all plans `accepted`                    |
| Partial retry (some plans already sent) | `202`         | mix of `duplicate_ignored` / `retrying` |
| Full duplicate (nothing to do)          | `202`         | all plans `duplicate_ignored`           |
| Semantic/business validation failure    | `422`         | `error: validation_failed`, `details[]` |
| Structurally malformed body             | `400`         | `error: bad_request`, `details[]`       |
| Same key, different payload             | `409`         | `error: idempotency_key_conflict`       |
| Missing/invalid auth                    | `401` / `403` | —                                       |

## External service contracts

### Braze.com payload example

The SQS message to `membership-workflow` (recommended integration point).

This is what most Guardian producers emit. Our Newsletter Adapter Lambda writes this JSON to the `braze-emails-<stage>` SQS queue. Shape from [`BrazeSqsMessage.scala`](https://github.com/guardian/support-service-lambdas/blob/main/handlers/batch-email-sender/src/main/scala/com/gu/batchemailsender/api/batchemail/BrazeSqsMessage.scala#L67-L131) and the [README example](https://github.com/guardian/support-service-lambdas/blob/main/handlers/batch-email-sender/README.md#L244-L263):

```jsonc
// → SQS: braze-emails-PROD
{
  "To": {
    "Address": "reader@example.com",
    "SubscriberKey": "reader@example.com",
    "ContactAttributes": {
      "SubscriberAttributes": {
        // becomes Braze trigger_properties (personalisation)
        "first_name": "Ada",
        "subject": "Your morning briefing: Ukraine summit",
        // multi-article digest is flattened into fields the template renders:
        "article_1_title": "Ukraine summit begins",
        "article_1_url": "https://www.theguardian.com/world/2026/jul/08/ukraine-summit",
        "article_2_title": "Markets react to summit news",
        "article_2_url": "https://www.theguardian.com/business/2026/jul/08/markets",
        "article_3_title": "What the summit means for Europe",
        "article_3_url": "https://www.theguardian.com/commentisfree/2026/jul/08/europe",
      },
    },
  },
  "DataExtensionName": "morning-briefing", // logical email/campaign name → mapped to a Braze campaign_id in membership-workflow config
  "SfContactId": null, // optional Salesforce contact id
  "IdentityUserId": "100002073", // Guardian identity id (Braze external_user_id)
  "recordId": "a1b2c3d4-...#newsletter", // our plan id — great for traceability
}
```

Key fields ([`BrazeSqsMessage`](https://github.com/guardian/support-service-lambdas/blob/main/handlers/batch-email-sender/src/main/scala/com/gu/batchemailsender/api/batchemail/BrazeSqsMessage.scala#L67-L74)): `To.Address`, `To.SubscriberKey`, `To.ContactAttributes.SubscriberAttributes` (the personalisation map), `DataExtensionName` (the logical email name), `SfContactId?`, `IdentityUserId?`, `recordId`.

### The `mobile-n10n` payload example

`mobile-n10n` exposes a `POST /push/topic` endpoint (in the [`notification`](https://github.com/guardian/mobile-n10n/blob/main/notification/app/notification/controllers/Main.scala#L67) service, handler `Main.pushTopics`). Consumers call it over HTTPS with:

- **Method / path:** `POST /push/topic`
- **Auth header:** `Authorization: Bearer <apiKey>` — the key is checked against a configured allow-list, and **the key also scopes which topic _types_ we may push to** (e.g. Newsstand is restricted to specific keys). See [`NotificationAuthAction`](https://github.com/guardian/mobile-n10n/blob/main/notification/app/notification/authentication/NotificationAuthAction.scala#L1-L24).
- **Content-Type:** `application/json; charset=utf-8`
- **Body:** a single JSON `NotificationPayload`, discriminated by a `type` field.

Confirmed by the internal callers, e.g. [`NotificationsApiClient`](https://github.com/guardian/mobile-n10n/blob/main/football/src/main/scala/com/gu/mobile/notifications/football/lib/NotificationsApiClient.scala#L22-L31) (`$host/push/topic`, `Authorization: Bearer …`) and [`fakebreakingnews/NotificationClient`](https://github.com/guardian/mobile-n10n/blob/main/fakebreakingnewslambda/src/main/scala/fakebreakingnews/NotificationClient.scala#L34-L52).

## Endpoint rules the controller enforces

From [`Main.pushTopics`](https://github.com/guardian/mobile-n10n/blob/main/notification/app/notification/controllers/Main.scala#L67-L76):

- **Topic list must be non-empty** → empty list returns `400 "Empty topic list"`.
- **Maximum 20 topics** → more returns `400 "Too many topics, maximum: 20"`.
- **Every topic type must be permitted for your API key**, else `Unauthorized`.
- On success it returns **`201 Created`** with a JSON body `{ "id": "<uuid>" }` ([`PushResult`](https://github.com/guardian/mobile-n10n/blob/main/notification/app/notification/models/PushResult.scala#L9-L17)).

## The payload shape

`NotificationPayload` is a sealed hierarchy — the `type` string selects the variant ([`NotificationPayloadType`](https://github.com/guardian/mobile-n10n/blob/main/api-models/src/main/scala/com/gu/mobile.notifications.client/models/NotificationPayloadType.scala#L9-L22) and [`Payloads.scala`](https://github.com/guardian/mobile-n10n/blob/main/api-models/src/main/scala/com/gu/mobile.notifications.client/models/Payloads.scala#L86-L127)):

| `type` value                  | Variant                          | Our broker uses           |
| ----------------------------- | -------------------------------- | ------------------------- |
| `"news"`                      | `BreakingNewsPayload`            | ✅ breaking news          |
| `"content"`                   | `ContentAlertPayload`            | follow/new-article alerts |
| `"football-match-status"`     | `FootballMatchStatusPayload`     | (football only)           |
| `"football-penalty-shootout"` | `FootballPenaltyShootoutPayload` | (football only)           |

**Common fields** (the `NotificationPayload` trait, [Payloads.scala L86–96](https://github.com/guardian/mobile-n10n/blob/main/api-models/src/main/scala/com/gu/mobile.notifications.client/models/Payloads.scala#L86-L96)): `id`, `type`, `title`, `message`, `thumbnailUrl`, `sender`, `importance`, `topic[]`, `debug`, `dryRun`.

```jsonc
// POST /push/topic
// Authorization: Bearer <apiKey>
// Content-Type: application/json; charset=utf-8
{
  "id": "a1b2c3d4-....", // UUID; optional (defaults server-side) but supply yours for traceability
  "type": "news", // discriminator → BreakingNewsPayload
  "title": "Ukraine summit begins",
  "message": "World leaders gather in Geneva as talks open...",
  "thumbnailUrl": "https://.../thumb.jpg", // optional
  "sender": "notifications-tooling-spa/v1", // free-text source identifier
  "link": {
    // REQUIRED for news/content (NotificationWithLink)
    "contentApiId": "world/2026/jul/08/ukraine-summit",
    "shortUrl": "https://gu.com/p/xyz",
    "title": "Ukraine summit begins",
    "git": { "mobileAggregatorPrefix": "item-trimmed" },
    // ^ GuardianLinkDetails; or use { "url": "https://..." } for an ExternalLink
  },
  "imageUrl": "https://.../lead.jpg", // optional
  "importance": "Major", // "Major" | "Minor"
  "topic": [
    // 1–20 entries; {type, name}
    { "type": "breaking", "name": "uk" },
    { "type": "breaking", "name": "us" },
  ],
  "debug": false,
  "dryRun": false, // true = full pipeline, no device delivery
}
```

### Test Push → mobile-n10n: ⚠️ needs a broker-side adapter path, not a native fixed-recipient endpoint

**The public ingest endpoint `POST /push/topic` only accepts topics, not device tokens.** Its controller ([`Main.pushTopics`](https://github.com/guardian/mobile-n10n/blob/main/notification/app/notification/controllers/Main.scala#L67-L76)) rejects an empty topic list outright (`400 "Empty topic list"`) and the payload model ([`BreakingNewsPayload`](https://github.com/guardian/mobile-n10n/blob/main/api-models/src/main/scala/com/gu/mobile.notifications.client/models/Payloads.scala#L113-L127)) has **no device-token field at all** — only `topic[]`. So we **cannot** hand mobile-n10n a raw device token via its normal API.

However, the _capability_ exists one layer down. The worker pipeline is built around delivering to individual tokens — [`IndividualNotification(notification, token)`](https://github.com/guardian/mobile-n10n/blob/main/notificationworkerlambda/src/main/scala/com/gu/notifications/worker/tokens/TokenService.scala#L14) and [`ChunkedTokens`](https://github.com/guardian/mobile-n10n/blob/main/notificationworkerlambda/src/main/scala/com/gu/notifications/worker/tokens/TokenService.scala#L16-L18) carry explicit token lists, and their local-dev runner sends to hardcoded tokens ([`NotificationWorkerLocalRun`](https://github.com/guardian/mobile-n10n/blob/main/README.md#L146-L154)). The harvester's whole job is topic → tokens; for a test we already _have_ the token, so we'd bypass harvesting.

**What this means for our broker:** a `type: "test"` push plan can't be a passthrough to `/push/topic`. Our Push Adapter has three options, in order of preference:

| Option                   | How                                                                                                             | Verdict                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Ephemeral test topic** | Register the test device(s) to a unique topic (e.g. `test//<uuid>`), then push to that topic via the normal API | ✅ Works with the **public** API today, no mobile-n10n change. Cleanest. |
| **Direct provider send** | Broker calls APNs/FCM itself for test tokens                                                                    | ✅ Works, but our broker now holds provider creds — avoid if possible    |
| **New n10n endpoint**    | Ask mobile-platform for a `POST /push/tokens` test route                                                        | ⛔ Requires their change; don't design around it                         |

I'd model the contract as-is (`type: "test"` with `deviceToken`), and have the adapter implement the **ephemeral test topic** strategy. Confirm the token-registration approach with the mobile-platform team, since it depends on how the apps expose their token for pasting.

### Newsletter → Braze: ✅ natively supported

A fixed list of email recipients maps **directly** onto Braze's trigger contract. Recipients are addressed individually by `external_user_id` / email, and for a test we use the explicit-address form.

## Recommendations

- One issue that would be nice to resolve if possible would be to include a unique notification ID in app notification links. At the moment Ophan only know that a page view has come from an alert, not any one specific alert. If we could improve that, we would be able to see click through rates for specific alerts: https://dashboard.ophan.co.uk/notifications. (Suggested by **Sam Hession**)
- **Make dispatch asynchronous (accept-then-enqueue), not synchronous**. Return 202 immediately after persisting the request to a queue (SQS/Postgres), then have per-channel workers call downstream. This gives us retries, dead-lettering, and isolation for free — a Braze outage can't fail a push send, and the SPA gets a fast, reliable ack. It also mirrors how `mobile-n10n` itself is built (ingest → queue → workers).
- **Version the contract from day one (/v1/) and keep channels.requested open**. These two together are what prevent the "re-model when a new channel arrives" scenario.
