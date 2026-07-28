# Braze test email send flow

This document shows how a direct test email moves from the Notifications Tooling
API to email-rendering and Braze. Production Braze campaigns are not involved in
this path.

```mermaid
sequenceDiagram
	autonumber
	actor Client
	participant Router as Notifications router
	participant Dispatch as dispatchNotification
	participant Renderer as Email-rendering
	participant Braze as Braze REST API

	Client->>Router: POST /v1/notifications
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

			loop Each rendered variant
				Dispatch->>Braze: POST /messages/send to stable recipient aliases
				Braze-->>Dispatch: Message request accepted
			end

			Dispatch-->>Router: Complete
			Router-->>Client: 202 Accepted
		end
	end
```

## Key behaviour

- Recipient addresses are normalized to lowercase and used as alias names under
  the stable `dispatch-tool-test-email` alias label.
- All selected variants are rendered before any Braze request. A rendering
  failure therefore creates no profiles and sends no emails.
- `/users/track` is called once per dispatch, regardless of the number of
  rendering segments.
- `/messages/send` is called once per rendered variant and targets every test
  recipient in the request.
- Direct sends use `recipient_subscription_state: "all"` and do not trigger a
  production campaign.
- Braze calls are sequential. If a later send fails, earlier accepted sends
  cannot be rolled back.
- Dispatch adds no propagation delay and performs no automatic retry. A `202`
  confirms API acceptance, not inbox delivery.
