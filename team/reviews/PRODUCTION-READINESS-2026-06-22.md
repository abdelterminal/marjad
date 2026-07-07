# Production Readiness Review — 2026-06-22

## Scope

Code-based readiness review for MARJAD before higher-volume COD traffic. Focus areas: load, checkout concurrency, rate limiting, admin order operations, data security, queues, observability, and recovery.

## Overall Assessment

MARJAD is suitable for a controlled launch after normal build verification, real production env configuration, and manual smoke testing. It is not yet ready for aggressive paid traffic or multi-instance load balancing without the P0 production-readiness items below.

## Findings

### P0 — Redis-backed rate limits needed before PM2 cluster or multiple app instances

- Current state: `src/lib/rate-limit.ts` stores counters in a process-local `Map`.
- Risk: under PM2 cluster mode or multiple servers, each process has separate counters, so abusive checkout/tracking/login traffic can bypass effective limits.
- Fix: move rate limits to Redis, keyed by route + IP and, where relevant, phone/email.
- Test: parallel requests across multiple Node workers still share one limit window.

### P0 — Checkout concurrency needs automated proof

- Current state: `createOrder()` uses a transaction and `FOR UPDATE`, which is the correct foundation for stock safety.
- Risk: this behavior has no repeatable automated stress test yet.
- Fix: add a concurrency test where more buyers attempt to buy an item than available stock.
- Expected result: stock never goes negative; excess orders return `409`.

### P0 — Production health and alerting are not yet explicit

- Current state: deploy and operations docs exist, but no app health endpoint or monitoring contract is wired.
- Risk: downtime, DB connection failures, disk-full issues, or crashed workers may be discovered by customers first.
- Fix: add `/api/health`, uptime monitoring, PM2/Nginx alerts, DB backup alerts, and disk usage checks.

### P1 — Slow side effects should move to a queue

- Current state: order creation is synchronous and analytics scripts exist client-side; future notifications/courier/pixel server events are not queued.
- Risk: courier/pixel/notification latency or failure could slow or destabilize checkout if added directly.
- Fix: add Redis + BullMQ for notifications, server-side conversion events, courier sync, fraud scoring, and retry/dead-letter handling.

### P1 — Load test suite is missing

- Current state: manual build and code checks have been run, but no k6/Artillery scripts exist.
- Risk: product list, admin order list, risk-hint aggregation, or checkout transaction lock waits may degrade only under traffic.
- Fix: add staging load tests for browsing, PDP traffic, checkout bursts, admin queue usage, and tracking checks.

### P1 — Backup restore needs rehearsal

- Current state: backup/restore commands are documented in `docs/OPERATIONS.md`.
- Risk: an untested backup may not restore cleanly when needed.
- Fix: run a restore drill into staging and document the result.

## Launch Recommendation

For a quiet/manual launch: proceed after final smoke checks, real WhatsApp number, production secrets, HTTPS, and backup verification.

For paid traffic: complete P0 items first, then run the L2 gates in `docs/PRODUCTION_QA_PLAN.md`.

## Next Slice

1. Implement critical Playwright E2E tests.
2. Add checkout concurrency test.
3. Replace process-local rate limiting with Redis-backed rate limiting.
4. Add health endpoint and basic uptime monitor.
5. Run staging load smoke test.

