# Notifications Tooling

Dispatch is an internal editorial tool for composing and sending Guardian
notifications. The backend is a **broker**: it authenticates, validates and
translates a channel-agnostic request into each downstream service's native
contract. It does not own reader data, and it is not itself a sending service.

This file is a glossary. It defines what terms mean, not how anything is built.

## Language

**Broker**:
The backend service. It authenticates, validates and translates a notification
into each downstream service's native contract. It does not own reader data and
does not itself deliver anything.
_Avoid_: API, server, sender, dispatcher

### Composition

**Notification**:
One editorial intent to reach an audience, composed once and sent to one or more
channels in a single request.
_Avoid_: message, alert, push (as a noun for the whole thing)

**Notification composer**:
The editorial interface for importing an article, composing a notification and
managing its send, including send confirmation and failures.

**Article**:
The Guardian article or liveblog imported as source material for a notification,
distinct from the notification content an editor composes from it.
_Avoid_: content (when referring to the imported article)

**Content item**:
A single reusable piece of notification content — title, body, link, optional
media — identified by an author-chosen id. Items are declared once and referenced
by the plans that use them.
_Avoid_: article, payload, block

**Plan**:
The delivery instruction for one channel: which audience to reach and which
content items to assemble for it. One notification carries at most one plan per
channel.
_Avoid_: job, task, delivery, target

**Compose**:
The part of a plan that selects and arranges content items for its channel.
Newsletter composes items into an email with a subject; app-push takes a single
item.

**Kicker**:
An optional editorial label for a notification, such as Breaking News or Exclusive.
For a newsletter email, it prefixes the subject text to form the subject line.

**None**:
A newsletter email with no editorial label before its subject text. This is an
explicit choice, distinct from leaving the kicker choice unselected.

**App alert type**:
The editorial audience category of an app alert, such as Breaking news, Sports
or Editors' picks, distinct from the edition it targets.
_Avoid_: kicker (when referring to an app audience category)

**Subject text**:
The editable wording of a newsletter email's subject, excluding any kicker.
_Avoid_: headline (when referring to the edited subject text)

**Subject line**:
The complete subject of a newsletter email, consisting of the subject text
prefixed by a kicker when one is selected.
_Avoid_: subject text (when referring to the complete subject line)

**Preview**:
The rendered approximation of a notification shown to an editor while composing.
It is not a guarantee of what a reader will see.
_Avoid_: proof, render, draft

**Preview text**:
Optional editorial text included in a newsletter email, distinct from its subject
line and from the rendered preview.
_Avoid_: preview (when referring to the authored text)

### History

**Notification history**:
The editorial record of notifications sent through Dispatch.

**History text search**:
A history selection based on wording in notification content-item titles or
bodies, distinct from newsletter subject lines and editorial categories.
_Avoid_: alert type search (category selection is a separate concept)

**Kicker / Alert type filter**:
A history selection spanning newsletter kickers and app alert types, with
Breaking news shared across both channels. Selected choices are alternatives:
a notification need only match one.
_Avoid_: channel filter (channels and editorial categories are distinct)

### Delivery

**Channel**:
A delivery destination. Exactly two exist: **`newsletter`** (email, via Braze) and
**`app-push`** (mobile, via mobile-n10n). To an editor these are always named
**newsletter email** and **app alert**.
_Avoid_: `email`, `push`, `app-notification`, platform, medium; email newsletter
and push notification as user-facing names

**Segment**:
A named, public audience group that a plan targets by id. The broker resolves a
segment to its downstream addressing — a Braze campaign for newsletter, a
mobile-n10n topic for app-push — and never exposes that addressing in the API.
_Avoid_: topic, campaign, audience list, group

**Sender**:
An identifier for the system or team originating a notification, carried for
traceability.

**Dry run**:
A request that is authenticated and fully validated but never dispatched
downstream. The SPA currently sends only dry runs.
_Avoid_: test mode, preview, simulation

**Notification id**:
The identifier of a recorded notification as a whole, not an individual dispatch
outcome. It is distinct from an idempotency key and a request id.
_Avoid_: dispatch id (when referring to the whole notification)

**Idempotency key**:
A client-generated identifier that marks two requests as the same intent, so a
retry is not delivered twice. Required today but inert — there is no persistence
to deduplicate against.
_Avoid_: request id, notification id, dedupe key

**Send confirmation**:
The interruption shown _before_ a notification is sent, guarding the editor's
intent: it restates what will go out, and only on approval does it fire the send
request. It is not an outcome — it exists precisely because sending cannot be
undone.
_Avoid_: confirmation (bare — collides with the dispatch report), confirm dialog,
are-you-sure

**Dispatch report**:
The account shown _after_ a notification is sent, derived from the send response,
telling the editor whether it succeeded and what was delivered. It reports an
outcome; it never sends anything.
_Avoid_: confirmation page, success page, report page

### Limits

Three distinct limits apply to every piece of notification text. They have
different owners and different consequences, and collapsing them is what makes a
notification an editor is permitted to compose fail on send.

**Recommended limit**:
Editorial's preferred length. The UI warns past it. Not enforced.

**Editorial limit**:
Editorial's stated maximum. The UI badges it as reached but deliberately does not
block, so text past it must still be accepted. Not enforced by the broker.

**Validation cap**:
The length past which the broker rejects a request. Guards against absurd input
rather than expressing editorial preference, so it sits well above the editorial
limit.
_Avoid_: max length, hard limit, character limit — each is ambiguous across all
three

### Errors

**Error envelope**:
The single shape every non-2xx response carries: a machine-readable `error`, a
human `message`, a `requestId` for log correlation, and optionally `details`.

**Detail**:
One entry in an error envelope describing a single problem, located by an RFC
6901 JSON Pointer into the request body.

**Request id**:
A per-request identifier echoed in responses and logs, used to correlate a
user-visible failure with the backend record of it.
_Avoid_: trace id, correlation id
