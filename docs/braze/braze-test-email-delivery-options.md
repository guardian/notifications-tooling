# Braze test email delivery options

## Context

Production newsletters use an API-triggered Braze campaign. Notifications
Tooling supplies the rendered HTML and subject through trigger properties. The
campaign body is intentionally thin:

```liquid
{{api_trigger_properties.${body}}}
```

Supplying explicit `recipients` to `/campaigns/trigger/send` does not bypass the
campaign audience. A recipient still needs a Braze profile, must match the
campaign audience, and remains subject to campaign re-eligibility and duplicate
send protection.

## Options

| Option                                          | Advantage                                                                                                                      | Disadvantage                                                                                                                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Production campaign with explicit recipients | Exercises the real campaign configuration.                                                                                     | Testers need Braze profiles and must match the campaign audience. Campaign re-eligibility and duplicate-send protection can block repeated tests.                            |
| 2. Mirror test campaigns                        | Supports an internal test audience without changing production targeting. Test re-eligibility can be configured independently. | Requires a test campaign for each production campaign. Sender settings, subscription rules, Liquid, and other configuration can drift.                                       |
| 3. Direct `/messages/send` test emails          | Bypasses campaign audience and campaign duplicate-send protection. It does not duplicate campaigns.                            | Does not execute the campaign. Notifications Tooling must provide sender, reply-to, subject, HTML, app ID, and profile management. A new profile can take time to propagate. |
| 4. Redesign production targeting                | One campaign could handle production and explicit test recipients.                                                             | Requires broad campaign eligibility and moving production targeting into every API request. This materially increases the risk of an accidental broad send.                  |
| 5. Manual Braze dashboard test send             | Uses Braze's native test-send workflow and can use Content Test Groups.                                                        | Cannot be initiated by Notifications Tooling through the public campaign-trigger API. Editors must work in Braze.                                                            |

### What mirroring test campaigns means

Option 2 would duplicate each production newsletter campaign as a test-only
campaign. For example, Breaking News UK would have both a production campaign
and a corresponding test campaign. The same pair would be needed for each
newsletter segment, currently UK, US, and AU.

Each test campaign would target an internal test audience and could use more
permissive re-eligibility rules for repeated tests. However, its sender,
reply-to address, subscription rules, Liquid template, tracking settings, and
other delivery configuration would need to remain aligned with the production
campaign. Every campaign change would therefore need to be applied and verified
twice. The direct-send option avoids that maintenance burden, at the cost of not
exercising the production campaign configuration.

## Proposed Decision

Use option 3 for Notifications Tooling test-email audiences:

1. Render the selected newsletter variants in the same way as production sends.
2. Create or update stable alias-only test profiles once per dispatch through
   Braze's [`/users/track` endpoint](https://www.braze.com/docs/api/endpoints/user_data/post_user_track).
3. Send each rendered variant through Braze's
   [`/messages/send` endpoint](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages)
   using the configured app, sender, and reply-to values.
4. Continue using `/campaigns/trigger/send` with `broadcast: true` for production
   segment audiences.

This validates the rendered email rather than the production campaign's delivery
configuration. Because the campaign template only inserts the supplied body,
the content is close to production, but campaign-specific tracking, link
wrapping, Liquid context, frequency caps, eligibility, and analytics are not
exercised by a direct test send.

## Test profile identity

Braze's [user alias object](https://www.braze.com/docs/api/objects_filters/user_alias_object)
is an alternative user identifier made from an `alias_name` and an
`alias_label`. Dispatch identifies each test profile with this stable alias:

```text
alias_label: dispatch-tool-test-email
alias_name: <lowercase recipient email address>
```

Dispatch normalizes recipient addresses to lowercase before checking uniqueness
or creating aliases. The
[`/users/track` request](https://www.braze.com/docs/api/endpoints/user_data/post_user_track#identifier-resolution)
supplies that alias as the primary identifier and the recipient email as a
profile attribute. Braze does not fall back to matching the email when a primary
identifier is present. The subsequent
[`/messages/send` request](https://www.braze.com/docs/api/endpoints/messaging/send_messages/post_send_messages#request-body)
targets those profiles through its `user_aliases` field rather than using the
raw email addresses as recipient identifiers.

| Existing Braze state                                    | `/users/track` result                                                                              |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A profile has the exact Dispatch alias                  | The profile is updated and reused.                                                                 |
| A profile has the same email but not the Dispatch alias | That profile is not matched. Braze creates a separate alias-only test profile with the same email. |
| No profile has that email or alias                      | Braze creates a new alias-only test profile.                                                       |

The separate same-email profile is intentional: test delivery remains isolated
from reader and staff identities rather than attaching Dispatch state to an
unrelated profile. It also means Dispatch can add duplicate-email profiles to
Braze. These profiles should be treated as owned by Dispatch and identified by
the `dispatch-tool-test-email` alias label.

During pre-production testing, recipients are intentionally unrestricted beyond
email syntax validation and the 20-recipient request limit. Access remains
protected by Panda authentication and the `dispatch_access` permission. This
policy must be reviewed before production, including whether to restrict sends
to the authenticated user or an approved address allowlist. Direct sends use
`recipient_subscription_state: "all"`, which deliberately bypasses the profile's
subscription state for test delivery.

Changing the alias label later creates a new identity namespace. Existing
profiles under the previous label will not be reused and another same-email
profile may be created, so the label should now remain stable.

## Profile propagation

Braze processes `/users/track` asynchronously and recommends allowing time for a
new profile to propagate before calling `/messages/send`. The implementation
uses stable aliases so existing testers can be sent to immediately.

Dispatch deliberately uses an immediate best-effort policy:

- it calls `/messages/send` as soon as `/users/track` accepts the profile update;
- it does not add a fixed delay, because Braze provides no propagation-time
  guarantee and a short delay would not make delivery reliable;
- it does not retry automatically, because Braze may have accepted the first
  send and another attempt could produce a duplicate;
- a successful Dispatch response means Braze accepted both API calls, not that
  the message reached the recipient's inbox.

The first send to a previously unknown Dispatch alias may therefore not be
delivered. Check the `dispatch-tool-test-email` profile and Braze message
activity before manually retrying after the profile has propagated. Later sends
reuse the stable alias and do not have the profile-creation race.
