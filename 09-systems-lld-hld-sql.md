# 09 — Systems: LLD, HLD, SQL, Backend

**Weeks 9+ (2 hours/week, weekends).** DSA gets you past the screen. This file is what makes you look like an engineer rather than a problem-solver, and it's most of the difference between an intern offer and a full-time one.

Ordering by return on investment for your situation:
1. **SQL** — cheapest points on the board. A few weekends.
2. **LLD** — asked at intern and new-grad level, and it's genuinely useful for your own projects.
3. **Backend depth** — you already have this; deepen and make it legible.
4. **HLD** — rarely asked of interns, mandatory for full-time. Start it, don't rush it.

---

## 9.1 SQL — do this first

Highest points-per-hour in the entire curriculum. Two or three weekends gets you competent.

### The mental model

SQL is declarative: you describe the result you want, the engine figures out how. Clauses execute in this logical order — knowing it explains most confusing behavior:

```
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT
```

Two consequences people get wrong constantly:
- **`WHERE` filters rows *before* grouping; `HAVING` filters groups *after*.** Aggregate conditions must go in `HAVING`.
- **Column aliases defined in `SELECT` aren't usable in `WHERE`** (SELECT runs later), but *are* usable in `ORDER BY`.

### Joins

```sql
-- INNER: only rows matching in both tables
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT: all rows from the left, NULLs where the right has no match
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- The "find rows with no match" idiom — very common in interviews
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;                 -- users who never ordered

-- SELF JOIN: compare rows within one table
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON e.manager_id = m.id;
```

### Aggregation

```sql
SELECT department,
       COUNT(*)        AS headcount,
       AVG(salary)     AS avg_salary,
       MAX(salary)     AS top_salary
FROM employees
WHERE active = TRUE                -- filters ROWS, before grouping
GROUP BY department
HAVING COUNT(*) > 5                -- filters GROUPS, after
ORDER BY avg_salary DESC
LIMIT 10;
```

`COUNT(*)` counts rows; `COUNT(column)` skips NULLs. That distinction is a favorite trick question.

### Window functions — the intermediate/senior separator

Window functions compute across a set of rows **without collapsing them**, unlike `GROUP BY`.

```sql
SELECT name, department, salary,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn,
       RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS drnk,
       AVG(salary)  OVER (PARTITION BY department) AS dept_avg,
       LAG(salary)  OVER (ORDER BY hire_date) AS prev_hire_salary
FROM employees;
```

| Function | Ties behavior | Use for |
|---|---|---|
| `ROW_NUMBER()` | always distinct (arbitrary among ties) | "pick exactly one per group" |
| `RANK()` | ties share, then skip (1,1,3) | competition ranking |
| `DENSE_RANK()` | ties share, no skip (1,1,2) | "top 3 distinct salaries" |
| `LAG` / `LEAD` | — | comparing to the previous/next row |

**The Nth-highest idiom**, which appears in essentially every SQL interview:

```sql
SELECT * FROM (
  SELECT name, department, salary,
         DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS r
  FROM employees
) t
WHERE r <= 3;                      -- top 3 salaries in each department
```

### Indexes and performance

An index is a **B-tree** over one or more columns. It converts an O(n) table scan into an O(log n) lookup — the same idea as binary search, applied to disk pages.

```sql
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);   -- composite
EXPLAIN ANALYZE SELECT ...;        -- read the query plan
```

Rules worth stating in an interview:
- Index columns used in `WHERE`, `JOIN`, and `ORDER BY`.
- A composite index `(a, b)` serves queries on `a` and on `(a, b)`, but **not** on `b` alone — leftmost-prefix rule.
- Indexes cost write throughput and disk. Every `INSERT`/`UPDATE` maintains every index.
- **`WHERE UPPER(email) = '...'` cannot use an index on `email`** — wrapping a column in a function defeats the index. Same for `WHERE amount + 1 > 100`. This is the most practically useful SQL performance fact there is.

### Practice

[LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/) — do all 50. It's roughly three weekends and covers the entire realistic interview surface. Then [DataLemur](https://datalemur.com/) if you want harder analytics-style questions.

---

## 9.2 LLD — Low-Level Design (Object-Oriented Design)

You're given 35–45 minutes to design and code the classes for a system like a parking lot or an elevator. Being asked to write *working code*, not just boxes, is what makes this "machine coding."

### SOLID — with the reason each exists

Don't recite the acronym. Know what problem each principle prevents.

**S — Single Responsibility.** A class should have one reason to change. A `User` class that also sends emails changes when auth changes *and* when the mail provider changes. Split it.

**O — Open/Closed.** Open for extension, closed for modification. Adding a new payment method shouldn't require editing existing payment code — it should mean adding a new class. If you find yourself editing a growing `if/elif` chain on a type, you've violated this.

**L — Liskov Substitution.** A subclass must be usable anywhere its parent is, without surprises. The canonical violation: `Square extends Rectangle`. `setWidth(5); setHeight(4)` should give area 20, but a Square silently makes it 16. The inheritance is wrong even though "a square is a rectangle" is true in geometry.

**I — Interface Segregation.** Many small interfaces beat one large one. Don't force a class to implement methods it doesn't need — a `Robot` implementing a `Worker` interface shouldn't need `eat()`.

**D — Dependency Inversion.** Depend on abstractions, not concretions. `OrderService` should take a `PaymentGateway` interface, not construct a `StripeClient` directly. This is what makes code testable — you can inject a fake.

Dependency inversion is the one that shows up most in real code review, and it's the one to demonstrate in your design.

### The patterns worth knowing

| Pattern | Problem it solves | Where you'd use it |
|---|---|---|
| **Strategy** | swappable algorithms | pricing rules, sorting policy, payment method |
| **Factory** | creating objects without hardcoding the class | vehicle types, notification channels |
| **Observer** | notify many objects on state change | pub/sub, event systems, UI updates |
| **Singleton** | exactly one instance | config, connection pool (use sparingly — it's global state) |
| **Decorator** | add behavior without subclassing | middleware, coffee toppings, request wrappers |
| **State** | behavior changes with internal state | elevator, order lifecycle, vending machine |
| **Builder** | construct complex objects step by step | query builders, config objects |
| **Adapter** | make an incompatible interface fit | wrapping a third-party SDK |

**Strategy, Factory, Observer, and State cover the vast majority of LLD interviews.** Learn those four properly; recognize the others.

```python
# Strategy — the most-used pattern in LLD interviews
from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def calculate(self, hours: int) -> float: ...

class HourlyPricing(PricingStrategy):
    def calculate(self, hours): return hours * 2.0

class FlatDayPricing(PricingStrategy):
    def calculate(self, hours): return 20.0

class ParkingTicket:
    def __init__(self, strategy: PricingStrategy):
        self.strategy = strategy          # injected, not constructed
    def price(self, hours):
        return self.strategy.calculate(hours)
```

Adding a new pricing scheme means adding a class — no existing code changes. That's Open/Closed and Dependency Inversion demonstrated in fifteen lines. Say that out loud when you write it.

### The LLD interview method

1. **Clarify requirements (5 min).** Functional ("can users reserve a spot?") and scale ("one lot or many?"). Write down 5–7 explicit requirements and get agreement. Scope creep is what kills LLD rounds.
2. **Identify entities (5 min).** Nouns in the requirements become classes: `ParkingLot`, `Level`, `Spot`, `Vehicle`, `Ticket`, `Payment`.
3. **Define relationships.** Who owns whom, one-to-many vs many-to-many. A `ParkingLot` has many `Level`s; a `Level` has many `Spot`s.
4. **Define interfaces and key methods.** `park(vehicle) -> Ticket`, `unpark(ticket) -> Payment`.
5. **Apply patterns where they earn their place.** Strategy for pricing, Factory for vehicle/spot creation. Don't force patterns in — over-engineering is a real negative.
6. **Write the code.** Enums, dataclasses, abstract base classes, then the core logic. Working over complete: implement the main flow fully rather than stubbing everything.
7. **Discuss extensions.** Concurrency (two cars, one spot — you need a lock), persistence, multi-lot scaling.

### The five to actually build

Implement each as real, runnable Python. Not diagrams — code.

1. **Parking Lot** — the canonical one. Spots by size, ticketing, Strategy pricing, Factory for vehicles.
2. **Elevator System** — State pattern, request scheduling, direction logic. Genuinely hard; do it second.
3. **LRU Cache** — you already have this from [file 03](03-stack-search-linkedlist.md). Hashmap + doubly linked list.
4. **Rate Limiter** — implement token bucket, then sliding window log, then sliding window counter. Compare the trade-offs. This is also an HLD topic, so it's double value.
5. **Splitwise / Expense Sharing** — graph of debts, simplification algorithm, multiple split types (equal, exact, percentage).

Others worth knowing: Tic-Tac-Toe, Snake & Ladder, Vending Machine, BookMyShow, Library Management, Logger with levels, In-memory Key-Value store with TTL.

**Put these in a public repo.** `lld-practice` with one folder each, a README explaining the design decisions, and tests. It's a portfolio artifact *and* interview prep simultaneously.

---

## 9.3 HLD — High-Level System Design

Rarely asked of interns. Mandatory for full-time. Start reading in Phase 3; you don't need it in September.

### The vocabulary

**Scaling**
- **Vertical** — a bigger machine. Simple, has a hard ceiling, single point of failure.
- **Horizontal** — more machines. Requires statelessness and a load balancer; effectively unbounded.

**Load balancing** — distributes traffic. Algorithms: round-robin, least-connections, consistent hashing. Layer 4 (TCP, fast) vs Layer 7 (HTTP, can route by path/header).

**Caching** — the single highest-leverage performance tool.
- Where: client → CDN → load balancer → application (Redis/Memcached) → database
- Strategies: **cache-aside** (app checks cache, then DB, then populates — the default), **write-through** (write to both synchronously — consistent, slower), **write-behind** (write to cache, flush to DB async — fast, risks loss)
- Eviction: LRU, LFU, TTL
- **Cache invalidation is genuinely hard.** Say so — it's a known truth and interviewers appreciate the acknowledgment.

**Databases**
- **SQL** — relational, ACID transactions, joins, rigid schema. Postgres, MySQL. Default choice unless you have a specific reason otherwise.
- **NoSQL** — flexible schema, horizontal scaling. Document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j).
- **Replication** — copies of the data. Primary handles writes, replicas handle reads. Scales reads, adds replication lag.
- **Sharding** — splitting data across machines by a shard key. Scales writes. Cross-shard joins become painful, and choosing the shard key is the whole game. A bad key creates hot spots.
- **Indexing** — same B-tree idea as §9.1, at architecture scale.

**Message queues** — Kafka, RabbitMQ, SQS. Decouple producers from consumers, absorb traffic spikes, enable async work (send emails, process video, generate reports). Reach for a queue whenever work doesn't need to happen inside the request.

**CAP theorem** — during a **network partition**, you must choose **consistency** or **availability**. You cannot have both. Note the precondition: CAP only applies during a partition; the "pick 2 of 3" framing is a common oversimplification, and knowing that is itself a signal.
- CP: banking, inventory — better to fail than serve stale data
- AP: social feeds, DNS — better to serve slightly stale data than nothing

**Consistency models** — strong (every read sees the latest write) vs eventual (replicas converge over time). Most large systems choose eventual for read paths.

**Consistent hashing** — a hashing scheme where adding or removing a server only remaps ~1/n of the keys, instead of nearly all of them with naive `hash % n`. Used in CDNs, distributed caches, Cassandra, DynamoDB.

**Other concepts:** rate limiting (token bucket), idempotency keys, CDNs, database connection pooling, circuit breakers, the read-heavy vs write-heavy distinction, back-of-the-envelope estimation.

### The HLD interview framework

45 minutes, roughly:

1. **Requirements (5 min).** Functional ("users can shorten a URL and be redirected") and non-functional ("100M DAU, read-heavy 100:1, 99.9% availability, <100ms redirect"). Write them down.
2. **Estimation (5 min).** Users → QPS → storage → bandwidth. You want an order of magnitude, not precision.
   > 100M DAU × 10 reads/day = 1B reads/day ÷ 86,400s ≈ **12K QPS average**, peak ~3× ≈ **36K QPS**. At 500 bytes/record and 100M new records/day, that's 50 GB/day, ~18 TB/year.
3. **API design (5 min).** The handful of endpoints. `POST /shorten {url} → {short_url}`, `GET /{code} → 302 redirect`.
4. **Data model (5 min).** Tables/collections, key fields, the primary and shard keys.
5. **High-level diagram (10 min).** Client → CDN → LB → App servers → Cache → DB, plus queues and workers.
6. **Deep dive (10 min).** The interviewer picks one component. Be ready to go deep on caching strategy, the sharding key, or how you generate unique IDs.
7. **Bottlenecks and trade-offs (5 min).** Single points of failure, hot keys, what breaks at 10×.

**The two most common mistakes:** jumping to a diagram before establishing requirements, and presenting a design without ever naming a trade-off. Every choice you make, name what it costs.

### The five to learn

1. **URL Shortener** — ID generation (base62, counter vs hash), caching, redirect path
2. **Rate Limiter** — token bucket, distributed counters in Redis, per-user keys
3. **News Feed (Twitter/Instagram)** — fan-out on write vs fan-out on read, and the celebrity problem
4. **Chat (WhatsApp/Slack)** — WebSockets, message ordering, delivery receipts, offline queues
5. **Video Streaming (YouTube)** — chunked upload, transcoding pipeline, CDN, adaptive bitrate

Also common: Dropbox, Uber, Ticketmaster, a web crawler, a distributed key-value store, an autocomplete/typeahead service.

**Resources:** [system-design-primer](https://github.com/donnemartin/system-design-primer) (the standard free reference — read the top-level concepts, then the example problems), [ByteByteGo](https://bytebytego.com/) (paid, excellent), Gaurav Sen and Hussein Nasser on YouTube. For LLD: [low-level-design-primer](https://github.com/prasadgujar/low-level-design-primer).

---

## 9.4 Backend depth — making your existing work legible

You already build backends. The gap between "I build things" and "I'm hired as a backend engineer" is usually about being able to *explain the production concerns*, not about writing more code.

### The stack to be fluent in

**Python + FastAPI** — async request handling, Pydantic validation, dependency injection, middleware, background tasks, auto-generated OpenAPI docs.

**Postgres** — schema design, normalization (and when to denormalize), transactions and isolation levels, migrations (Alembic), connection pooling, `EXPLAIN ANALYZE`.

**Redis** — caching layer, session store, rate limiting, pub/sub, distributed locks.

**Docker** — multi-stage builds, `docker-compose` for local dev, image size discipline.

**Testing** — pytest, fixtures, mocking external services, integration tests against a real DB in CI.

**CI/CD** — GitHub Actions running lint → typecheck → tests → build → deploy. You already do this in both flagship repos; make sure you can *narrate* it.

**Observability** — structured logging, metrics, health checks, error tracking. This is the thing most students have never touched, and mentioning it puts you in a different bucket.

### Concepts you'll be asked about

- **REST vs GraphQL vs gRPC** — and when each fits
- **Authentication vs authorization** — JWT vs session cookies, OAuth2 flow, refresh tokens
- **Idempotency** — why `POST /payments` needs an idempotency key
- **N+1 query problem** — how ORMs cause it, how eager loading fixes it
- **Database transactions** — ACID, isolation levels, what a deadlock is
- **Async vs sync** — when async I/O actually helps (I/O-bound, not CPU-bound), and what the GIL means for Python
- **Pagination** — offset vs cursor-based, and why offset degrades at depth
- **API versioning, rate limiting, CORS**

### Your AI/agents edge

This is genuinely differentiating and you should not treat it as a side interest. Forward-Deployed Engineer and AI-product roles at Anthropic, OpenAI, Scale, and most AI startups want exactly the combination you have: ships real software, understands agent systems, and can talk to non-engineers about business problems. Your business-administration background is an asset in that lane, not a distraction from it.

Depth worth building: RAG (chunking, embeddings, vector stores, retrieval quality), **evals** (the thing most people skip and every serious team needs), tool-calling and function schemas, multi-agent orchestration, prompt caching and cost management, streaming responses, structured outputs.

`atlas-ra` is already the artifact. Deepen it, write about it, and be able to explain one hard technical decision you made in it in two minutes.

---

## 9.5 Weekly schedule for this file

Weekends only, 2 hours, from week 9:

| Weeks | Focus |
|---|---|
| 9–11 | SQL: LeetCode SQL 50, all of it |
| 12–16 | LLD: SOLID + 4 patterns, then build the 5 designs into a public repo |
| 17–22 | HLD: system-design-primer concepts, then the 5 designs |
| 23+ | Backend depth: one deployed service with auth, caching, tests, CI, monitoring |

**Section check:**
- Write a query for "3rd highest salary per department" without looking.
- Explain why `WHERE UPPER(email) = ...` can't use an index.
- Explain Dependency Inversion with a concrete example from your own code.
- Estimate the QPS and storage for a system with 50M DAU.
- Explain what CAP actually says, including the partition precondition.

→ Next: **[10 — Resources](10-resources.md)**
