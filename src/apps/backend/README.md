# Backend

Notification tooling endpoints live under `/v1/notifications`.

Required for live Braze sends:

```sh
BRAZE_API_KEY=...
BRAZE_CAMPAIGN_ID=...
```

Optional:

```sh
BRAZE_REST_ENDPOINT=https://rest.fra-01.braze.eu
# optional override for the config getter
CAPI_API_KEY=...
CAPI_ENDPOINT=https://content.guardianapis.com
```

Available routes:

- `POST /v1/notifications/guardian-article`
- `POST /v1/notifications/braze-email`

Braze expectations:

- `BRAZE_CAMPAIGN_ID` must point to an email campaign configured for API-triggered delivery.
- The campaign should use a custom HTML email template.
- Set the Braze template subject to `{{api_trigger_properties.subject}}`.
- Set the Braze template HTML body to `{{api_trigger_properties.body}}`.
- The backend sends the fully rendered Guardian email HTML in `api_trigger_properties.body`.
- The send payload now targets a recipient email address and includes `send_to_existing_only: false` plus recipient `attributes`, so Braze can create or update the profile at send time.
- Braze documents a `50 KB` maximum size for the `trigger_properties` object.
