# 14 — High-Level Design, In Depth

**Weeks 19–28.** Rarely asked of interns, mandatory for full-time and for any senior conversation. Three things changed by 2026: the passing bar is higher, **cost and operations are graded explicitly**, and LLM/AI-infrastructure prompts have entered general engineering loops.

Read §14.1–14.3 first (concepts), then work the designs in §14.5. Don't attempt designs before the vocabulary is solid — you'll produce boxes without reasons, which is exactly what fails.

---

## 14.1 The numbers you must know cold

Back-of-the-envelope estimation is a graded skill. Memorize these.

### Latency

| Operation | Time |
|---|---|
| L1 cache reference | 0.5 ns |
| Branch mispredict | 5 ns |
| L2 cache reference | 7 ns |
| Mutex lock/unlock | 25 ns |
| Main memory reference | 100 ns |
| Compress 1 KB with Zippy | 3 μs |
| Send 1 KB over 1 Gbps network | 10 μs |
| Read 4 KB randomly from SSD | 150 μs |
| Read 1 MB sequentially from memory | 250 μs |
| Round trip within the same datacenter | 500 μs |
| Read 1 MB sequentially from SSD | 1 ms |
| Disk seek (spinning) | 10 ms |
| Read 1 MB sequentially from disk | 20 ms |
| Packet CA → Netherlands → CA | 150 ms |

**The takeaways that matter in an interview:** memory is ~100× faster than SSD, SSD is ~10–100× faster than spinning disk, and cross-continent network is ~150 ms no matter what you do. That last one is why CDNs exist and why you can't design your way around the speed of light.

### Capacity

```
1 KB = 10³   1 MB = 10⁶   1 GB = 10⁹   1 TB = 10¹²   1 PB = 10¹⁵

Seconds per day       ≈ 86,400  ≈ 10⁵      (use 10⁵ for mental math)
Seconds per month     ≈ 2.5 × 10⁶
Requests/day → QPS:   divide by 100,000

char = 1 byte (ASCII)         int = 4 bytes         timestamp = 4–8 bytes
UUID = 16 bytes               a typical row ≈ 100 bytes – 1 KB
a tweet ≈ 300 bytes           a photo ≈ 200 KB – 2 MB
1 minute of 1080p video ≈ 50 MB
```

### A worked estimation

> Design Twitter. 300M MAU, 50% daily active, each user posts 2 tweets/day and reads 100 tweets/day.

```
DAU                  = 150M
Write QPS            = 150M × 2 / 10⁵         = 3,000 QPS
Peak write (×3)      = 9,000 QPS
Read QPS             = 150M × 100 / 10⁵       = 150,000 QPS
Peak read (×3)       = 450,000 QPS
→ read:write ratio ≈ 50:1 — READ-HEAVY. Cache aggressively; fan-out on write.

Storage: 300M tweets/day × 300 bytes ≈ 90 GB/day ≈ 33 TB/year (text only)
Media:   10% of tweets have a 1 MB image → 30M × 1 MB = 30 TB/day ← dominates
→ media goes to object storage + CDN, never the database.

Cache:  80/20 rule — 20% of tweets serve 80% of reads.
        Daily hot set ≈ 90 GB × 0.2 = 18 GB → fits comfortably in Redis.
```

**Do this out loud.** The numbers don't need to be right; the *reasoning chain* — DAU → QPS → storage → what dominates → what that implies architecturally — is what's scored. Notice the design decision fell out of the arithmetic: media dominates storage, so it can't live in the DB.

---

## 14.2 The building blocks

### Load balancers

Distribute traffic across servers. Also the place where health checks and TLS termination live.

| Algorithm | Behavior | When |
|---|---|---|
| Round robin | rotate evenly | uniform servers, stateless requests |
| Weighted round robin | proportional to capacity | mixed hardware |
| Least connections | fewest active connections | long-lived or variable-duration requests |
| Least response time | fastest responder | latency-sensitive |
| IP hash / consistent hash | same client → same server | sticky sessions, cache affinity |

**Layer 4** (TCP) — routes on IP/port, very fast, no visibility into content.
**Layer 7** (HTTP) — routes on path, header, or cookie. Enables `/api/*` → one pool, `/static/*` → another. Slower, far more useful.

The LB is a single point of failure, so it's deployed in an active-passive or active-active pair with a floating IP or DNS failover.

### Caching

The highest-leverage tool in system design. Know the layers and the strategies.

**Layers, outermost to innermost:** browser cache → CDN → reverse proxy → application cache (Redis/Memcached) → database query cache → OS page cache.

**Strategies:**

| Strategy | How | Trade-off |
|---|---|---|
| **Cache-aside (lazy)** | app checks cache; miss → read DB → populate cache | most common; first request is slow; possible staleness |
| **Read-through** | cache itself fetches on miss | simpler app code; needs cache support |
| **Write-through** | write to cache and DB synchronously | consistent; slower writes |
| **Write-behind** | write to cache, flush to DB asynchronously | fastest writes; data loss risk if cache dies |
| **Refresh-ahead** | proactively refresh before expiry | low latency; wasted work on wrong predictions |

**Eviction:** LRU (default choice), LFU (better for stable popularity), FIFO, TTL, random.

**The three failure modes to name unprompted:**
- **Cache stampede / thundering herd** — a popular key expires and thousands of requests hit the DB simultaneously. Fix: a lock so only one request repopulates, or probabilistic early expiry.
- **Cache penetration** — repeated requests for keys that don't exist bypass the cache entirely. Fix: cache the negative result, or use a Bloom filter.
- **Hot key** — one key gets a disproportionate share of traffic and saturates a single cache node. Fix: replicate the key across nodes with a suffix, or add a local in-process cache.

**Cache invalidation is genuinely hard.** The honest options are TTL (simple, eventually consistent), explicit invalidation on write (correct, easy to miss a path), and versioned keys (`user:123:v7` — invalidation by bumping the version, never a stale read).

### Databases

**SQL** — relational, ACID, joins, strong schema. Postgres, MySQL. **This is the default.** Choose it unless you can articulate why not.

**NoSQL families:**

| Type | Examples | Good at | Bad at |
|---|---|---|---|
| Key-value | Redis, DynamoDB | O(1) lookup, caching, sessions | queries by anything but the key |
| Document | MongoDB, Firestore | flexible schema, nested objects | multi-document transactions, joins |
| Wide-column | Cassandra, HBase | massive writes, time-series | ad-hoc queries |
| Graph | Neo4j | relationship traversal | analytics over everything |
| Search | Elasticsearch | full-text, faceting | as a source of truth |
| Time-series | InfluxDB, TimescaleDB | metrics, downsampling | general workloads |

**ACID** (relational guarantees): **A**tomicity (all or nothing), **C**onsistency (invariants hold), **I**solation (concurrent transactions don't interfere), **D**urability (committed = survives a crash).

**BASE** (the NoSQL trade): **B**asically **A**vailable, **S**oft state, **E**ventually consistent.

**Replication**
- **Primary-replica**: one writer, many readers. Scales reads. Introduces **replication lag** — a user can write then immediately read a stale value from a replica. Fix: read-your-writes routing (send that user's reads to the primary for a few seconds).
- **Multi-primary**: writes anywhere. Scales writes, but you must resolve write conflicts (last-write-wins, vector clocks, CRDTs).

**Sharding (horizontal partitioning)** — split data across machines.

| Strategy | Pro | Con |
|---|---|---|
| Range-based (`A–M`, `N–Z`) | range queries are easy | hot spots when data is skewed |
| Hash-based (`hash(key) % n`) | even distribution | range queries hit every shard; resharding moves everything |
| Consistent hashing | resharding moves only ~1/n of keys | more complex |
| Directory-based (a lookup service) | flexible | the directory is a new SPOF |

**The shard key is the whole game.** A bad key creates hot shards (sharding tweets by `celebrity_id`) or forces cross-shard queries on the common path. Cross-shard joins and transactions are the main cost of sharding — say this.

**Denormalization** — deliberately duplicating data to avoid joins. Standard at read-heavy scale; the cost is keeping copies in sync.

### Message queues and streaming

Decouple producer from consumer. Absorb spikes. Enable async work.

| System | Model | Use |
|---|---|---|
| **Kafka** | distributed log, consumers track offsets, messages retained | event streaming, replay, analytics pipelines, high throughput |
| **RabbitMQ** | traditional broker, messages deleted on ack | task queues, complex routing |
| **SQS** | managed queue, at-least-once | simple decoupling on AWS |
| **Redis Streams / Pub-Sub** | lightweight | low-latency fan-out, no durability guarantees with pub/sub |

**Delivery semantics:** at-most-once (may lose), at-least-once (may duplicate — the common default), exactly-once (expensive, usually achieved as at-least-once + idempotent consumers). **The practical answer is almost always "at-least-once delivery with idempotent consumers,"** and knowing that is a strong signal.

**Reach for a queue when:** the work doesn't need to happen inside the request (emails, thumbnails, transcoding, indexing), traffic is spiky, or you need to decouple deploy cycles between services.

### CDN

Geographically distributed caches for static assets — images, video, JS/CSS. Cuts latency (the 150 ms cross-continent problem) and offloads origin traffic.

Push CDN (you upload) vs pull CDN (fetches from origin on first request; the usual choice). Invalidate with versioned URLs (`app.a3f9c2.js`) rather than purges — purges are slow and unreliable.

### Consistency and CAP

**CAP theorem, stated correctly:** during a **network partition**, a distributed system must choose between **consistency** and **availability**. It cannot have both. The precondition matters — "pick 2 of 3" is a common oversimplification, and correcting it earns credit.

- **CP** — refuse requests rather than serve stale data. Banking, inventory, bookings.
- **AP** — serve possibly-stale data rather than fail. Feeds, DNS, product catalogs.

**PACELC** extends it: during a **P**artition, choose **A** or **C**; **E**lse (normal operation), choose **L**atency or **C**onsistency. This is the more useful framing because the normal-operation trade-off is the one you live with every day.

**Consistency models**, strongest to weakest: linearizable → sequential → causal → eventual. Most large-scale reads are eventually consistent; most money movements are linearizable.

**Distributed transactions:** two-phase commit (blocking, fragile) vs the **Saga pattern** (a sequence of local transactions with compensating actions on failure). Sagas are what real microservice systems use — name it.

### Other essential concepts

- **Consistent hashing** — a hash ring where adding/removing a node remaps only ~1/n of keys, versus nearly all with `hash % n`. Virtual nodes smooth the distribution. Used by Cassandra, DynamoDB, and every distributed cache.
- **Rate limiting** — token bucket (bursts allowed), sliding window counter (smooth, approximate), sliding window log (exact, expensive). Distributed enforcement uses Redis with atomic INCR + expiry. See [file 13](13-lld-deep.md) for implementations.
- **Idempotency** — an operation safe to retry. `POST /payments` needs a client-supplied idempotency key stored server-side so retries return the original result instead of double-charging. Ask about this in any design involving money or messaging.
- **Circuit breaker** — after N consecutive failures to a dependency, stop calling it and fail fast; probe periodically to recover. Prevents cascading failure.
- **Bulkhead** — isolate resource pools so one slow dependency can't exhaust every thread.
- **Backpressure** — signal upstream to slow down rather than dropping work or exhausting memory.
- **Leader election** — Raft, Paxos, or ZooKeeper/etcd. You don't implement these; you name them.
- **Bloom filter** — probabilistic set membership in tiny memory. No false negatives, tunable false positives. Used to avoid pointless disk reads (Cassandra) and cache penetration.
- **Write-ahead log (WAL)** — durability primitive: write the intent to an append-only log before mutating state. Underpins database crash recovery and replication.
- **Quorum** — with N replicas, W writes and R reads; if `W + R > N`, reads see the latest write. The DynamoDB/Cassandra tuning knob.

### Observability and cost — explicitly graded in 2026

Do not finish a design without touching these. It's the fastest way to look like someone who has operated a system rather than only read about one.

- **Metrics** — RED (Rate, Errors, Duration) for services; USE (Utilization, Saturation, Errors) for resources. Prometheus + Grafana.
- **Logging** — structured (JSON), centralized, with a correlation/request ID threaded through every service.
- **Tracing** — distributed traces (OpenTelemetry, Jaeger) to find where latency actually goes across service hops.
- **Alerting** — alert on symptoms users feel (error rate, p99 latency), not on causes (CPU). Every alert needs a runbook.
- **SLI / SLO / SLA** — indicator (measured), objective (internal target, e.g. 99.9% of requests under 200 ms), agreement (contractual, with penalties). Error budget = 1 − SLO, and it's what justifies shipping velocity.
- **Cost** — name the dominant cost driver in your design and one way to cut it. Egress bandwidth and cross-AZ traffic are usually the surprises; storage tiering (hot/warm/cold) and cache hit rate are the usual levers.
- **Deployment** — blue-green, canary, feature flags, and how you roll back.

---

## 14.3 The interview framework

45 minutes. Drive the conversation; don't wait to be asked.

| Phase | Time | What to produce |
|---|---|---|
| 1. Requirements | 5 min | functional + non-functional, written down |
| 2. Estimation | 5 min | QPS, storage, bandwidth, read:write ratio |
| 3. API design | 5 min | the 3–6 endpoints that matter |
| 4. Data model | 5 min | tables/collections, keys, shard key |
| 5. High-level architecture | 10 min | the boxes and the flow |
| 6. Deep dive | 10 min | whichever component they pick |
| 7. Bottlenecks, failure, cost | 5 min | SPOFs, hot keys, what breaks at 10× |

**Phase 1 — requirements.** Functional: what can users do (3–5 things, agreed and bounded). Non-functional: scale (DAU, QPS), latency targets, availability target, consistency needs, read:write ratio, durability. *Non-functional requirements drive the architecture* — a 99.99% availability requirement and a 100:1 read ratio decide most of your design before you've drawn anything.

**Phase 2 — estimation.** As in §14.1. Let the numbers pick the architecture and say so out loud.

**Phase 3 — API.** Keep it small and concrete:
```
POST /v1/urls           {long_url, custom_alias?}  → {short_url}
GET  /{code}                                        → 302 redirect
GET  /v1/urls/{code}/stats                          → {clicks, created_at}
```
Mention auth, rate limits, and pagination style (cursor, not offset).

**Phase 4 — data model.** Schema, primary key, indexes, **shard key**, and whether it's SQL or NoSQL *with the reason*.

**Phase 5 — architecture.** Start simple, then scale in stages. Narrate the evolution:
> "Simplest version: client → app server → database. That works to maybe 1,000 QPS. At 100K QPS I need a load balancer with horizontal app servers — which requires them to be stateless, so sessions move to Redis. Reads dominate 50:1, so I add a cache in front of the DB. Media goes to object storage behind a CDN rather than through my servers. Anything not needed for the response — analytics, notifications — goes to a queue."

That narration is worth more than a perfect final diagram, because it shows you can reason about scale rather than having memorized an architecture.

**Phase 6 — deep dive.** They'll pick one component. Be ready to go deep on: the caching strategy and invalidation, the shard key and its consequences, unique ID generation, or the read path end to end.

**Phase 7 — failure and cost.** Volunteer this:
> "Single points of failure: the load balancer (fix with an active-passive pair), the primary DB (fix with automated failover to a replica). Hot keys from celebrity accounts need special handling. At 10× traffic the cache tier saturates first — I'd shard it with consistent hashing. Biggest cost driver is CDN egress; I'd tune cache TTLs and compress aggressively."

**The two fatal mistakes:** diagramming before establishing requirements, and never naming a trade-off. Every choice costs something. Say what.

---

## 14.4 Unique ID generation — needed everywhere

This comes up in half of all designs, so learn it once.

| Approach | Pro | Con |
|---|---|---|
| Auto-increment (single DB) | simple, ordered | doesn't scale, SPOF |
| UUID v4 | no coordination | 128-bit, random → terrible index locality |
| **Snowflake** | 64-bit, time-sortable, distributed | needs clock sync, machine-ID assignment |
| Database ticket server | simple | SPOF, though replicable |
| Redis INCR | fast, atomic | Redis becomes critical infrastructure |

**Snowflake layout** (Twitter's, the standard answer):
```
1 bit unused | 41 bits timestamp (ms) | 10 bits machine ID | 12 bits sequence
```
41 bits of milliseconds ≈ 69 years. 10 bits = 1,024 machines. 12 bits = 4,096 IDs per machine per millisecond → ~4M IDs/second overall. IDs are roughly time-sorted, which makes them index-friendly — that's the property UUIDs lack and why it matters.

For a URL shortener specifically: base62-encode a counter (7 characters gives 62⁷ ≈ 3.5 trillion), or hash the URL and take the first 7 characters with collision retry. Compare both and pick one with a reason.

---

## 14.5 The designs

Work these in order. For each, produce a written doc: requirements, estimates, API, data model, diagram, deep dive, bottlenecks.

### Tier 1 — do all five

**1. URL Shortener (TinyURL)** — the best starting design; small enough to finish, deep enough to be real.
- Key decisions: ID generation (counter + base62 vs hash), cache the hot mappings, 301 vs 302 redirect (**302 preserves analytics; 301 is cached by the browser and skips your server**)
- Read-heavy (100:1) → cache-aside with Redis
- Data model: `{short_code (PK), long_url, user_id, created_at, expires_at}`
- Deep dive: how do you handle custom aliases and collisions? What about analytics at scale (write to Kafka, aggregate offline)?

**2. Rate Limiter** — small surface, high concept density.
- Algorithms: token bucket, leaky bucket, fixed window, sliding window log, sliding window counter — know the trade-offs
- Distributed: Redis with an atomic Lua script (read-modify-write must be atomic across app servers)
- Where it lives: API gateway vs middleware vs sidecar
- Deep dive: what do you return (429 with `Retry-After`)? Per-user, per-IP, or per-endpoint? What happens when Redis is down — fail open or fail closed? (Usually fail open, so a limiter outage doesn't take down the product.)

**3. News Feed (Twitter/Instagram)** — the classic fan-out problem.
- **Fan-out on write (push)**: on posting, push the tweet ID into every follower's precomputed feed cache. Reads are O(1) and fast. Writes are expensive and it breaks for celebrities (100M followers = 100M writes).
- **Fan-out on read (pull)**: build the feed at read time by merging the timelines of everyone you follow. Cheap writes, expensive reads.
- **The real answer is hybrid**: push for normal users, pull for celebrities, merged at read time. Being able to state the celebrity problem *and* the hybrid fix is the whole point of this design.
- Deep dive: feed ranking, pagination with cursors, media handling, cache eviction for inactive users.

**4. Chat (WhatsApp/Slack)**
- **WebSockets** for real-time delivery (long-polling as the fallback); connection state lives in a session service mapping user → gateway server
- Message ordering (per-conversation sequence numbers, not wall-clock timestamps — clocks skew)
- Delivery receipts: sent → delivered → read
- Offline: queue undelivered messages, push notification, sync on reconnect
- Storage: wide-column (Cassandra) keyed by `(conversation_id, message_id)` — writes are heavy and queries are always by conversation
- Deep dive: group chat fan-out, end-to-end encryption key exchange, media attachments

**5. Video Streaming (YouTube/Netflix)**
- Upload → object storage → transcoding pipeline (queue + worker fleet) → multiple bitrates → CDN
- Adaptive bitrate streaming (HLS/DASH): video is chunked and the client picks quality per chunk based on measured bandwidth
- Metadata in SQL, video files in object storage, delivery through a CDN — never through your app servers
- Deep dive: the transcoding pipeline (chunk in parallel, DAG of jobs), CDN cache strategy, recommendations, view-count aggregation (write to a stream, aggregate in batches — never `UPDATE ... SET views = views + 1` at scale)

### Tier 2 — do four of these

| Design | Central problem |
|---|---|
| **Web Crawler** | politeness (robots.txt, per-domain rate limits), URL frontier with priority, dedup at scale (Bloom filter), trap detection |
| **Search Autocomplete** | trie with top-k cached per node, updated offline from query logs; latency budget under 100 ms |
| **Notification System** | multi-channel fan-out, retries with exponential backoff, deduplication, user preferences, delivery tracking |
| **Distributed Key-Value Store** | consistent hashing, quorum reads/writes, vector clocks, gossip protocol, hinted handoff — this is Dynamo |
| **Uber / ride matching** | geospatial indexing (geohash or QuadTree), driver location updates at massive write volume, matching algorithm, surge pricing |
| **Ticketmaster / booking** | seat locking with expiry, preventing double-booking under contention, queueing during high-demand drops |
| **Google Drive / Dropbox** | file chunking, dedup by content hash, delta sync, conflict resolution, metadata vs blob separation |
| **Payment System** | idempotency keys, the Saga pattern, double-entry ledger, reconciliation, exactly-once semantics in practice |
| **Ad click aggregation** | stream processing (Kafka + Flink), windowed aggregation, late-arriving events, exactly-once counting |
| **Distributed Job Scheduler** | leader election, at-least-once execution, dead-letter queues, cron semantics with failures |
| **Metrics/Monitoring system** | time-series storage, downsampling and retention tiers, cardinality explosion, push vs pull collection |

### Tier 3 — AI/LLM infrastructure (new, and your edge)

These have moved into general engineering loops, and they're where your `atlas-ra` work makes you unusually credible.

| Design | Central problem |
|---|---|
| **LLM inference serving** | GPU scheduling, continuous batching, KV-cache management, streaming responses, cost per token, autoscaling expensive hardware |
| **RAG pipeline** | ingestion and chunking, embedding generation at scale, vector DB choice and index type (HNSW vs IVF), hybrid retrieval, re-ranking, freshness |
| **AI agent platform** | tool execution sandboxing, per-run state, retries and timeouts, cost/token budgeting, observability of non-deterministic runs, eval harness |
| **Content moderation** | multi-stage filtering (cheap classifier → expensive model → human review), latency budget, appeal flow |
| **Recommendation system** | candidate generation → ranking → re-ranking, feature store, online vs offline serving, cold start |

Recurring themes: **cost is a first-class design constraint** (GPUs are expensive and you're graded on cost now), latency budgets are tight and models are slow so you cache and stream, outputs are non-deterministic so you need evals rather than only tests, and the fallback path when the model fails matters as much as the happy path.

---

## 14.6 Study plan

| Weeks | Work |
|---|---|
| 19–20 | §14.1–14.2 concepts. Read [system-design-primer](https://github.com/donnemartin/system-design-primer) top to bottom. Memorize the latency and capacity numbers. |
| 21 | Estimation drills: 5 different products, DAU → QPS → storage, 10 minutes each |
| 22 | URL Shortener + Rate Limiter, written out fully |
| 23 | News Feed (spend real time on the fan-out trade-off) |
| 24 | Chat |
| 25 | Video Streaming |
| 26 | Two Tier-2 designs |
| 27 | Two more Tier-2, plus one Tier-3 AI design |
| 28 | Two designs **cold**, timed at 45 minutes, spoken aloud and recorded |

**Resources:** [system-design-primer](https://github.com/donnemartin/system-design-primer) (free, start here) · Alex Xu's *System Design Interview* Vol 1 & 2 and [ByteByteGo](https://bytebytego.com/) (best paid) · [Gaurav Sen](https://www.youtube.com/@gkcs) and [Hussein Nasser](https://www.youtube.com/@hnasr) on YouTube · *Designing Data-Intensive Applications* by Kleppmann (the deepest book on this subject; read it slowly over months, not before an interview).

**Section check:**
- Estimate QPS and storage for a product with 50M DAU, unprompted, in 3 minutes.
- State CAP correctly, including the partition precondition.
- Explain fan-out on write vs read and the celebrity problem.
- Explain why consistent hashing beats `hash % n`.
- Name three cache failure modes and their fixes.
- Name the dominant cost driver in a design and one way to reduce it.

→ Next: **[15 — Databases](15-databases.md)**
