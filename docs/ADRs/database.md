# ADR: Database

**Date:** 2026-07-28
**Status:** Proposed
**Deciders:** Notifications Mission — Q3 2026 (temporary 12-week team)

---

## Context

Dispatch currently runs without a database. This is fine for fire-and-forget notification sending, but limits support for future features:

- Save each notification request and store its `notificationId`. This can be used to join data across systems (e.g. analytics).
- Stop duplicate sends when the same request is retried.
- Support sending notifications at a scheduled future time.
- Show what happened for each send attempt.
- Show notification send history, filtering on different fields (e.g., time, status, user).

Because this is an internal tool with low traffic, we want a database that is easy to run and easy to change as the product grows.

We looked at two AWS options:

1. **AWS DynamoDB**
2. **AWS RDS (PostgreSQL)**

---

## Decision Drivers

- **Data model fit** — do notification details, send status and schedules fit the DynamoDB key-value model, or would a relational model be more appropriate?
- **Idempotency and consistency** — duplicate request prevention and partial-delivery recovery need predictable writes and safe concurrent updates.
- **Query flexibility** — future features will likely need filtering by date, status, channel, sender, user and retry state.
- **Team familiarity** — engineers tend to be more familiar with relational databases and SQL, than the DynamoDB proprietary format.
- **Maintenance burden** — the service is small, so the chosen store should avoid excessive maintenance work.
- **Scalability** — while current traffic is low, the database should support growth without forcing a redesign too early.

---

## Options Considered

### Option 1: DynamoDB

Use one or more DynamoDB tables to store notifications, send attempts, audit history, and allow-lists.

| #   | Pros                                                                    |
| --- | ----------------------------------------------------------------------- |
| 1   | Managed service with little day-to-day database maintenance.            |
| 2   | Handles traffic spikes well.                                            |
| 3   | Very fast for direct lookups when access patterns are known in advance. |
| 4   | Good for event-style history records.                                   |
| 5   | Built-in conditional writes can help with duplicate-request protection. |
| 6   | Can be cost-effective for low, bursty traffic.                          |

| #   | Cons                                                                                                      |
| --- | --------------------------------------------------------------------------------------------------------- |
| 1   | You must design around known query patterns early, which is harder while requirements are still changing. |
| 2   | Connected data (notifications, attempts, audit history) is less natural to model.                         |
| 3   | New reporting questions often require extra indexes or data reshaping.                                    |
| 4   | Multi-step updates are possible but usually less straightforward than SQL transactions.                   |
| 5   | Debugging complex state can be harder than in a relational model.                                         |
| 6   | Poor key design can create uneven load and extra cost.                                                    |

---

### Option 2: RDS (PostgreSQL)

Use relational tables in AWS RDS PostgreSQL for notifications, send attempts, schedules and audit history.

| #   | Pros                                                                              |
| --- | --------------------------------------------------------------------------------- |
| 1   | Fits connected data naturally (for example, one notification with many attempts). |
| 2   | Transactions make retry safety and write consistency easier to implement.         |
| 3   | Flexible querying for support and reporting needs.                                |
| 4   | Easier to power status pages, admin views, and troubleshooting tools.             |
| 5   | Easier to evolve as requirements change.                                          |
| 6   | Good base for future features without major remodels.                             |

| #   | Cons                                                              |
| --- | ----------------------------------------------------------------- |
| 1   | More setup and ongoing configuration than DynamoDB.               |
| 2   | Usually higher baseline cost for low traffic.                     |
| 3   | Need to manage database connections carefully from Lambda.        |
| 4   | Scaling is good, but less automatic than DynamoDB.                |
| 5   | Table changes must be managed through migrations.                 |
| 6   | Private networking and secret management add infrastructure work. |

---

## Decision

**Use AWS RDS with PostgreSQL** as Dispatch's first database.

Why: our needs are mostly about connected records, safe retries, and flexible filtering/reporting. PostgreSQL handles this in a simple and familiar way for the team.

For this internal tool, PostgreSQL should be fast enough and lower risk for product changes, even if it needs a bit more infrastructure setup.

We should revisit DynamoDB only if:

- Traffic becomes very high and mostly simple key lookups.
- Our query needs settle into a small, stable set of patterns.
- RDS connection handling or scaling becomes a production issue. If this is the case we should look at RDS Proxy first.

---

## Consequences

- Start with a relational table for notifications and go from there.
- `POST /v1/notifications` can save validated requests durably and enforce `idempotencyKey` uniqueness.
- Scheduled sends can be stored and processed later.
- Recovery from partial failures becomes safer because each attempt is recorded.
- The backend will need migration tooling, secrets management, and Lambda-to-RDS connection handling. Migration rollout is covered separately in `docs/ADRs/database-migrations.md`.
- If some high-volume event workloads appear later, those could still move to DynamoDB without replacing PostgreSQL as the main store.
