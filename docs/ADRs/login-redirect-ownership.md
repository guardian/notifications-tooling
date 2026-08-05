# ADR: The login URL is owned by both services, deliberately

**Date:** 2026-08-05
**Status:** Accepted

## Context

A pan-domain login URL needs two facts, and no single party has both:

- **Which login host to use.** Derived from the `STAGE`
  (`login.local.dev-` / `login.code.dev-` / `login.`), which is known only to the backend.

- **Where to send the user afterwards** (`returnUrl`). For the SPA this is
  whichever page is currently open which is only known to the browser, and never sent
  to the server.

`getLoginUrl` in `auth-middleware.ts` serves two callers whose needs are
opposite:

- `authRedirectMiddleware` guards a document navigation to `/`. Here
  `request.originalUrl` **is** the page the user asked for, so using it as the
  `returnUrl` is correct.
- `authMiddleware` answers an XHR with a JSON `401`. Here `originalUrl` is an
  API path such as `/v1/channels/constraints`. That path is a `GET`, so a user
  who logged in and was returned to it would receive **raw JSON with a 200** —
  a broken-looking site with no way back but the browser's back button.

Separately, `fetchJsonAndParse` redirected to login itself on any `401`. With
the only caller being a mount-time read that is harmless, but the send is not
yet wired to the real API. Once it is, an implicit redirect inside the shared
fetch helper means an editor can press Send and have the page navigate away,
losing a composed notification that is held only in a reducer with no
persistence.

## Decision

**Ownership of the login URL is split along the boundary of who knows what.**

- The backend owns the login host. `getLoginUrl` takes an explicit
  `includeReturnUrl` flag: `true` for `authRedirectMiddleware`, `false` for
  `authMiddleware`. A JSON `401` therefore carries a login URL with **no**
  `returnUrl` rather than one known to be wrong.
- The frontend owns the `returnUrl`. `redirectToLogin` appends
  `location.href` to whatever URL the backend supplied.
- **Redirecting is a call-site decision, not a client-wide one.**
  `fetchJsonAndParse` no longer navigates; it carries `loginUrl` on the thrown
  `ApiError`. `useChannelConstraints` redirects explicitly, because a
  mount-time read has no work to lose.

This fixes a live bug rather than only guarding a future one. Today an editor
whose cookie has expired hits the constraints read, is sent to login with
`returnUrl=https://<host>/v1/channels/constraints`, and lands after login on
raw JSON with a `200` — no way back but the browser's back button. After this
change the `returnUrl` is `location.href`, so they land on the page they were
composing on. The second, forward-looking effect is that a future caller
cannot inherit a navigation it never asked for.

## Considered options

- **Fix `returnUrl` in the backend.** Rejected: `getLoginUrl` is shared, and
  `originalUrl` is correct for the document-navigation caller. A single fix
  breaks the working case.
- **Let the frontend build the whole login URL.** Rejected: duplicates the
  stage-to-login-host mapping into the client, which is exactly what returning
  `loginUrl` from the backend exists to avoid.
- **Send the current page URL to the backend** on every authenticated request.
  Rejected: taxes every request to serve one redirect.
- **Have the backend set a `returnUrl` and the frontend overwrite it.**
  Rejected: requires writing a value known to be wrong so it can be corrected
  later, and nothing enforces that the correction happens.
