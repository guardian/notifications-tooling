# ADR: Persistence

**Date:** 2026-07-28
**Status:** Proposed
**Deciders:** Notifications Mission — Q3 2026 (temporary 12-week team)

---

## Context

Dispatch currently runs without a persistence layer. This is sufficient for synchronous, fire-and-forget notification sending, but it limits the system's ability to support capabilities that are likely if the tool matures beyond its current shape:

- Storing notification payloads and their generated `notificationId`.
- Ensuring idempotency, so retries do not resend the same message.
- Supporting scheduled notifications.
- Displaying delivery history and per-channel attempt status.
- Ability to filter historical data.
- Recording audit events for user actions.

Any persistence solution chosen for Dispatch should be judged on how well it supports these product and operational needs, rather than on how easily it can mirror a pre-existing draft design. At the same time, the application is an internal tool with low request volume, so the persistence choice should avoid unnecessary operational complexity while still fitting the likely data model well.

Two AWS-managed persistence options have been considered:

1. **AWS DynamoDB** — a managed key-value/document database.
2. **AWS RDS (PostgreSQL)** — a managed relational database.

---

## Decision Drivers

- **Data model fit** — notifications, per-channel attempts, audit rows, schedules, and user allow-lists are naturally related entities.
- **Idempotency and consistency** — duplicate request prevention and partial-delivery recovery need predictable writes and safe concurrent updates.
- **Query flexibility** — operators and future UI/API endpoints will likely need filtering by date, status, channel, sender, user, and retry state.
- **Delivery tracking** — channel-specific attempt history is append-heavy, but must still remain joinable to the parent notification.
- **Team familiarity** — relational schemas and SQL are a lower-cognitive-load fit for most backend maintenance tasks in this project.
- **Operational overhead** — the service is small, so the chosen store should avoid bespoke modelling or excessive maintenance work.
- **Scalability** — while current traffic is low, the persistence layer should support growth without forcing a redesign too early.

---

## Options Considered

### Option 1: DynamoDB

Model notification records, delivery-attempt history, audit events, and recipient allow-lists in one or more DynamoDB tables using partition/sort keys and secondary indexes.

| #   | Pros                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Serverless operational model** — no database host sizing, engine patching, or routine vacuuming/tuning work.                                                  |
| 2   | **Elastic scaling** — DynamoDB handles very high request rates and bursty traffic without the capacity planning associated with relational instances.           |
| 3   | **Low-latency key lookups** — fetching a notification by idempotency key or `notificationId` can be extremely fast when the access pattern is known in advance. |
| 4   | **Strong fit for append-only event records** — audit items and delivery-attempt rows map well to partitioned event streams under a notification or user key.    |
| 5   | **Conditional writes** — first-writer-wins semantics can be used to implement idempotency protection without a separate locking mechanism.                      |
| 6   | **Pay-for-usage economics** — for sporadic traffic, on-demand pricing can be attractive and avoids paying for an always-on database instance.                   |

| #   | Cons                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Access-pattern-first modelling** — queries must be designed up front around partition keys and indexes. This is harder to evolve when the product is still discovering its operational needs. |
| 2   | **Relational workflows become awkward** — notifications, channel attempts, schedules, audit events, and per-user allow-lists can be modelled, but not as naturally as linked SQL tables.        |
| 3   | **Query flexibility is limited** — ad hoc reporting such as “all failed newsletter deliveries for a date range by sender” often requires extra indexes, duplication, or offline export.         |
| 4   | **Transaction complexity** — multi-row invariants are possible with transactional writes, but are more constrained and less ergonomic than ordinary SQL transactions.                           |
| 5   | **Harder debugging and analytics** — understanding system state usually requires item inspection patterns that are less intuitive than straightforward SQL joins and filters.                   |
| 6   | **Index costs and hot partitions** — poor key design can create uneven load or require additional GSIs, increasing cost and implementation complexity.                                          |

---

### Option 2: RDS (PostgreSQL)

Store notification records, channel delivery attempts, schedules, audit events, and recipient allow-lists in relational tables hosted by AWS RDS PostgreSQL.

| #   | Pros                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Natural schema fit** — the problem space is relational: one notification may have many channel attempts; users may have many test recipients; audit records belong to user actions.                            |
| 2   | **Strong consistency and transactions** — SQL transactions make it straightforward to enforce idempotency, record a notification, and append attempt history safely.                                             |
| 3   | **Flexible querying** — operators can filter and aggregate by channel, state, sender, created date, retry count, or user without redesigning the data model first.                                               |
| 4   | **Clear reporting model** — status pages, admin views, and troubleshooting flows are easier to support when joins and secondary indexes are native capabilities.                                                 |
| 5   | **Lower product-discovery risk** — if new endpoints or reporting requirements emerge, schema and query evolution is generally simpler than remodelling a DynamoDB table and its indexes.                         |
| 6   | **Straightforward future extension** — if the product grows to include richer status views, operational tooling, or administrative workflows, PostgreSQL accommodates those additions without major remodelling. |

| #   | Cons                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Higher baseline operational footprint** — even as a managed service, RDS requires instance sizing, storage configuration, backups, patch windows, and connection management. |
| 2   | **Always-on cost** — a relational instance typically costs more at low traffic than a serverless key-value store handling only occasional requests.                            |
| 3   | **Connection limits** — Lambda-based applications must manage database connections carefully, often via pooling or an intermediary such as RDS Proxy.                          |
| 4   | **Scaling is less effortless** — RDS scales well for this workload, but not with the same near-unbounded horizontal simplicity as DynamoDB.                                    |
| 5   | **Schema migrations become part of delivery** — changes to tables and constraints must be versioned and applied safely as part of deployment.                                  |
| 6   | **VPC/networking complexity** — a private relational database adds subnet, secret, and connectivity concerns that do not exist with a purely public AWS API-based data store.  |

---

## Decision

**Propose AWS RDS with PostgreSQL** for Dispatch's first persistence layer.

Although DynamoDB is operationally attractive, the persistence requirements in this project are not primarily simple key-value lookups. They are more likely to involve related records, evolving query patterns, delivery state tracking, idempotency enforcement, audit history, and future operator/reporting use cases. Those concerns are more naturally and safely expressed in PostgreSQL.

For the expected scale of an internal editorial tool, RDS appears to provide more than enough performance while reducing modelling risk and making the system easier to understand and extend. The extra infrastructure overhead appears acceptable because it buys a simpler application-level data model.

DynamoDB should be revisited only if one or more of the following conditions become true:

- The system evolves into a very high-throughput event platform where the dominant access patterns are simple primary-key lookups and append-only writes.
- Persistence requirements stabilise around a small number of known queries that can be expressed cleanly with partition/sort keys.
- RDS connection management or scaling becomes a demonstrated production bottleneck rather than a theoretical concern.

---

## Consequences

- If this proposal is accepted, the persistence design should likely begin with relational structures for notification records, channel-attempt history, audit events, and user-level test recipient allow-lists.
- `POST /v1/notifications` could move from in-process UUID generation to a durable insert that stores the validated request body and enforces idempotency on the `idempotencyKey`.
- Scheduled delivery could be implemented by persisting future work rather than rejecting `scheduledFor` requests.
- Partial delivery recovery would become safer because successful and failed channel attempts could be recorded independently and queried later.
- The backend would need migration tooling, secrets management, backup configuration, and connection handling appropriate for a Lambda-to-RDS integration.
- If future access patterns prove much simpler than expected, some append-only or high-volume event streams could still be offloaded to DynamoDB or another specialised store without replacing the primary relational database.
