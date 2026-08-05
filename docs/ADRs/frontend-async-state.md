# ADR: Reads use TanStack Query; the send is a plain function

**Date:** 2026-07-29
**Status:** Accepted

## Context

**NOTE** I am aware that this could change as the mission develops and continues.
Some on the information, namely surrounding the **The send** and the some
consequences of using TanStack Query for reads. Regardless, I believe it would be
useful to propose this ADR as a starting point for discussion.

The frontend has TanStack Query configured, so the obvious move is to express
the send as a `useMutation`. We deliberately do not.

The form is already a state machine: a reducer owns the draft, the article
fetch, `isWaitingForSend` and `sendingResult`, and effects are injected through
context as plain async functions. Sending is one step in that machine, not an
independently cacheable resource.

## Decision

**Reads** — the channels endpoints, and future list endpoints — use TanStack
Query. They are cacheable server state with a natural key, which is what the
library is for.

**The send** is a plain `sendNotification()` function injected via context, and
the reducer owns its lifecycle, exactly as it already does for the article
fetch.

Related error-handling decision: a failed request surfaces as a generic message
plus its `requestId`. The envelope's per-field `details` are parsed onto
`ApiError` and logged, but never mapped onto form fields. With the broker
validating against the validation cap rather than the editorial limit — see
[content-limits.md](./content-limits.md) — a 422 means a client bug, not
something an editor can fix by rewording a field, so a pointer-to-field mapping
layer would be built for a case that should never reach a user.

## Consequences

- Two async idioms coexist in one feature. This is deliberate: the split is
  between cacheable server state and a one-shot command, not an inconsistency to
  be tidied away. **Do not "fix" the send into a `useMutation`** — that is the
  specific change this ADR exists to prevent.
- Mutation retries stay disabled on the shared client, so a send cannot silently
  fire twice.
- `details` are available on `ApiError` if per-field rendering is ever wanted, so
  that remains an additive change.

## Still open

How the send is expressed remains reviewable once it is wired to the real API
rather than a stub. Marked Accepted rather than Proposed because the reads,
the shared `queryClient` and its retry policy are shipped and tested; the ADR
describes live behaviour.
