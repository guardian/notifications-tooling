# mobile-n10n topic push flow

This document shows how an app-push notification moves from the Notifications
Tooling API to mobile-n10n. Reader device tokens are never handled here; the API
targets curated topics only, and mobile-n10n fans each push out to the devices
subscribed to those topics.

```mermaid
sequenceDiagram
	autonumber
	actor Client
	participant Router as Notifications router
	participant Dispatch as dispatchNotification
	participant Config as Audience config
	participant N10n as mobile-n10n POST /push/topic

	Client->>Router: POST /v1/notifications
	Router->>Router: Validate request

	alt Invalid request
		Router-->>Client: 400 or 422
	else Valid app-push request
		Router->>Dispatch: Dispatch validated request

		alt Dry run
			Dispatch-->>Router: Complete without provider calls
			Router-->>Client: 202 Accepted
		else Scheduled request
			Dispatch-->>Router: Unsupported operation error
			Router-->>Client: Error response
		else Immediate send
			Dispatch->>Config: Resolve each (topic type, edition) pair
			Config-->>Dispatch: mobile-n10n topic + topic-type importance
			Dispatch->>Dispatch: Group resolved topics by topic type

			Note over Dispatch: One push per topic type — each carries a single, fixed importance

			par Each topic-type group
				Dispatch->>N10n: POST /push/topic (news payload, group topics, group importance)
				N10n-->>Dispatch: 201 Created { id }
			end

			Dispatch-->>Router: Complete
			Router-->>Client: 202 Accepted
		end
	end
```

## Key behaviour

- A request's app-push audience is a list of `(topic type, edition)` pairs. Each
  pair resolves server-side to a mobile-n10n topic (`{ type, name }`); the raw
  coordinates are never exposed in the public contract.
- Dispatch groups the resolved topics by **topic type** and issues **one
  `POST /push/topic` per group**. A request naming one topic type produces one
  push; a request mixing topic types produces one push per type. See
  [mobile-n10n importance and grouping](./mobile-n10n-importance-and-grouping.md).
- Each push carries a single `importance`, taken from its topic type
  (`breaking-news` is `Major`; every other topic type is `Minor`). No push ever
  has to reconcile more than one importance value.
- The payload is a `BreakingNewsPayload` (`type: "news"`). The Guardian article
  link is sent as an external link (`link: { url }`), the title maps to `title`
  and the body to `message`. Optional media populates `imageUrl` and
  `thumbnailUrl`.
- Dispatch sets each push's `id` to `<notificationId>#<topicType>`, where
  `notificationId` is minted by the router before dispatch. The suffix makes the
  id unique per topic-type group and lets a re-send be observed and
  deduplicated. mobile-n10n also returns its own `PushResult` id in the
  `201 Created` body.
- The API key is sent as `Authorization: Bearer <key>`. mobile-n10n scopes each
  key to the topic types it may push to, so an unpermitted topic type is
  rejected upstream.
- mobile-n10n enforces a non-empty topic list and a maximum of 20 topics per
  push. The client guards both bounds before calling out, and the request schema
  caps the total topics a plan may target.
- Per-topic-type pushes are issued in parallel. If one group fails, groups that
  already succeeded cannot be rolled back.
- Dispatch adds no propagation delay and performs no automatic retry. A `202`
  confirms API acceptance and the downstream `201`s, not delivery to devices.
- Provider failures are classified (`AppNotificationApiError`) and mapped by the
  error middleware to `504` on timeout and `502` otherwise, without leaking the
  provider response.
