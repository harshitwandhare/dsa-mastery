# 15 — Databases, End to End

**Weeks 9–11 for SQL (do this early — it's cheap points), then ongoing.** Covers query writing, database internals, modeling, NoSQL, and the backend concerns that get asked in every full-stack and backend loop.

---

## 15.1 SQL — from zero

### The mental model

SQL is **declarative**: you describe the result, the query planner decides how to get it. Understanding the *logical execution order* explains nearly every confusing behavior:

```
1. FROM        pick the base tables
2. JOIN        combine them
3. WHERE       filter individual ROWS
4. GROUP BY    collapse rows into groups
5. HAVING      filter GROUPS
6. SELECT      compute output columns (aliases are created HERE)
7. DISTINCT    dedupe
8. ORDER BY    sort
9. LIMIT       truncate
```

Two consequences people get wrong constantly:
- **A `SELECT` alias can't be used in `WHERE`** (WHERE runs first) but **can** be used in `ORDER BY` (which runs later).
- **Aggregate conditions belong in `HAVING`, not `WHERE`.** `WHERE COUNT(*) > 5` is a syntax error because grouping hasn't happened yet.

### The basics

```sql
SELECT name, salary
FROM employees
WHERE department = 'Engineering'
  AND salary > 100000
  AND hire_date >= '2024-01-01'
ORDER BY salary DESC
LIMIT 10;

-- NULL handling: NULL is not a value, it's "unknown"
WHERE email IS NULL          -- correct
WHERE email = NULL           -- always false, never matches. Classic bug.
COALESCE(nickname, name)     -- first non-NULL
NULLIF(a, b)                 -- NULL if a = b, else a

-- Conditional logic
SELECT name,
       CASE WHEN salary > 150000 THEN 'senior'
            WHEN salary >  90000 THEN 'mid'
            ELSE 'junior'
       END AS level
FROM employees;

-- Set operations
SELECT id FROM a UNION     SELECT id FROM b;   -- dedupes (slower)
SELECT id FROM a UNION ALL SELECT id FROM b;   -- keeps duplicates (faster)
SELECT id FROM a INTERSECT SELECT id FROM b;
SELECT id FROM a EXCEPT    SELECT id FROM b;
```

### Joins — the whole picture

```sql
-- INNER: rows present in both
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT: all left rows, NULLs for missing right
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT: mirror image of LEFT (rarely used — just flip the tables)
-- FULL OUTER: everything from both sides
-- CROSS: cartesian product (every combination) — usually a mistake

-- Anti-join: "find rows with NO match" — very common interview question
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- Self join: compare rows within one table
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Self join for "consecutive" problems
SELECT DISTINCT l1.num
FROM logs l1
JOIN logs l2 ON l1.id = l2.id - 1 AND l1.num = l2.num
JOIN logs l3 ON l1.id = l3.id - 2 AND l1.num = l3.num;
```

**A LEFT JOIN with a condition in `WHERE` silently becomes an INNER JOIN**, because the WHERE filters out the NULL-padded rows. If the condition is about the right table, it belongs in the `ON` clause:

```sql
-- WRONG: acts as an inner join
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'complete'

-- RIGHT: keeps users with no completed orders
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'complete'
```

That distinction is a favorite interview question and a common production bug.

### Aggregation

```sql
SELECT department,
       COUNT(*)              AS total_rows,
       COUNT(bonus)          AS rows_with_bonus,   -- COUNT(col) SKIPS NULLs
       COUNT(DISTINCT title) AS distinct_titles,
       SUM(salary), AVG(salary), MIN(salary), MAX(salary),
       STRING_AGG(name, ', ') AS names             -- GROUP_CONCAT in MySQL
FROM employees
GROUP BY department
HAVING COUNT(*) >= 3
ORDER BY AVG(salary) DESC;
```

Every non-aggregated column in `SELECT` must appear in `GROUP BY` (Postgres enforces this; MySQL historically didn't, which produced silently wrong results).

### Window functions — the intermediate/senior line

Compute across a set of rows **without collapsing them**.

```sql
SELECT name, department, salary,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
       RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk,
       AVG(salary)  OVER (PARTITION BY department)                      AS dept_avg,
       SUM(salary)  OVER (ORDER BY hire_date
                          ROWS BETWEEN UNBOUNDED PRECEDING
                                   AND CURRENT ROW)                     AS running_total,
       LAG(salary, 1)  OVER (ORDER BY hire_date) AS prev_salary,
       LEAD(salary, 1) OVER (ORDER BY hire_date) AS next_salary,
       NTILE(4) OVER (ORDER BY salary)           AS quartile
FROM employees;
```

| Function | Ties | Use for |
|---|---|---|
| `ROW_NUMBER()` | always distinct | "exactly one row per group" |
| `RANK()` | share, then skip (1,1,3) | competition ranking |
| `DENSE_RANK()` | share, no skip (1,1,2) | "top 3 distinct values" |
| `LAG` / `LEAD` | — | compare to previous/next row |
| `NTILE(n)` | — | percentile buckets |
| `FIRST_VALUE` / `LAST_VALUE` | — | boundary values in a window |

**The two idioms that cover most interview questions:**

```sql
-- Nth highest per group
SELECT * FROM (
  SELECT *, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) r
  FROM employees
) t WHERE r <= 3;

-- Latest row per group ("most recent order per customer")
SELECT * FROM (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) r
  FROM orders
) t WHERE r = 1;
```

Frame clauses (`ROWS BETWEEN ...`) control the window per row — used for running totals, moving averages, and cumulative counts.

### CTEs and recursion

```sql
-- Common Table Expression: name a subquery, keep the query readable
WITH dept_avg AS (
  SELECT department, AVG(salary) AS avg_sal
  FROM employees GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_avg d ON e.department = d.department
WHERE e.salary > d.avg_sal;

-- Recursive CTE: hierarchies, org charts, graph traversal in SQL
WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees WHERE manager_id IS NULL       -- anchor
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1
  FROM employees e JOIN org o ON e.manager_id = o.id   -- recursive step
)
SELECT * FROM org ORDER BY depth;
```

Recursive CTEs also generate date series (useful for filling gaps in time-series reports) and traverse graph edges.

### The interview question patterns

| Pattern | Technique |
|---|---|
| Nth highest salary | `DENSE_RANK()` in a subquery, or `LIMIT 1 OFFSET n-1` |
| Duplicate rows | `GROUP BY col HAVING COUNT(*) > 1` |
| Delete duplicates, keep one | `ROW_NUMBER()` partitioned by the key, delete `rn > 1` |
| Rows with no match | LEFT JOIN + `IS NULL` |
| Running total / moving average | window function with a frame clause |
| Month-over-month growth | `LAG()` over an ordered window |
| Consecutive occurrences | self-join on `id = id ± 1`, or `ROW_NUMBER()` gap-and-island |
| Top N per group | `ROW_NUMBER()` partitioned, filter `rn <= N` |
| Pivot rows into columns | `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` per column |
| Median | `PERCENTILE_CONT(0.5)`, or row numbers from both ends |
| Gaps in a sequence | self-join, or `LAG`/`LEAD` comparison |
| First/last event per user | `ROW_NUMBER()` ordered by timestamp |

**Practice:** [LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/) — all 50, roughly three weekends. That's the complete realistic interview surface. Then [DataLemur](https://datalemur.com/) for harder analytics questions if you're targeting data-adjacent roles.

---

## 15.2 Database internals — how it actually works

This is what separates "can write SQL" from "understands databases," and it's asked in every backend loop.

### Storage and B+ trees

Tables live in fixed-size **pages** (typically 8 KB in Postgres, 16 KB in InnoDB) on disk. The database reads and writes whole pages, which is why disk *seeks* matter more than bytes.

An index is a **B+ tree**: a balanced tree with high fan-out (hundreds of keys per node), so depth stays around 3–4 even for billions of rows. Only leaf nodes hold data pointers, and leaves are linked, which makes range scans fast.

```
Lookup cost = tree depth = O(log_fanout n) ≈ 3–4 page reads
Table scan  = O(n) pages
```

That's the entire value of an index: 4 page reads instead of a million.

**Why B+ trees and not binary trees:** binary tree depth for a billion rows is ~30, and each level is a separate disk read. High fan-out collapses 30 reads into 4. The structure exists because of disk physics.

**Clustered vs secondary index:**
- **Clustered** — the table rows *are* stored in index order. One per table (MySQL InnoDB: the primary key). Range queries on it are extremely fast.
- **Secondary** — stores the indexed column plus a pointer to the row. A lookup may need a second read to fetch the full row ("bookmark lookup"). A **covering index** includes all columns the query needs, avoiding that second read entirely.

**Other index types:** hash (O(1) equality, no ranges), GIN/GiST (Postgres, for full-text and JSON), bitmap (low-cardinality columns, analytics).

### Index rules that get asked

```sql
CREATE INDEX idx_user_created ON orders(user_id, created_at);
```

1. **Leftmost prefix rule.** A composite index on `(a, b, c)` serves queries filtering on `a`, `(a,b)`, or `(a,b,c)` — **not** `b` alone or `(b,c)`.
2. **Functions on a column defeat the index.** `WHERE UPPER(email) = 'X'` cannot use an index on `email`. Fix: an expression index `CREATE INDEX ON users(UPPER(email))`, or store a normalized column. Same for `WHERE amount + 1 > 100` and `WHERE DATE(created_at) = '2026-01-01'` — rewrite as a range: `created_at >= '2026-01-01' AND created_at < '2026-01-02'`.
3. **Leading wildcards defeat the index.** `LIKE 'abc%'` uses it; `LIKE '%abc'` cannot.
4. **Low selectivity is not worth indexing.** An index on a boolean column that's 50/50 is usually ignored by the planner — a scan is cheaper than random page reads.
5. **Indexes cost writes.** Every INSERT/UPDATE/DELETE maintains every index on the table. Over-indexing is a real production problem.
6. **Order the composite index by how you query**, with equality columns before range columns: for `WHERE user_id = ? AND created_at > ?`, index `(user_id, created_at)` — not the reverse.

### Reading a query plan

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;
```

What to look for:
- **Seq Scan** on a large table with a selective filter → a missing index
- **Index Scan** / **Index Only Scan** → good; "index only" means the index covered the query
- **Nested Loop** with a big outer row count → possibly a missing index on the join key
- **Hash Join** → fine for large joins
- **Rows estimated vs actual wildly different** → stale statistics; run `ANALYZE`
- **Sort** with a high cost → an index on the ORDER BY column could remove it

Being able to say "I'd run EXPLAIN ANALYZE and look for a sequential scan on the filtered column" is a concrete, credible answer to "how would you debug a slow query."

### Transactions and ACID

**Atomicity** — all or nothing. Implemented with an undo log.
**Consistency** — constraints and invariants hold before and after.
**Isolation** — concurrent transactions don't corrupt each other.
**Durability** — once committed, it survives a crash. Implemented with a **write-ahead log (WAL)**: the intent is written to an append-only log and fsynced *before* the data pages change. On crash recovery, the log is replayed.

### Isolation levels and the anomalies

| Level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| Read Uncommitted | possible | possible | possible |
| Read Committed | prevented | possible | possible |
| Repeatable Read | prevented | prevented | possible* |
| Serializable | prevented | prevented | prevented |

*Postgres's Repeatable Read (snapshot isolation) also prevents phantoms in practice.

- **Dirty read** — you see another transaction's uncommitted change.
- **Non-repeatable read** — you read a row twice in one transaction and get different values.
- **Phantom read** — you run the same range query twice and get different *rows* (someone inserted).
- **Lost update** — two transactions read-modify-write the same row; one overwrite is silently lost. The fix is `SELECT ... FOR UPDATE` (pessimistic) or a version column with a compare-and-set (optimistic).

Defaults: Postgres and Oracle use **Read Committed**; MySQL InnoDB uses **Repeatable Read**. Knowing your database's default is a good sign.

**MVCC (Multi-Version Concurrency Control)** — how Postgres avoids read locks: each write creates a new row version, and readers see a consistent snapshot from their transaction's start. **Readers never block writers and writers never block readers.** The cost is dead-row accumulation, which is why `VACUUM` exists.

**Deadlock** — transaction A holds lock 1 and wants lock 2; B holds 2 and wants 1. Databases detect this and kill one transaction. Prevention: **always acquire locks in a consistent order**, keep transactions short, and use lower isolation where safe.

**Optimistic vs pessimistic locking:**
```sql
-- Pessimistic: lock the row now, others wait
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;

-- Optimistic: check a version at write time, retry on conflict
UPDATE accounts SET balance = 90, version = version + 1
WHERE id = 1 AND version = 7;      -- 0 rows affected → someone else won, retry
```
Optimistic wins when conflicts are rare (most web workloads); pessimistic wins under genuine contention (seat booking, inventory).

---

## 15.3 Data modeling

### Normalization

- **1NF** — atomic values, no repeating groups (no comma-separated lists in a column)
- **2NF** — 1NF + every non-key column depends on the *whole* primary key
- **3NF** — 2NF + no transitive dependencies (non-key columns don't depend on other non-key columns)

In practice: **normalize until it hurts, then denormalize until it works.** Normalization removes update anomalies and duplication; denormalization removes joins from hot read paths. Both are correct in their place, and saying that is the mature answer.

### Keys and constraints

```sql
CREATE TABLE orders (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','shipped','cancelled')),
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, idempotency_key)
);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
```

Points worth making: **store money as integer cents**, never floats (floating point can't represent 0.1 exactly — a genuine class of production bug). Use `TIMESTAMPTZ` and store UTC. Prefer surrogate keys (an auto ID) over natural keys, because natural keys change. Put constraints in the database, not only in application code — the database is the last line of defense and multiple services may write to it.

### Relationships

```sql
-- One-to-many: the foreign key lives on the MANY side
orders.user_id → users.id

-- Many-to-many: a junction table
CREATE TABLE student_courses (
    student_id BIGINT REFERENCES students(id),
    course_id  BIGINT REFERENCES courses(id),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (student_id, course_id)
);

-- One-to-one: FK with a UNIQUE constraint, or share the PK
```

### Schema migrations

Migrations must be **backward compatible** during a rolling deploy, because old and new code run simultaneously:

1. Add the new nullable column (old code ignores it)
2. Deploy code that writes both old and new
3. Backfill existing rows in batches
4. Deploy code that reads the new column
5. Drop the old column in a later release

Never do a blocking `ALTER TABLE` on a large hot table — adding a NOT NULL column with a default rewrites the whole table on older engines. Use `CREATE INDEX CONCURRENTLY` in Postgres to avoid locking writes.

---

## 15.4 NoSQL

### When to actually use it

Use SQL by default. Choose NoSQL when you have a specific reason:
- write volume beyond what a single primary can absorb (Cassandra)
- a genuinely schema-less or rapidly changing shape (documents)
- O(1) key access at massive scale with no complex queries (DynamoDB, Redis)
- relationship traversal is the core query (graph)
- full-text search (Elasticsearch, as a secondary index — never as the source of truth)

"NoSQL scales better" alone is not an answer. Modern Postgres handles very large workloads, and you lose joins, transactions, and ad-hoc querying.

### Redis — the one you'll use most

```python
r.set("session:abc", data, ex=3600)          # string + TTL
r.incr("rate:user:42")                        # atomic counter
r.lpush("queue:jobs", job); r.brpop("queue:jobs")   # list as a queue
r.sadd("online_users", user_id)               # set
r.zadd("leaderboard", {"alice": 42})          # sorted set → rankings, top-N
r.hset("user:1", mapping={"name": "A"})       # hash → object fields
r.setnx("lock:resource", token)               # distributed lock (+ TTL always)
```

Redis is **single-threaded for commands**, which is why individual operations are atomic and why one slow command (`KEYS *` on a large DB) blocks everything. Use `SCAN`, not `KEYS`.

Persistence: RDB (periodic snapshots — fast restart, can lose recent writes) vs AOF (append-only log — more durable, larger). Know both exist, and that Redis is not a database of record unless you configure it to be.

**Distributed locks with Redis:** `SET key token NX PX 30000`. Always set a TTL (otherwise a crashed holder deadlocks the resource forever) and always check the token before releasing (otherwise you release someone else's lock). Mention that this is not perfectly safe under partitions — Redlock's safety is genuinely debated. Knowing there's a debate is the signal.

### Document stores

MongoDB and similar: JSON documents, flexible schema, embed related data to avoid joins. Choose embedding when data is always read together and bounded in size; choose referencing when it's large, unbounded, or shared. The classic modeling failure is unbounded array growth inside a document (a post with a million embedded comments).

### Wide-column

Cassandra/HBase: **the query drives the schema, not the other way around.** You design the partition key so each query hits exactly one partition. Massive write throughput, tunable consistency via quorum (`W + R > N`). Bad at ad-hoc queries — if you need a new access pattern, you build a new table.

---

## 15.5 Backend database concerns

### The N+1 query problem

The most common real-world performance bug, and a frequent interview question.

```python
# N+1: one query for users, then one per user for their orders
users = session.query(User).all()               # 1 query
for user in users:
    print(user.orders)                          # N more queries

# Fixed: eager load in a single join
users = session.query(User).options(joinedload(User.orders)).all()   # 1 query
```

Symptom: a page that's fast with 10 rows and unusable with 1,000. Diagnosis: log the SQL and count the queries.

### Connection pooling

Opening a database connection costs a TCP handshake plus authentication — 10–100 ms. Pools keep connections open and hand them out.

Postgres uses one process per connection, so it can't handle thousands. Pool sizing rule of thumb: `(2 × CPU cores) + effective spindle count`, usually 10–30 per app instance, not hundreds. At high instance counts, put PgBouncer in front. "Too many connections" outages are extremely common in production.

### Pagination

```sql
-- Offset pagination: simple, but degrades badly
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100000;
-- The database must scan and discard 100,000 rows. Also: rows shift between
-- pages when new data arrives, so users see duplicates or miss items.

-- Cursor (keyset) pagination: O(log n), stable under inserts
SELECT * FROM posts
WHERE (created_at, id) < ('2026-08-01 10:00:00', 4242)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Cursor pagination is the correct answer for any infinite-scroll or large dataset. The tuple comparison `(created_at, id)` breaks ties deterministically.

### Bulk operations

```python
# Slow: N round trips
for row in rows:
    session.add(Model(**row))
    session.commit()

# Fast: one round trip, one transaction
session.bulk_insert_mappings(Model, rows)
session.commit()

# Postgres: COPY is far faster than INSERT for large loads
```

Round trips dominate. Batching is usually a 10–100× improvement, and knowing that is a concrete performance answer.

### Soft deletes, auditing, and time

```sql
deleted_at TIMESTAMPTZ NULL          -- soft delete: filter WHERE deleted_at IS NULL
created_at, updated_at TIMESTAMPTZ   -- always have both
```

Soft deletes preserve history and make "undo" possible, but every query must remember the filter, and unique constraints get complicated (use a partial index: `UNIQUE (email) WHERE deleted_at IS NULL`).

**Always store UTC.** Convert at the presentation layer. Timezone bugs are a large fraction of real production incidents.

### Security

- **SQL injection** — always use parameterized queries. Never build SQL with string formatting. This is asked and it's non-negotiable.
  ```python
  cur.execute("SELECT * FROM users WHERE email = %s", (email,))    # safe
  cur.execute(f"SELECT * FROM users WHERE email = '{email}'")      # exploitable
  ```
- **Least privilege** — the app's database user should not be a superuser and should not have DDL rights in production.
- **Encryption** — TLS in transit; at rest via disk or column-level encryption. Hash passwords with bcrypt/argon2, never a plain hash, and never store them recoverably.
- **PII** — know what you store, and be able to delete it (GDPR/CCPA right to erasure). Soft deletes complicate this.

---

## 15.6 Study plan and checks

| Week | Work |
|---|---|
| 9 | SQL basics + joins. LeetCode SQL 50, problems 1–20. |
| 10 | Aggregation + window functions. SQL 50, problems 21–40. |
| 11 | CTEs + the query patterns table. SQL 50, problems 41–50. |
| 12 | Internals: B+ trees, indexes, `EXPLAIN ANALYZE` on a real table in one of your projects |
| 13 | Transactions, isolation levels, MVCC, deadlocks |
| Ongoing | Modeling, NoSQL, backend concerns — apply them in job-sentinel and atlas-ra |

**Section check:**
- Write "3rd highest salary per department" from memory.
- Explain why `WHERE UPPER(email) = 'X'` can't use an index on `email`.
- Explain the leftmost-prefix rule.
- Explain the difference between a non-repeatable read and a phantom read.
- Explain MVCC in one sentence.
- Explain the N+1 problem and how you'd detect it.
- Explain why cursor pagination beats offset pagination.
- Write a parameterized query and explain why string formatting is unsafe.

→ Next: **[16 — CS Fundamentals](16-cs-fundamentals.md)**
