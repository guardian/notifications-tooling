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
An editorial label shown on a notification, such as Breaking News or Exclusive.
Currently presentational only — the request contract has no field to carry it, so
it does not reach any downstream service, and the preview displays it regardless.

**Preview**:
The rendered approximation of a notification shown to an editor while composing.
It is assembled in the browser, so it can show choices — the kicker among them —
that no downstream service receives, and it is not a guarantee of what a reader
will see.
_Avoid_: proof, render, draft

### Delivery

**Channel**:
A delivery destination. Exactly two exist: **`newsletter`** (email, via Braze) and
**`app-push`** (mobile, via mobile-n10n).
_Avoid_: `email`, `push`, `app-notification`, platform, medium

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

**Idempotency key**:
A client-generated identifier that marks two requests as the same intent, so a
retry is not delivered twice. Required today but inert — there is no persistence
to deduplicate against.
_Avoid_: request id, notification id, dedupe key

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
