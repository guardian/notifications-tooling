# ADR: Length is guidance, not a rule

**Date:** 2026-08-26
**Status:** Accepted (supersedes "Three named content limits", 2026-07-29)

## Context

The [previous decision](<length-is-guidance#Superseded: Three named content limits>) split one
`maxLength` into three named limits, so that editorial guidance and the length
past which the broker rejects could differ without contradicting each other.
The UI escalated across them: a **Recommended** badge within `recommended`, a
**Warning** badge past it, a **Limit Reached** badge past `editorialLimit`, and
a form error at `validationCap`.

Two things were left open on that PR: whether the three names were the right
public shape, and whether 150/250 were final. Editorial answered the second and
it settles the first. Three escalating thresholds read as a series of things an
editor was doing wrong by crossing, when only one of them ever stopped
anything, and that one existed to catch absurd input rather than anything an
editor would plausibly type. The distinction between "past what editorial
prefers" and "past what editorial states as a maximum" was not one an editor
could act on differently: in both cases the advice is the same, and in both
cases the send goes.

## Decision

**No length blocks composition.** A `validationCap` exists only where a
downstream provider imposes one, and it is the sole enforced number. After this
change exactly one remains: `app-push` `title`, at the provider's 50. That
field is not rendered by the app alert flow, so no cap can be reached by
typing.

Removed:

- newsletter `title` (150) and `body` (250) caps
- app-push `body` cap (200)
- the **Limit Reached** badge and the `error` count colouring that went with it
- the client-side zod `.max()` rules and the schema factories that existed
  only to inject them

`recommended` and `editorialLimit` stay in config and in
`GET /v1/channels/constraints`. `validationCap` becomes optional; absent means
unbounded.

The counter now shows two states, both turning on `recommended` alone. Below
it, a green **Recommended** badge; at it and past it, a yellow **Warning**
badge and the count in warning colour. The line "N characters or fewer
preferred" and the `count / recommended` readout show in both — the guidance
does not disappear once an editor passes it, because passing it is allowed.
The warning marks a length editorial would rather avoid, not a length that
stops anything.

| Limit            | Owner              | Enforced?                | UI behaviour                       |
| ---------------- | ------------------ | ------------------------ | ---------------------------------- |
| `recommended`    | Editorial          | No                       | Recommended below, Warning at/past |
| `editorialLimit` | Editorial          | No                       | Not rendered                       |
| `validationCap`  | Downstream service | **Yes**, 422, if present | Not rendered                       |

## Consequences

- A long app alert headline now reaches FCM/APNS, which truncate it on the
  device. The counter is the only warning an editor gets, which is what the
  **Warning** badge past 90 is now for. This is the real cost of the change and
  was accepted knowingly: a truncated push is a worse headline, whereas a
  blocked send was a blocked story.
- `editorialLimit` is now carried and served but read by nothing. It is
  editorial's stated maximum and removing it would discard a number editorial
  owns, so it stays until they say otherwise.
- A 422 on a length is now impossible from the SPA, which never sends a
  `content.title` for app-push. Length has left the class of things a send can
  fail on.
- The fallback records shrink to the numbers the counter renders. There is less
  duplicated config to drift, and what remains is guidance, so drift degrades a
  hint rather than causing a rejection.
- The form schemas are plain objects again rather than factories parameterised
  by fetched limits, so a form's validation no longer depends on a network read
  completing.

## Superseded: Three named content limits

The 2026-07-29 decision, recorded here for the reasoning that produced the
three names. Editorial gave two numbers per field — a recommended length (46
subject, 85 preview) and a stated maximum (70, 140) — and the agreed UI
behaviour was a soft warning at the first and a "Limit Reached" badge at the
second with no hard cap in the input. The backend was validating against 70/140,
so a 71-character subject was something the UI explicitly permitted and the
broker then rejected with a 422. One name, `maxLength`, was doing three jobs:
editorial preference, editorial maximum, and the length past which a request is
malformed. Splitting the name into `recommended` / `editorialLimit` /
`validationCap`, with the cap set well above the editorial numbers at 150/250,
resolved the contradiction. That split is what made it possible to delete the
caps here without reintroducing it: the numbers were already separate, so
removing one did not disturb the others.
