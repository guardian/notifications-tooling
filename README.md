# Notification tooling

This prototype turns a Guardian article into a templated email and sends it through Braze.

## Development

The project uses [Bun](https://bun.com/). On macOS, install it with Homebrew:

```sh
brew install bun
```

Install workspace dependencies:

```sh
bun install
```

Start the backend and frontend from the repository root:

```sh
bun run dev
```

The backend runs on `http://localhost:3000` and the frontend on `http://localhost:3001`.

Run the test suite with:

```sh
bun test
```

## Flow

1. The frontend sends a Guardian article URL to `POST /v1/notifications/guardian-article`.
2. The backend extracts the article ID and fetches its headline, standfirst, image and canonical URL from Guardian CAPI.
3. The frontend uses those fields to populate an editable draft and render an email preview.
4. The email template is stored as HTML in `src/packages/breaking-news-template/breaking-news-us-template.html`. The renderer replaces its named placeholders with the article content.
5. The frontend sends the edited draft to `POST /v1/notifications/braze-email`.
6. The backend renders the final HTML and sends it to Braze using `/campaigns/trigger/send`.

## Braze payload

The backend sends the subject and rendered HTML as shared trigger properties. The recipient is identified by email.

```json
{
  "campaign_id": "<BRAZE_CAMPAIGN_ID>",
  "trigger_properties": {
    "subject": "Breaking news: Example headline",
    "body": "<html>...rendered email...</html>"
  },
  "recipients": [
    {
      "email": "recipient@example.com",
      "prioritization": ["unidentified", "most_recently_updated"],
      "attributes": {
        "email": "recipient@example.com"
      },
      "send_to_existing_only": false
    }
  ]
}
```

The Braze campaign reads the trigger properties with:

```liquid
{{api_trigger_properties.subject}}
{{api_trigger_properties.body}}
```
