# Braze test email send flow

This document shows how a direct test email moves from the Notifications Tooling
API to email-rendering and Braze. Production Braze campaigns are not involved in
this path.

```mermaid
sequenceDiagram
	autonumber
	actor Client
	participant Router as Notification-tests router
	participant Dispatch as dispatchNotificationTest
	participant Renderer as Email-rendering
	participant Braze as Braze REST API

	Client->>Router: POST /v1/notification-tests
	Router->>Router: Validate request and lowercase recipient emails

	alt Invalid request
		Router-->>Client: 400 or 422
	else Valid test-email request
		Router->>Dispatch: Dispatch validated request

		alt Dry run
			Dispatch-->>Router: Complete without provider calls
			Router-->>Client: 202 Accepted
		else Scheduled request
			Dispatch-->>Router: Unsupported operation error
			Router-->>Client: Error response
		else Immediate send
			loop Each selected rendering segment
				Dispatch->>Renderer: Render article with segment newsletter ID
				Renderer-->>Dispatch: Rendered HTML
			end

			Note over Dispatch,Renderer: All variants must render before Braze is called

			Dispatch->>Braze: POST /users/track once for all recipients
			Braze-->>Dispatch: Profile update accepted

			Note over Dispatch,Braze: Profile processing is asynchronous and Dispatch does not wait or retry

			par Each rendered variant
				Dispatch->>Braze: POST /messages/send to stable recipient aliases
				Braze-->>Dispatch: Message request accepted
			end

			alt A variant's send failed
				Dispatch-->>Router: Throw the provider error (all variants still attempted)
				Router-->>Client: 502 (or 504 on timeout)
			else All variants sent
				Dispatch-->>Router: Per-variant outcomes
				Router-->>Client: 202 Accepted
			end
		end
	end
```

## Key behaviour

- Recipient addresses are normalized to lowercase and used as alias names under
  the stable `dispatch-tool-test-email` alias label.
- All selected variants are rendered before any Braze request. A rendering
  failure therefore creates no profiles and sends no emails.
- `/users/track` is called once per dispatch, regardless of the number of
  rendering variants.
- `/messages/send` is called once per rendered variant and targets every test
  recipient in the request.
- Direct sends use `recipient_subscription_state: "all"` and do not trigger a
  production campaign.
- The `/users/track` profile update runs once before any `/messages/send`. The
  per-variant sends then run in parallel via `Promise.allSettled`, so one send's
  failure does not abort the others, and successful sends cannot be rolled back.
- Dispatch adds no propagation delay and performs no automatic retry. A `202`
  confirms API acceptance once every variant has sent, not inbox delivery; if any
  variant's send fails, dispatch rethrows the first provider error and the error
  middleware maps it to `504` on timeout and `502` otherwise.
