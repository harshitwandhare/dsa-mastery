# 16 — CS Fundamentals: OS, Networking, Concurrency, Python Internals

**Ongoing, ~1 hour/week.** Not asked in coding rounds, asked constantly in backend and full-stack loops, and in every "tell me how the internet works" screening question. This is also the material that makes system design make *sense* rather than being memorized.

---

## 16.1 Operating systems

### Process vs thread

| | Process | Thread |
|---|---|---|
| Memory | own address space | shares the process's memory |
| Creation cost | expensive | cheap |
| Communication | IPC (pipes, sockets, shared memory) | shared variables |
| Crash impact | isolated | takes down the whole process |
| Context switch | expensive (TLB flush) | cheaper |

A process is a program in execution with its own memory. A thread is an execution path inside a process. Threads sharing memory is what makes them fast and what makes them dangerous.

**Context switch** — the OS saves one thread's registers and program counter, loads another's. Costs ~1–10 μs, plus cache pollution. Too many threads means the CPU spends its time switching rather than working, which is why thread pools are sized rather than unbounded.

### Concurrency vs parallelism

- **Concurrency** — multiple tasks *in progress* at once, possibly interleaved on one core. It's about structure.
- **Parallelism** — multiple tasks *executing* at the same instant on multiple cores. It's about execution.

A single-core machine can be concurrent but not parallel. This distinction gets asked, and it explains why async I/O helps on one core.

### CPU-bound vs I/O-bound — the decision that matters

| Workload | Bottleneck | Right tool |
|---|---|---|
| **CPU-bound** — hashing, image processing, model inference | the processor | multiprocessing (or a native library that releases the GIL) |
| **I/O-bound** — network calls, database queries, disk reads | waiting | async/await, or threads |

Almost every web backend is I/O-bound: it spends its life waiting on the database and other services. That's why async frameworks (FastAPI, Node) scale well on modest hardware — while one request waits, thousands of others progress.

### Memory

**Virtual memory** — each process sees a private contiguous address space; the MMU maps virtual pages to physical frames. Enables isolation, and lets total allocated memory exceed physical RAM.

**Paging and page faults** — memory is divided into pages (usually 4 KB). Touching a page that isn't resident triggers a page fault; the OS loads it from disk. Excessive faulting is **thrashing**, and it's why a machine that starts swapping becomes catastrophically slow rather than gradually slower.

**Stack vs heap**
- **Stack** — function frames, local variables. LIFO, automatically managed, fast, limited (typically 1–8 MB). Deep recursion → stack overflow. Python's default recursion limit of 1,000 exists to turn a segfault into an exception.
- **Heap** — dynamically allocated objects. Larger, slower, manually managed (C) or garbage-collected (Python, Java). Fragmentation is a real concern.

**Garbage collection** — reference counting (Python's primary mechanism: an object dies when its count hits zero) plus a cycle collector (for `a.ref = b; b.ref = a`). Tracing GCs (Java) use mark-and-sweep with generational heuristics: most objects die young, so collect the young generation frequently and the old one rarely.

### Scheduling, deadlock, IPC

**Scheduling** — the OS decides which thread runs. FCFS, round robin, priority-based, multilevel feedback queues (what real systems use). **Starvation** is when a low-priority thread never runs; aging (gradually raising priority) fixes it.

**Deadlock** requires all four Coffman conditions simultaneously:
1. **Mutual exclusion** — a resource can't be shared
2. **Hold and wait** — a thread holds one resource while waiting for another
3. **No preemption** — resources can't be forcibly taken
4. **Circular wait** — a cycle in the wait-for graph

Break any one and deadlock is impossible. **In practice you break circular wait by always acquiring locks in a globally consistent order.** That's the answer to give.

**IPC mechanisms:** pipes, named pipes, message queues, shared memory (fastest, needs synchronization), sockets (works across machines), signals.

**System calls** — the boundary between user space and kernel space. `read`, `write`, `open`, `socket`, `fork`. Each crossing costs ~100 ns–1 μs, which is why buffered I/O (fewer, bigger syscalls) beats unbuffered.

---

## 16.2 Networking

### The layers

| Layer | Protocols | What it does |
|---|---|---|
| Application | HTTP, DNS, SMTP, WebSocket | what your code speaks |
| Transport | TCP, UDP | delivery between processes (ports) |
| Network | IP, ICMP | routing between machines (addresses) |
| Link | Ethernet, WiFi | the physical hop |

### TCP vs UDP

| | TCP | UDP |
|---|---|---|
| Connection | handshake required | fire and forget |
| Reliability | guaranteed, retransmits | none |
| Ordering | guaranteed | none |
| Speed | slower | faster |
| Congestion control | yes | no |
| Use | HTTP, databases, file transfer | video/voice, gaming, DNS |

**TCP three-way handshake:** SYN → SYN-ACK → ACK. That's one full round trip *before any data*, which is why connection reuse (HTTP keep-alive, connection pooling) matters so much. TLS adds another 1–2 round trips on top (TLS 1.3 reduced it to one).

**Head-of-line blocking** — in TCP, one lost packet stalls everything behind it. This is why HTTP/3 moved to QUIC over UDP.

### HTTP

```
GET /api/users/42 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
Accept: application/json
```

**Methods and their properties:**

| Method | Safe | Idempotent | Meaning |
|---|---|---|---|
| GET | yes | yes | retrieve |
| POST | no | **no** | create / arbitrary action |
| PUT | no | yes | replace entirely |
| PATCH | no | no (usually) | partial update |
| DELETE | no | yes | remove |

*Idempotent* means calling it N times has the same effect as calling it once. **POST is the non-idempotent one, which is exactly why payment endpoints need idempotency keys.**

**Status codes worth knowing precisely:** 200 OK · 201 Created · 204 No Content · 301 permanent redirect (browser caches it) · 302 temporary (doesn't cache — this is why URL shorteners use 302 when they want analytics) · 304 Not Modified · 400 Bad Request · 401 unauthenticated · 403 authenticated but not permitted · 404 Not Found · 409 Conflict · 422 Unprocessable · 429 Too Many Requests · 500 Internal Error · 502 Bad Gateway · 503 Unavailable · 504 Gateway Timeout.

**401 vs 403 is asked constantly:** 401 means "I don't know who you are"; 403 means "I know who you are and you can't do this."

**HTTP versions:** 1.1 added keep-alive and pipelining; 2 added multiplexing over one connection, header compression, and server push; 3 runs over QUIC/UDP and eliminates TCP head-of-line blocking.

### DNS — "what happens when you type a URL"

This is the classic screening question. The full chain:

1. **Browser cache** → OS cache → hosts file → router cache → ISP resolver
2. Resolver queries the **root** nameserver → **TLD** nameserver (`.com`) → **authoritative** nameserver for the domain
3. Returns an A record (IPv4) or AAAA (IPv6), cached for the TTL
4. **TCP handshake** with that IP (SYN, SYN-ACK, ACK)
5. **TLS handshake** — certificate validation, key exchange
6. **HTTP request** sent
7. Request hits a **CDN edge** or **load balancer** → application server
8. App queries cache, then database; renders a response
9. Browser parses HTML, requests subresources, builds the DOM, renders

Being able to walk this end to end, naming caches and round trips, is a strong general-competence signal.

**Record types:** A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), TXT (verification), NS (nameserver).

### Web security

- **HTTPS/TLS** — encryption in transit, plus server identity via certificates. Certificate chain: leaf → intermediate → root CA.
- **CORS** — browsers block cross-origin requests unless the server opts in via `Access-Control-Allow-Origin`. Preflight `OPTIONS` requests happen for non-simple requests. This is a *browser* protection, not a server one — a common misunderstanding.
- **XSS** — attacker-injected script runs in your page. Fix: escape output, use a Content Security Policy, never `innerHTML` with untrusted data.
- **CSRF** — a malicious site makes an authenticated request using the victim's cookies. Fix: CSRF tokens, `SameSite=Lax/Strict` cookies.
- **SQL injection** — parameterized queries, always.
- **JWT vs sessions** — JWTs are stateless and self-contained (scales horizontally, but **can't be revoked before expiry** — that's the trade-off, and it's the thing to say). Sessions are server-side, revocable, and require shared storage. Common design: short-lived access token + revocable refresh token.
- **OAuth2 / OIDC** — delegated authorization. Authorization-code flow with PKCE is the current standard for web and mobile.

### API design

- **REST** — resources and HTTP verbs. Simple, cacheable, universal. Over-fetching and under-fetching are its weaknesses.
- **GraphQL** — client specifies exactly what it needs. Fixes over-fetching; costs caching simplicity and opens up query-complexity attacks.
- **gRPC** — protobuf over HTTP/2. Fast, strongly typed, excellent for service-to-service. Poor browser support without a proxy.
- **WebSocket** — full-duplex persistent connection. For real-time: chat, live updates, collaborative editing.
- **Server-Sent Events** — one-way server→client streaming over plain HTTP. Simpler than WebSockets when you only need push. This is how LLM token streaming usually works.

**Versioning:** URL path (`/v1/`) is the pragmatic default. **Pagination:** cursor-based, not offset. **Errors:** consistent shape with a machine-readable code, plus a request ID for correlation.

---

## 16.3 Concurrency — the code

### Python's GIL, stated precisely

The **Global Interpreter Lock** allows only one thread to execute Python bytecode at a time in CPython. Therefore:

- **Threads do not speed up CPU-bound Python.** Four threads doing math run no faster than one.
- **Threads DO help I/O-bound Python**, because the GIL is released during I/O waits (network, disk) and by C extensions like NumPy.
- **For CPU parallelism, use `multiprocessing`** — separate processes, separate GILs — or push the work into a C extension.

*(Note: Python 3.13+ ships an experimental free-threaded build without the GIL. Mention it as a direction, but the answer above is still the operative one for essentially all production code.)*

### Primitives

```python
import threading

# LOCK (mutex) — one holder at a time
lock = threading.Lock()
with lock:
    shared_counter += 1        # the critical section

# RLOCK — re-entrant: the same thread can acquire it more than once
rlock = threading.RLock()

# SEMAPHORE — up to N holders; a bounded resource pool
sem = threading.Semaphore(5)   # at most 5 concurrent DB connections
with sem:
    query_db()

# EVENT — one-shot broadcast signal
event = threading.Event()
event.wait()                   # blocks until set
event.set()                    # wakes all waiters

# CONDITION — wait for a predicate to become true
cond = threading.Condition()
with cond:
    while not ready:
        cond.wait()            # ALWAYS wait in a while loop — spurious wakeups
    consume()
with cond:
    ready = True
    cond.notify_all()

# BARRIER — N threads wait for each other
barrier = threading.Barrier(3)
barrier.wait()

# QUEUE — thread-safe, the preferred way to pass work between threads
from queue import Queue
q = Queue()
q.put(item); item = q.get(); q.task_done()
```

**`while` around `cond.wait()`, not `if`** — spurious wakeups are real, and the predicate can become false again between the notify and the wake. This is a detail interviewers use to separate people who've written concurrent code from people who've read about it.

### The race condition, concretely

```python
counter = 0
def increment():
    global counter
    for _ in range(100_000):
        counter += 1        # NOT atomic: read, add, write — three steps
```

Run this in two threads and the result is less than 200,000, because both can read the same value before either writes. The fix is a lock around the read-modify-write.

Any **check-then-act** or **read-modify-write** on shared state is a race. That's the pattern to look for, in interviews and in your own code.

### Thread pools

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=10) as pool:      # I/O-bound
    futures = {pool.submit(fetch, url): url for url in urls}
    for f in as_completed(futures):
        try:
            result = f.result()
        except Exception as e:
            print(f"{futures[f]} failed: {e}")        # exceptions surface at .result()

with ProcessPoolExecutor(max_workers=4) as pool:      # CPU-bound
    results = list(pool.map(heavy_computation, items))
```

Exceptions inside a worker don't propagate until you call `.result()`. Silently dropped futures are a classic bug.

### async/await

Single-threaded cooperative concurrency. One thread, an event loop, and tasks that voluntarily yield at `await` points.

```python
import asyncio, aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, u) for u in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

asyncio.run(main(urls))
```

Useful primitives: `asyncio.gather` (run concurrently, collect all), `asyncio.wait_for` (timeout), `asyncio.Semaphore` (limit concurrency), `asyncio.Queue`, `asyncio.create_task` (fire and track).

**The rule that breaks async systems:** never call blocking code inside an async function. One synchronous `requests.get()` or `time.sleep()` blocks the entire event loop and every other task with it. Use `await asyncio.sleep()`, async libraries, or `loop.run_in_executor()` for unavoidable blocking calls.

**Threads vs async:** threads are preemptive (the OS switches whenever it likes, so you need locks around shared state) while async is cooperative (switches only at `await`, so between awaits you're effectively atomic — far fewer race conditions). Async scales to far more concurrent connections because tasks are much cheaper than threads.

### The classic concurrency problems

```python
# Producer-consumer with a bounded queue (backpressure comes free)
from queue import Queue
import threading

q = Queue(maxsize=100)          # bounded → producers block when full

def producer():
    for item in source():
        q.put(item)             # blocks if full
    q.put(None)                 # sentinel to stop the consumer

def consumer():
    while True:
        item = q.get()
        if item is None: break
        process(item)
        q.task_done()
```

```python
# Dining philosophers — deadlock-free via a global lock ORDER
def philosopher(i, forks):
    first, second = sorted([i, (i + 1) % len(forks)])   # always low index first
    with forks[first]:
        with forks[second]:
            eat()
```

Sorting the lock indices breaks the circular-wait condition. That one line is the entire solution, and being able to name *which* Coffman condition it breaks is the good answer.

Also know: readers-writers (many readers or one writer), the barrier pattern, and rate limiting with a semaphore.

---

## 16.4 Python internals

Asked in backend interviews, and useful for writing code that doesn't surprise you.

### Data model and mutability

```python
# Mutable: list, dict, set, bytearray, most custom classes
# Immutable: int, float, str, tuple, frozenset, bytes

# THE classic bug — default arguments are evaluated ONCE at definition time
def bad(item, items=[]):        # the SAME list across every call
    items.append(item)
    return items
bad(1); bad(2)                  # → [1, 2]  ← not what anyone wants

def good(item, items=None):
    if items is None: items = []
    items.append(item)
    return items

# is vs ==
a = [1,2]; b = [1,2]
a == b      # True  — same value
a is b      # False — different objects
# small ints (-5..256) and interned strings are cached, so `is` may
# accidentally work for them. Never rely on it. Use `is` only for None.

# Shallow vs deep copy
import copy
shallow = original[:]                  # nested objects are still shared
deep    = copy.deepcopy(original)      # fully independent
```

### Memory and GC

CPython uses **reference counting** — an object is freed the instant its count hits zero — plus a **generational cycle collector** for reference cycles (`a.x = b; b.x = a`). Reference counting means deterministic cleanup (a file closes as soon as the last reference dies), which differs from Java.

`__slots__` removes an instance's `__dict__`, cutting memory substantially for classes with many instances:
```python
class Point:
    __slots__ = ('x', 'y')      # no per-instance dict; less memory, faster attrs
```

### Generators and iterators

```python
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()          # one line in memory, not the whole file

# Generator expression: lazy, O(1) memory
total = sum(x * x for x in range(10**7))
# List comprehension: eager, O(n) memory
total = sum([x * x for x in range(10**7)])      # allocates 10M ints first
```

Generators are the answer to "how would you process a file too large for memory." They're also the mechanism behind `yield`-based coroutines and Python's iterator protocol (`__iter__`/`__next__`).

### Decorators, context managers, and the rest

```python
from functools import wraps
import time

def timed(fn):
    @wraps(fn)                          # preserves __name__ and __doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter() - start:.3f}s")
    return wrapper

from contextlib import contextmanager
@contextmanager
def transaction(conn):
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
```

A decorator is a function returning a function — that's the whole concept. A context manager guarantees cleanup via `__enter__`/`__exit__`, which is why `with` is preferred over manual `try/finally`.

Also worth knowing: `*args`/`**kwargs`, closures and the late-binding gotcha in loops, `functools.cache`, dunder methods (`__eq__`, `__hash__`, `__lt__` — and that defining `__eq__` without `__hash__` makes a class unhashable), MRO and `super()` in multiple inheritance, and type hints with `mypy`.

### Testing

```python
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def db():
    conn = create_test_db()
    yield conn                          # setup / teardown around the yield
    conn.close()

@pytest.mark.parametrize("value,expected", [(1, 2), (2, 4), (3, 6)])
def test_double(value, expected):
    assert double(value) == expected

def test_calls_api():
    with patch("mymodule.requests.get") as mock_get:
        mock_get.return_value.json.return_value = {"ok": True}
        assert fetch_status() is True
```

Concepts to be able to discuss: the test pyramid (many unit, fewer integration, few end-to-end), mocking external dependencies vs testing against a real database in CI, fixtures for setup/teardown, coverage as a signal rather than a target, and TDD as an option rather than a religion.

---

## 16.5 Git — asked more than you'd expect

```bash
git rebase -i HEAD~3          # squash/reorder commits before a PR
git cherry-pick <sha>         # take one commit onto another branch
git revert <sha>              # undo a commit with a NEW commit (safe on shared branches)
git reset --soft HEAD~1       # undo the commit, keep changes staged
git reset --hard HEAD~1       # undo the commit AND discard changes (destructive)
git bisect start              # binary search history for the commit that broke it
git stash / git stash pop
git log --oneline --graph --all
```

**Merge vs rebase:** merge preserves true history and creates a merge commit; rebase produces a linear history by rewriting commits. **Never rebase a branch other people have pulled** — rewriting shared history forces everyone else into a painful recovery. That sentence is the answer they're looking for.

`git bisect` is worth knowing by name: it binary-searches your commit history to find which commit introduced a bug, in O(log n) builds. It's a genuinely great answer to "how would you find a regression."

---

## 16.6 Study plan and checks

One hour a week, alongside everything else.

| Week | Topic |
|---|---|
| 1 | Process vs thread, concurrency vs parallelism, CPU vs I/O bound |
| 2 | HTTP, status codes, "what happens when you type a URL" — practice saying it aloud |
| 3 | The GIL, threading primitives, race conditions. Solve LeetCode's 5 concurrency problems. |
| 4 | async/await, producer-consumer, deadlock and the Coffman conditions |
| 5 | Python internals: mutability, generators, decorators, context managers |
| 6 | Security: XSS, CSRF, SQL injection, JWT vs sessions, CORS |
| 7 | Git workflows, testing strategy |
| 8 | Review — answer every check below out loud |

**Section check:**
- Explain the GIL and when threads help in Python.
- Explain when to use multiprocessing vs threading vs async, with a workload for each.
- Walk through everything that happens when you type a URL and press enter.
- Explain 401 vs 403, and 301 vs 302.
- Name the four Coffman conditions and which one lock ordering breaks.
- Explain why `cond.wait()` goes inside a `while`, not an `if`.
- Explain why JWTs can't be revoked and what you do about it.
- Explain the mutable-default-argument bug.
- Explain merge vs rebase and when rebasing is dangerous.

→ Back to **[README](README.md)** · Log progress in **[tracker.md](tracker.md)**
