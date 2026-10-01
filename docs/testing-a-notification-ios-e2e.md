# Testing a notification send from Dispatch through to receiving on a real iOS device

## Prerequisites

You should have followed the instructions in [iOS-live repo](https://github.com/guardian/ios-live) to get the iOS app running locally on your device, you should have installed it onto your device. The icon is a yellow G icon, different to the regular Guardian app.

**NB: This guide does not cover any troubleshooting you may have with that**

## Registering your device

1. On the iOS app, tap the profile icon in the top right of the page
1. Then, tap the "bug" icon on the top right
1. In Developer Settings, scroll down to "Notification Subscriptions"
1. Ensure you have all notifications subscribed to
1. Copy the "Push Token" this will be the `deviceToken` in the cURL below.
1. Click "Refresh" at the bottom of the Notification Subscriptions if you have any issues here, to ensure the latest notifications are listed

Curl to the notifications service on code environment:

```curl
curl -i -X POST 'https://notifications.code.dev-guardianapis.com/device/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "deviceToken": "<ENTER_DEVICE_TOKEN_HERE>",
    "platform": "ios",
    "buildTier": "debug",
    "appVersion": "1.0.0",
    "topics": [
      { "type": "breaking", "name": "internal-dispatch-test" }
    ]
  }'
```

A valid response to this is:

```json
{"deviceId":"<DEVICE_TOKEN>","platform":"ios","topics":[{"type":"breaking","name":"internal-dispatch-test"}],"provider":"Guardian"}%
```

## Next steps

1. [Go to the Dispatch tool on code](https://dispatch.code.dev-gutools.co.uk/)
1. Send an app-alert
1. Wait for ~1 minute
1. Look at your notifications

## Troubleshooting

- If you don't receive it, then something went wrong in the process. Try re-registering your device again with the cURL above. Check the output for any irregularities
- Ensure you have all notifications subscribed to in the "Notification subscriptions" within the Guardian app
- If you have any issues, ensure that the notifications are all turned on in the "Settings" of your iOS device
