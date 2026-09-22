# Runbook: locating and permanently deleting a notification (legal erasure)

**Audience:** engineers with `composer` AWS access.
**When to use:** a legal/compliance request requires a specific notification —
including any record of what it contained — to be erased from the database.

> This runbook covers the manual, SQL-level procedure only. We do **not** expose
> a delete endpoint; erasure is a deliberate, human-in-the-loop operation.

---

## What "the notification and anything related to it" means

Notification data lives in exactly **two** tables (see
[notification-history-data-model.md](../notification-history-data-model.md)):

| Table                     | Holds                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `notifications`           | The request envelope **and** the sensitive payload: `content` and `channels` (`jsonb`), `created_by_email`, `sender`, `failed_targets`. |
| `notification_dispatches` | One row per downstream provider call: `requested` / `resolved` (`jsonb`), `provider_ref`, `failure_reason`, `provider_status_code`.     |

`notification_dispatches.notification_id` is a foreign key onto
`notifications.id` declared **`ON DELETE CASCADE`**
(`src/packages/database/schema/notification-dispatches.ts`). Deleting the parent
`notifications` row therefore removes every child dispatch row **atomically** —
you do not delete dispatches by hand, and there is no third table to clean up.

All sensitive fields (message body, audience, sender identity, downstream
provider references) are contained within these two rows. Removing them removes
the record entirely from the live database.

> **Backups caveat — read before you promise erasure.** A `DELETE` only affects
> the live database. The row can still exist in RDS automated backups,
> point-in-time-recovery WAL, and any manual snapshots until those expire or are
> re-created. If the legal request demands erasure from backups too, raise it
> with whoever owns the RDS backup retention policy — that is out of scope for
> this SQL procedure.

---

## Step 1 — connect to the correct database

Erasure requests almost always target **PROD**. Double-check the stage before
you connect.

1. Get fresh `composer` credentials (AWS SSO / Janus).
2. Open an SSM port-forward tunnel to the target stage (leave it running in its
   own terminal):

   ```bash
   # from src/packages/database
   bun run db:migration:tunnel --stage PROD   # or --stage CODE
   ```

   This forwards the remote Postgres `:5432` to `localhost:6543`.

3. Read the database credentials from Secrets Manager (secret
   `/[stage]/notifications/dispatch/db`, `composer` profile, `eu-west-1`).
4. Connect through the tunnel. With `psql`:

   ```bash
   psql "postgresql://<user>:<password>@localhost:6543/dispatchdb?sslmode=require"
   ```

   Or use DBeaver — see _How to connect to the DB using DBeaver_ in
   [`src/packages/database/README.md`](../../src/packages/database/README.md)
   (host `localhost`, port `6543`, database `dispatchdb`).

---

## Step 2 — locate the exact notification

You need the notification's `id` (a UUID). Use whichever identifier the request
gives you. **Always confirm you have a single, correct row before deleting.**

### By notification id (preferred — e.g. from the UI deep-link or API response)

```sql
SELECT id, kind, status, sender, created_by_email, dry_run, scheduled_for, created_at
FROM notifications
WHERE id = '00000000-0000-0000-0000-000000000000';
```

### By idempotency key

```sql
SELECT id, kind, status, created_by_email, created_at
FROM notifications
WHERE idempotency_key = 'the-idempotency-key';
```

### By sender and time window

```sql
SELECT id, kind, status, sender, created_by_email, created_at
FROM notifications
WHERE lower(created_by_email) = lower('person@guardian.co.uk')
  AND created_at BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY created_at DESC;
```

### By content (when you only know what the message said)

`content` is stored verbatim as `jsonb`, so you can search inside it. This scans
the table (no index on the JSON), which is fine for a one-off erasure:

```sql
SELECT id, created_by_email, created_at, content
FROM notifications
WHERE content::text ILIKE '%some sensitive phrase%';
```

### By downstream provider reference (from a mobile-n10n / Braze trace)

```sql
SELECT n.id, n.created_at, d.channel, d.provider_ref
FROM notification_dispatches d
JOIN notifications n ON n.id = d.notification_id
WHERE d.provider_ref = 'the-provider-id';
```

### Inspect before deleting

Once you have a candidate `id`, review the full record — the parent and its
dispatch children — so you are certain it is the right one:

```sql
-- The payload you are about to erase.
SELECT id, kind, status, sender, created_by_email, content, channels, failed_targets
FROM notifications
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Its downstream calls (these cascade-delete with the parent).
SELECT id, channel, requested, resolved, provider_ref, status, failure_reason
FROM notification_dispatches
WHERE notification_id = '00000000-0000-0000-0000-000000000000';
```

---

## Step 3 — delete inside a transaction

Run the delete in an explicit transaction so you can verify the affected row
counts **before** committing. The child dispatches are removed automatically by
the cascade.

```sql
BEGIN;

-- Optional but recommended: confirm how many dispatch rows will cascade away.
SELECT count(*) AS dispatches_to_delete
FROM notification_dispatches
WHERE notification_id = '00000000-0000-0000-0000-000000000000';

-- Deletes the parent; notification_dispatches rows cascade automatically.
DELETE FROM notifications
WHERE id = '00000000-0000-0000-0000-000000000000';
-- Expect: DELETE 1

-- Verify nothing remains before committing.
SELECT count(*) AS parent_remaining
FROM notifications
WHERE id = '00000000-0000-0000-0000-000000000000';                     -- expect 0

SELECT count(*) AS dispatches_remaining
FROM notification_dispatches
WHERE notification_id = '00000000-0000-0000-0000-000000000000';         -- expect 0

COMMIT;   -- or ROLLBACK; if any count is unexpected
```

If `DELETE 1` is not reported, or either verification count is non-zero,
`ROLLBACK;` immediately and re-check the `id` from Step 2.

---

## Step 4 — close down

1. Confirm the two verification counts were `0` and that you committed.
2. Stop the SSM tunnel (`Ctrl-C` in the tunnel terminal).
3. Record the erasure per your team's compliance process: the notification `id`,
   the stage, the requester, and the reason — but **not** the deleted content
   itself.

---

## Quick reference

```sql
-- 1. find it
SELECT id, created_by_email, created_at FROM notifications WHERE id = '<uuid>';

-- 2. erase it (dispatches cascade)
BEGIN;
DELETE FROM notifications WHERE id = '<uuid>';   -- expect DELETE 1
COMMIT;
```
