# Backend

## Notification channel configuration

Copy the variable names from `.env.example` into the ignored `.env.local` file
and populate them with the CODE environment values.

- `BRAZE_API_KEY` needs the Braze `campaigns.trigger.send` permission.
- `BRAZE_REST_ENDPOINT` is the Braze REST instance URL.
- `BRAZE_CAMPAIGN_ID_UK`, `BRAZE_CAMPAIGN_ID_US`, and
  `BRAZE_CAMPAIGN_ID_AU` identify API-triggered campaigns whose audiences are
  configured in Braze.

The app-notification client is currently a mock. It receives the translated
topic and content request but does not make a network call.

Newsletter rendering is injected into the dispatch orchestration. The current
email-rendering notification endpoint renders one article, while the notification
request contract permits composing multiple content items. A production renderer
must support that full contract before the HTTP route invokes dispatch.
