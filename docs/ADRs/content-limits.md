# ADR: Three named content limits

**Date:** 2026-07-29
**Status:** Accepted

## Context

Editorial gave us two numbers per notification field: a recommended length (46
for a newsletter subject, 85 for preview text) and a stated maximum (70 and
140). The agreed UI behaviour is a soft warning at the recommended length and a
"Limit Reached" badge at the maximum **with no hard cap in the input**, meaning an editor is able to type beyond the maximum.

The backend was validating against 70/140, the same numbers. So a subject of 71
characters was something the UI explicitly permitted an editor to write and the
broker then rejected with a 422. The two behaviours were in direct contradiction,
and the collision was invisible because both were called `maxLength`.

The underlying problem is that one name was doing three jobs: editorial
preference, editorial maximum, and the length past which a request is malformed.

## Decision

The team had already settled the shape of the fix based on the resolution that "the
backend will enforce a higher hard cap (e.g. 150 for subject, 250 for preview)
to prevent absurd inputs". This ADR records that decision and the naming it
implies; it does not propose it.

Every text field carries three separately named limits, served by
`GET /v1/channels/constraints` and defined once in `@config`:

| Limit            | Owner        | Enforced?    | UI behaviour                  |
| ---------------- | ------------ | ------------ | ----------------------------- |
| `recommended`    | Editorial    | No           | Warning badge past it         |
| `editorialLimit` | Editorial    | No           | "Limit Reached" badge past it |
| `validationCap`  | This service | **Yes**, 422 | Not rendered                  |

`validationCap` sits well above `editorialLimit` (150 and 250 for newsletter) and
exists only to reject absurd input. The SPA drives its counters from the first
two and must never wire `validationCap` to a character counter — doing so would
erase the editorial guidance the counter exists to show.

App-push limits come from FCM/APNS rather than from editorial, so all three sit
at the same provider-imposed number until editorial supplies distinct ones.

Two things remain open and are called out on the PR rather than settled here:
the three names as a public API shape, and whether 150/250 are final.

## Consequences

- A 422 on a length is now a client bug rather than a routine editorial mistake.
  That is what makes it reasonable to log `details` for diagnosis instead of
  mapping them onto form fields
- Changing an editorial limit is a config change in one file, with no schema
  change and no frontend deploy — provided the read succeeds. When it does not,
  `useChannelConstraints` falls back to `NEWSLETTER_LIMIT_FALLBACKS`, a
  hardcoded copy of `recommended`/`editorialLimit`, so the editor keeps working
  counters instead of blank ones. That fallback is a second copy of two numbers
  and will go stale; a test pins it to what the backend serves so it fails
  loudly rather than drifting quietly. `validationCap` is deliberately not
  duplicated — the UI never renders it.
- The fallback is silent by design: a failed read is indistinguishable from a
  slow one, and a 403 shows no permissions message. Accepted so that a
  constraints outage degrades guidance rather than blocking composition.
- Three numbers per field is more to carry than one. The alternative — keeping
  them collapsed — was rejected because it required either reversing the agreed
  "no hard cap in the UI" design or accepting routine send failures.
