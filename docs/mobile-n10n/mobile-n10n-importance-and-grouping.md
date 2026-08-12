# mobile-n10n importance and grouping

## Context

mobile-n10n's `POST /push/topic` accepts a single `BreakingNewsPayload` per
call, and that payload carries exactly one `importance` value (`Major` or
`Minor`) alongside its list of topics. The value is an editorial signal about
the kind of alert — a breaking-news alert is `Major`; a sport or editors' picks
alert is `Minor` — and it influences how the apps present the notification.

A Notifications Tooling app-push plan can name several `(topic type, edition)`
pairs in one request, and those pairs can span different topic types. Because a
single push cannot express two importance values, the request model and the
dispatch path have to decide **where importance lives** and **how a plan that
spans topic types is sent**.

## Options

| Option                                         | Advantage                                                                                  | Disadvantage                                                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. One importance per request, collapsed       | Always a single `POST /push/topic` call, whatever the audience.                            | Requires a rule to reconcile mixed importances (e.g. "`Major` if any topic is `Major`"). That rule guesses editorial intent and can over-signal.    |
| 2. Importance per edition                      | Maximum granularity.                                                                       | Editions of a topic type share the same editorial weight, so per-edition importance is redundant, and mixed editions still need collapsing to send. |
| 3. Importance per topic type, grouped per type | Importance is unambiguous per push; no reconciliation rule; matches the editorial meaning. | A mixed-type request produces more than one downstream call.                                                                                        |

## Proposed Decision

Use option 3:

1. `importance` is a property of the **topic type**, held in the audience config
   next to its editions. `breaking-news` is `Major`; every other topic type is
   `Minor`.
2. Dispatch resolves each requested `(topic type, edition)` pair to its
   mobile-n10n topic, then **groups the resolved topics by topic type**.
3. Dispatch issues **one `POST /push/topic` per group**, each with that topic
   type's importance and the group's topics.

A request naming a single topic type (with one or many editions) produces one
push. A request mixing topic types produces one push per type. Every push
therefore carries an importance that is a fixed fact of its topic type, so no
call has to interpret or reconcile importance.

## Why not collapse to one call

Option 1 keeps a request to a single downstream call, but only by inventing a
reconciliation rule. Any such rule ("take the highest", "take the first") is a
guess about editorial intent: a plan that pairs a breaking-news topic with a
sport topic would either promote the sport alert to `Major` or demote the
breaking-news alert to `Minor`. Grouping per topic type removes the guess
entirely, at the cost of an extra call for the uncommon mixed-type request.

## Why not per edition

Importance describes the kind of alert, not the regional edition of it. Every
edition of `breaking-news` is `Major`; every edition of `sport` is `Minor`.
Storing importance per edition would duplicate the same value across a topic
type's editions and still leave a mixed-edition push needing a collapse step
whenever those editions came from different topic types. Keeping importance on
the topic type is the smallest model that makes each push unambiguous.

## Grouping and the topic cap

mobile-n10n rejects a push with an empty topic list and a push targeting more
than 20 topics. Grouping by topic type interacts cleanly with that cap: each
group is a subset of the request's topics, so a group never exceeds the
request-level maximum the schema already enforces. The client re-checks the
1–20 bound before each call as a defensive guard, independent of the request
schema.

The number of downstream calls for a request is bounded by the number of
distinct topic types it names (currently seven curated types). In practice most
pushes name a single topic type and make a single call.

## Failure isolation and retries

Per-topic-type pushes are independent and issued in parallel with
`Promise.allSettled`, so one group's failure does not abort the others. There is
no persistence layer yet, so a failure has no cross-call transaction:

- a fresh UUID is generated per group and sent as the mobile-n10n payload `id`;
  dispatch returns each group's `{ id, topicType, status, failureReason? }` so
  the outcomes can be persisted once a store exists;
- if one group's push fails the others still complete, and successful groups are
  not rolled back;
- Dispatch does not retry automatically, because a failed call may have been
  accepted downstream and a blind retry could duplicate a push;
- the returned outcomes report per-group `success`/`failure` (with a classified
  `failureReason`), not that any device received the notification.

With persistence, each group's push becomes an individually tracked, retryable
unit keyed off its returned id, so partial failures can be recovered without
resending groups that already succeeded.

## Importance stays server-side

Importance is resolved from config during dispatch and is never part of the
public audiences contract or the `POST /v1/notifications` request body. Clients
choose topic types and editions; the editorial weight of each topic type is a
backend decision, changeable in config without a contract change.

## Test pushes

`POST /push/topic` accepts topics only, not device tokens, so a fixed-recipient
test push cannot be a passthrough to the same endpoint. The planned approach is
an ephemeral test topic — register the test device(s) to a unique topic and push
to it through the normal API — which needs no mobile-n10n change. This path is
not yet implemented; it is noted here so the topic-only contract above is not
mistaken for a limitation that blocks test sends.
