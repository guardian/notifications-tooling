# ADR: Database Migrations

**Date:** 2026-08-05
**Status:** Accepted
**Deciders:** Notifications Mission

---

## Context

Dispatch uses PostgreSQL as its primary datastore. That creates a second decision alongside the database choice itself: how schema migrations should be run safely in CODE and PROD.

Locally, we already use Drizzle for schema and migration management from `/src/packages/database`:

- Create a migration with `bun run db:migration:create`.
- Apply migrations with `bun run db:migration:apply`.

The production question is different. We need an approach that works with the current deployment model, keeps database access controlled, and does not add too much operational complexity before we have real evidence that automation is necessary.

The problem we are trying to solve is not just "how do we run migrations". It is "how do we introduce schema changes safely, in the right order, with a workable recovery path, given the limited time and delivery scope of this mission?"

---

## Decision Drivers

- Keep the first production migration path simple and operable.
- Avoid premature coupling between schema migrations and CloudFormation.
- Keep database access inside controlled infrastructure due to security and audit concerns.
- Automate later once the operational needs are clearer.
- Make sure failure and recovery behaviour is understood before adding deployment-time automation.
- Prefer the smallest amount of engineering work that still gives a safe path to production.

---

## Options Considered

### Option 1: Manual migrations through an EC2 jump host

Run a dedicated migration runner through a temporary EC2-based access path to the database.

Why choose this:

- Avoids immediate CloudFormation or Riff-Raff coupling.
- Keeps database access inside controlled infrastructure.
- Supports a process-first rollout while the operational model is still new.
- Fits the mission constraints because it solves the immediate delivery problem with less engineering work.

Recovery:

- If a migration fails, the engineer stops the rollout, inspects the database state, fixes the issue, and applies a forward-safe correction.
- Recovery is manual, but the steps are explicit and visible.
- This approach assumes fix-forward rather than rollback for schema changes.

Tradeoffs:

- Requires developer intervention.
- Needs a clear permissions and audit model.
- Depends on good deployment discipline, for example splitting schema and app changes when useful.

### Option 2: Lambda-backed custom resource migrations

Run migrations during stack updates using a dedicated migration Lambda invoked via a CloudFormation custom resource.

Why choose this:

- Makes migrations a deployment gate.
- Gives clearer ordering: infra first, migrations second, app update last.
- Keeps migration execution out of app startup.
- Reduces manual coordination once the workflow is mature enough to justify automation.

Recovery:

- If a migration fails, the CloudFormation step fails and the application update does not proceed.
- Infrastructure rollback does not undo schema changes, so recovery is still fix-forward at the database layer.
- The automation improves deployment ordering, but it does not remove the need for careful migration design, idempotency, and locking.

Tradeoffs:

- Couples schema change execution to CloudFormation lifecycle.
- Needs extra packaging, networking, concurrency control, and observability.
- Schema failures still require fix-forward handling rather than rollback.

### Option 3: Other automated runners

Other automated approaches were explored, including ECS Fargate task runners and CloudFormation hooks.

These remain possible later, but both add complexity without changing the current recommendation.

---

## Decision

**Start with manual database migrations through an EC2 jump-host-based path.**

This is the initial production approach because it is the simplest way to introduce database change management without prematurely coupling migrations to CloudFormation or the application deployment path.

**Move to Lambda-backed custom resource migrations later after we have unblocked development.**

That later step is the preferred automation direction because it keeps migrations out of app startup and can make schema changes a proper deployment gate.
