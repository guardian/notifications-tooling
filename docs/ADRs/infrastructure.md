# ADR: Infrastructure

**Date:** 2026-07-22
**Status:** Accepted
**Deciders:** Notifications Mission — Q2 2026 (temporary 12-week team)

---

## Context

Dispatch is an internal tool used by editorial staff to define and send notifications to Guardian audiences (e.g. mobile push notifications, newsletter emails). It must:

- Authenticate and validate inbound requests.
- Make requests to downstream services (e.g. Braze, mobile notifications API).
- Expose a small, stable RESTful surface (`/v1/notifications`, `/v1/channels/*`, health checks).

It is not a public-facing, high-traffic API. We expect usage to be limited to a small group of permission-ed users sending a few notifications per day.

Two hosting options have been considered:

1. **AWS EC2** — micro instance running an Express server as a long-lived process.
2. **AWS API Gateway + Lambda** — a serverless model where API Gateway routes requests to a Lambda function that contains the Express app (via a handler adapter `@codegenie/serverless-express`).

---

## Decision Drivers

- **Maintenance overhead** — infrastructure that requires minimal patching, capacity planning, and ongoing maintenance is preferred.
- **Cost** — the service has low and bursty traffic; paying for idle compute is wasteful.
- **Guardian CDK support** — the Guardian's shared CDK library (`@guardian/cdk`) provides first-class `GuApiLambda` and `GuEc2App` patterns.
- **Cold-start tolerance** — requests arrive from internal users who already accept a small interaction latency; sub-100 ms cold starts are not required.
- **Security** — managed runtimes and automatic patching reduce the attack surface without manual effort.
- **Scalability** — while traffic is low today, the architecture should not become a bottleneck if usage grows.

---

## Options Considered

### Option 1: EC2

Run an Express server on a Guardian-standard EC2 instance behind a load balancer.

| #   | Pros                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Persistent connections** — long-lived TCP connections to downstream services (Braze, mobile-n10n) avoid repeated TLS handshakes and can benefit from connection pooling.           |
| 2   | **Predictable, low latency** — no cold-start penalty; every request is handled by a warm process.                                                                                    |
| 3   | **Familiar runtime model** — standard Node.js/Express behaviour; no handler-adapter shim required. Libraries that use global state, timers, or open file handles behave as expected. |
| 4   | **Long-running tasks** — if the broker ever needs to hold a connection open (e.g. streaming, long polling), there is no execution time limit.                                        |
| 5   | **Easier local parity** — `bun run dev` locally mirrors production directly; no local Lambda emulation needed.                                                                       |

| #   | Cons                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Always-on cost** — the instance runs 24/7 even when there is no traffic. For a low-volume internal tool this is unnecessary.                                                                        |
| 2   | **OS / AMI maintenance** — the team must keep the base AMI patched and rotated. Guardian tooling automates much of this, but it still requires periodic attention.                                    |
| 3   | **Capacity planning** — instance type must be chosen upfront; under-sizing risks OOM/CPU issues; over-sizing wastes money.                                                                            |
| 4   | **Slower deployments** — rolling AMI updates or instance replacements are slower than a Lambda code push.                                                                                             |
| 5   | **More IAM / networking surface** — an EC2 instance in a VPC requires security groups, subnets, and instance profiles alongside the application code. In practice this is mostly abstracted by GuCDK. |

---

### Option 2: API Gateway + Lambda (Serverless)

Host the Express app behind API Gateway, with the Lambda runtime wrapping the existing handler via a serverless adapter.

| #   | Pros                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Pay-per-request** — Lambda charges only for invocation duration; idle periods cost nothing.                                                                                                |
| 2   | **Zero server management** — no AMI patching, OS updates, or instance lifecycle to manage. AWS handles runtime security patches for Node.js 24.x automatically.                              |
| 3   | **Automatic scaling** — Lambda scales horizontally per request without any configuration.                                                                                                    |
| 4   | **Fast deployments** — uploading a new zip file and updating the Lambda completes in seconds, making CI/CD fast.                                                                             |
| 5   | **Native Guardian CDK support** — `GuApiLambda` provides most of what we need out of the box.                                                                                                |
| 6   | **Built-in structured logging & tracing** — Lambda integrates with CloudWatch Logs, and the Guardian's Kinesis log shipping without additional configuration.                                |
| 7   | **Concurrency rate-limiting** — `reservedConcurrentExecutions: 1` (already set in CDK for CODE) provides a simple hard cap that protects downstream services and our other Lambda processes. |

| #   | Cons |
| --- | ---- |

    | 1 | **Cold starts** — a Lambda that has been idle for several minutes will incur a cold start (~200–500 ms for a Node.js 24.x function at typical bundle sizes). [Provisioned Concurrency](https://docs.aws.amazon.com/lambda/latest/dg/provisioned-concurrency.html) can eliminate this if it becomes a problem. |

| 2 | **15-minute execution limit** — individual Lambda invocations cannot exceed 15 minutes. Not a concern for the application's current requirements, but rules out ever running long batch jobs inside the same function. |
| 3 | **Stateless by design** — in-memory caches are not shared across concurrent Lambda instances. Shared state requires an external store (ElastiCache, SSM Parameter Store, DynamoDB). |
| 4 | **Adapter shim required** — the Express app must be wrapped with a serverless adapter (`@codegenie/serverless-express`). This adds a thin layer of indirection that must be kept up to date. |
| 5 | **Local development environment** — running the app locally with `bun run dev` uses plain Express; the Lambda handler path is only exercised in deployed environments (or with a local emulator such as SAM CLI). |
| 6 | **Larger payloads** — API Gateway has a 10 MB request/response payload limit. Not a concern for the current notification payloads, but worth noting if large assets are ever handled. |

---

## Decision

**Use AWS API Gateway + Lambda** via the Guardian CDK `GuApiLambda` pattern.

The serverless model eliminates operational overhead, aligns with Guardian CDK conventions, and is cost-optimal for the workload. The identified cons (cold starts, 15-minute limit, stateless caches) either do not apply to this use case or can be mitigated inexpensively if they become issues in future.

EC2 would only become preferable if one or more of the following conditions held:

- Sustained high-throughput traffic making Lambda per-invocation pricing more expensive than a reserved instance.
- A hard requirement for persistent server-side connections or long-running jobs within the application itself.

---

## Consequences

- The CDK stack uses `GuApiLambda` (see `cdk/lib/notifications.ts`). This is the single authoritative infrastructure definition; no EC2 resources are provisioned.
- The Express app in `src/apps/backend` is wrapped by a Lambda handler, which adapts API Gateway proxy events to Express.
- Any shared state must be externalised to AWS SSM Parameter Store, or a similar service rather than held in process memory.
- If cold-start latency becomes noticeable to users, Provisioned Concurrency should be evaluated before considering a move to EC2.
