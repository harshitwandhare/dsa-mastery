# 13 — Low-Level Design, In Depth

**Weeks 12–18, weekends.** LLD (also called machine coding or OOD) gives you 35–60 minutes to design *and code* the classes for a system. Unlike HLD, it's asked at intern and new-grad level, and it's the round where "I build real software" translates directly into a score.

This file is meant to be worked, not read. Every design at the end should end up as running Python in a repo.

---

## 13.1 Object-oriented foundations

### The four pillars, with the reason each exists

**Encapsulation** — bundle data with the methods that operate on it, and hide internal state. The point is that you can change the internals without breaking callers.

```python
class BankAccount:
    def __init__(self, balance: float = 0):
        self.__balance = balance          # name-mangled → _BankAccount__balance

    @property
    def balance(self) -> float:           # read-only public view
        return self.__balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self.__balance += amount          # the INVARIANT is enforced here
```

The invariant ("balance is never modified without validation") is only enforceable because nobody can touch `__balance` directly. Python enforces this by convention plus name mangling rather than hard privacy — say that if asked; it's a real language difference from Java.

**Abstraction** — expose *what* something does, hide *how*. An interface says `send(message)`; the caller doesn't know if it's SMTP or a queue.

**Inheritance** — reuse behavior via an is-a relationship. Use it sparingly. **Prefer composition over inheritance** — this is the single most important OOD guideline, because inheritance couples the subclass to the parent's implementation forever, while composition lets you swap parts.

```python
# Fragile: a deep inheritance tree
class FlyingSwimmingBird(SwimmingBird, FlyingBird): ...   # diamond problems

# Better: compose behaviors
class Bird:
    def __init__(self, fly_behavior, swim_behavior):
        self.fly = fly_behavior
        self.swim = swim_behavior
```

**Polymorphism** — one interface, many implementations. `for shape in shapes: shape.area()` works regardless of concrete type. This is what makes the Open/Closed principle possible.

### Relationships — get the vocabulary right

| Relationship | Meaning | Lifetime | Example |
|---|---|---|---|
| **Association** | "uses a" | independent | `Driver` uses `Road` |
| **Aggregation** | "has a", weak | parts survive the whole | `Team` has `Player`s — players outlive the team |
| **Composition** | "has a", strong | parts die with the whole | `House` has `Room`s — rooms don't exist without it |
| **Inheritance** | "is a" | — | `Car` is a `Vehicle` |

Interviewers ask "is this composition or aggregation?" The test is lifetime ownership. Getting it right takes ten seconds and reads as trained.

### Python-specific OOD tools

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Protocol, Optional
from datetime import datetime

class VehicleType(Enum):
    MOTORCYCLE = auto()
    CAR = auto()
    TRUCK = auto()

@dataclass
class Vehicle:
    license_plate: str
    vehicle_type: VehicleType
    entry_time: Optional[datetime] = None

class PaymentGateway(ABC):                  # abstract base class
    @abstractmethod
    def charge(self, amount: float) -> bool: ...

class Notifier(Protocol):                    # structural typing — no inheritance
    def notify(self, message: str) -> None: ...
```

`@dataclass` removes constructor boilerplate. `Enum` replaces magic strings. `ABC` declares an interface. `Protocol` gives duck-typed interfaces without an inheritance relationship. Using these fluently makes your LLD code look professional in a way plain classes don't.

---

## 13.2 SOLID, with violations and fixes

### S — Single Responsibility

*A class should have one reason to change.*

```python
# VIOLATION: three reasons to change — schema, mail provider, persistence
class User:
    def __init__(self, name, email): ...
    def save_to_db(self): ...
    def send_welcome_email(self): ...

# FIX: separate the axes of change
@dataclass
class User:
    name: str
    email: str

class UserRepository:
    def save(self, user: User) -> None: ...

class EmailService:
    def send_welcome(self, user: User) -> None: ...
```

### O — Open/Closed

*Open for extension, closed for modification.*

```python
# VIOLATION: adding a shape means editing this function forever
def area(shape):
    if shape.type == "circle":   return 3.14 * shape.r ** 2
    elif shape.type == "square": return shape.side ** 2
    # ... and it grows without bound

# FIX: polymorphism — new shapes add code, they don't edit code
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return 3.14159 * self.r ** 2
```

**The smell to watch for: a growing `if/elif` chain branching on a type.** That's almost always a missing polymorphic hierarchy or a Strategy.

### L — Liskov Substitution

*Subtypes must be usable wherever the parent is, without surprising the caller.*

```python
# VIOLATION — the classic
class Rectangle:
    def set_width(self, w): self.w = w
    def set_height(self, h): self.h = h
    def area(self): return self.w * self.h

class Square(Rectangle):
    def set_width(self, w):  self.w = self.h = w    # silently changes height
    def set_height(self, h): self.w = self.h = h

def resize(rect: Rectangle):
    rect.set_width(5); rect.set_height(4)
    assert rect.area() == 20        # FAILS for Square — 16
```

A square *is* a rectangle in geometry but not in this mutable interface. The lesson: inheritance is about **behavioral contracts**, not real-world taxonomy. Other violations: a subclass that throws where the parent doesn't, or that tightens preconditions.

### I — Interface Segregation

*Don't force a class to implement methods it doesn't need.*

```python
# VIOLATION
class Worker(ABC):
    @abstractmethod
    def work(self): ...
    @abstractmethod
    def eat(self): ...           # a Robot has no business implementing this

# FIX: split
class Workable(Protocol):
    def work(self) -> None: ...
class Eatable(Protocol):
    def eat(self) -> None: ...
```

### D — Dependency Inversion

*Depend on abstractions, not concretions.* The most practically important one.

```python
# VIOLATION: OrderService is welded to Stripe and is untestable
class OrderService:
    def __init__(self):
        self.gateway = StripeClient(api_key="...")   # constructs its own dependency

# FIX: inject the abstraction
class OrderService:
    def __init__(self, gateway: PaymentGateway):     # depends on the interface
        self.gateway = gateway

# In tests:
service = OrderService(FakeGateway())
```

**This is what makes code testable**, which is the argument to make out loud. If you demonstrate exactly one SOLID principle in an LLD round, make it this one.

---

## 13.3 Design patterns, with runnable code

Learn Strategy, Factory, Observer, and State properly. Recognize the rest.

### Strategy — swappable algorithms

Use when: several interchangeable ways of doing one thing, chosen at runtime.

```python
class PricingStrategy(ABC):
    @abstractmethod
    def price(self, hours: int) -> float: ...

class HourlyPricing(PricingStrategy):
    def __init__(self, rate): self.rate = rate
    def price(self, hours): return hours * self.rate

class FlatDayPricing(PricingStrategy):
    def price(self, hours): return 20.0

class ProgressivePricing(PricingStrategy):
    """First 2 hours cheap, then more expensive."""
    def price(self, hours):
        return min(hours, 2) * 2.0 + max(0, hours - 2) * 5.0

class Ticket:
    def __init__(self, strategy: PricingStrategy):
        self.strategy = strategy
    def total(self, hours): return self.strategy.price(hours)
```

New pricing scheme = new class. Nothing existing changes. That's Open/Closed and Dependency Inversion demonstrated together.

### Factory — centralize object creation

```python
class VehicleFactory:
    _registry = {}

    @classmethod
    def register(cls, vtype: VehicleType, klass):
        cls._registry[vtype] = klass

    @classmethod
    def create(cls, vtype: VehicleType, plate: str):
        if vtype not in cls._registry:
            raise ValueError(f"unknown vehicle type: {vtype}")
        return cls._registry[vtype](plate)

VehicleFactory.register(VehicleType.CAR, Car)
VehicleFactory.register(VehicleType.TRUCK, Truck)
```

The registry variant is nicer than a hardcoded `if/elif` inside the factory — it keeps even the factory closed for modification.

### Observer — publish/subscribe

Use when: one object's state change must notify many others, without hard-coding who.

```python
class Observer(Protocol):
    def update(self, event: str, data: dict) -> None: ...

class Subject:
    def __init__(self):
        self._observers: list[Observer] = []

    def subscribe(self, o: Observer):   self._observers.append(o)
    def unsubscribe(self, o: Observer): self._observers.remove(o)

    def notify(self, event: str, data: dict):
        for o in list(self._observers):     # copy — observers may unsubscribe
            o.update(event, data)

class ParkingLot(Subject):
    def park(self, vehicle):
        ...
        if self.is_full():
            self.notify("LOT_FULL", {"lot_id": self.id})

class DisplayBoard:
    def update(self, event, data):
        if event == "LOT_FULL":
            print("FULL")
```

Iterating over a copy is the detail interviewers notice — mutating a list while iterating it is a real bug.

### State — behavior changes with internal state

Use when: an object's behavior depends on its mode, and you'd otherwise write a large `if state == ...` block in every method.

```python
class ElevatorState(ABC):
    @abstractmethod
    def handle_request(self, elevator, floor: int) -> None: ...

class IdleState(ElevatorState):
    def handle_request(self, elevator, floor):
        if floor > elevator.current_floor:
            elevator.set_state(MovingUpState())
        elif floor < elevator.current_floor:
            elevator.set_state(MovingDownState())
        elevator.target_floors.add(floor)

class MovingUpState(ElevatorState):
    def handle_request(self, elevator, floor):
        elevator.target_floors.add(floor)      # queue it; keep moving

class Elevator:
    def __init__(self):
        self.state: ElevatorState = IdleState()
        self.current_floor = 0
        self.target_floors: set[int] = set()
    def set_state(self, s): self.state = s
    def request(self, floor): self.state.handle_request(self, floor)
```

Also models: order lifecycle (placed → paid → shipped → delivered), vending machine, TCP connection, document approval.

### Singleton — exactly one instance

```python
class ConfigManager:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:                     # double-checked locking
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
```

**Mention the downside unprompted:** singletons are global mutable state, they make testing hard, and they hide dependencies. In Python, a module-level object is usually the better answer. Interviewers like candidates who know when *not* to use a pattern.

### Decorator — add behavior without subclassing

```python
class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float: ...
    @abstractmethod
    def description(self) -> str: ...

class Espresso(Coffee):
    def cost(self): return 2.0
    def description(self): return "Espresso"

class CondimentDecorator(Coffee):
    def __init__(self, coffee: Coffee): self.coffee = coffee

class Milk(CondimentDecorator):
    def cost(self): return self.coffee.cost() + 0.5
    def description(self): return self.coffee.description() + " + Milk"

drink = Milk(Milk(Espresso()))     # 3.0, "Espresso + Milk + Milk"
```

This is exactly how HTTP middleware works — each layer wraps the next.

### The rest, in one line each

| Pattern | Use when |
|---|---|
| **Builder** | many optional constructor params; step-by-step construction (query builders) |
| **Adapter** | an existing class has the wrong interface (wrapping a third-party SDK) |
| **Facade** | hide a complicated subsystem behind one simple entry point |
| **Command** | encapsulate a request as an object → undo/redo, queuing, logging |
| **Template Method** | fixed algorithm skeleton, subclasses fill in steps |
| **Composite** | tree structures where leaves and branches share an interface (file systems, UI) |
| **Proxy** | control access — lazy loading, caching, permission checks |
| **Chain of Responsibility** | pass a request along handlers until one takes it (middleware, approval flows) |
| **Iterator** | traverse a collection without exposing its internals (Python: `__iter__`) |
| **Flyweight** | share immutable data across many objects to save memory |

**Do not force patterns in.** Over-engineering is a real negative in LLD rounds. Use a pattern when it removes a concrete pain, and say what pain it removes.

---

## 13.4 The LLD interview method

**Timebox for a 45-minute round:**

| Phase | Time | Output |
|---|---|---|
| 1. Clarify requirements | 5 min | 5–7 written, agreed requirements |
| 2. Identify entities | 5 min | class list from the nouns |
| 3. Relationships & interfaces | 5 min | who owns whom, key method signatures |
| 4. Code the core | 20 min | working code for the main flow |
| 5. Edge cases & concurrency | 5 min | locks, invalid input, capacity |
| 6. Extensions | 5 min | what changes if we add X |

### Phase 1 — clarify, and bound the scope

The failure mode is scope creep. Write down what's in and what's out, and get agreement.

> "Let me scope this. In: park a vehicle, find an available spot by size, issue a ticket, calculate a fee on exit, handle a full lot. Out for now: reservations, multiple lots, and payment-gateway integration — I'll leave hooks for those. Does that work?"

Standard questions: How many of X? What types/sizes? Single instance or distributed? Do we need concurrency? Persistence, or in-memory? What are the pricing/business rules?

### Phase 2 — entities from nouns

Read your requirements and underline the nouns. Those become classes. Verbs become methods.

> "Parking lot, level, spot, vehicle, ticket, payment" → six classes. Spot types and vehicle types are enums, not classes, unless behavior differs per type.

### Phase 3 — relationships

State ownership explicitly: "A `ParkingLot` composes many `Level`s; a `Level` composes many `Spot`s; a `Spot` holds an optional `Vehicle` reference (association — vehicles exist independently)."

### Phase 4 — code, in this order

Enums → data classes → interfaces → the main class → the core flow. **Working over complete:** a fully implemented `park()`/`unpark()` beats twelve stubbed methods.

### Phase 5 — concurrency, the part most candidates skip

Bring this up yourself:

> "If two threads call `park()` at once they could both be assigned the same spot. I'd guard spot assignment with a lock, or use an atomic compare-and-set on the spot's status."

```python
import threading

class Level:
    def __init__(self, spots):
        self.spots = spots
        self._lock = threading.Lock()

    def assign_spot(self, vehicle) -> Optional[Spot]:
        with self._lock:                     # critical section: find + claim
            for spot in self.spots:
                if spot.is_free() and spot.fits(vehicle):
                    spot.occupy(vehicle)
                    return spot
        return None
```

Raising concurrency unprompted is one of the highest-signal moves available in an LLD round.

### Phase 6 — extensions

> "To support multiple lots, `ParkingLot` becomes an aggregate under a `ParkingLotManager` and spot lookup gets a lot ID. To persist, I'd put a `Repository` interface behind `ParkingLot` so the in-memory implementation can be swapped for a database one without touching the domain logic."

---

## 13.5 Worked design: Parking Lot

The canonical problem. Study this one fully; the rest follow the same method.

**Requirements:** multiple levels; spots sized motorcycle/compact/large; a vehicle takes the smallest spot that fits; issue a ticket on entry; charge by duration on exit; report availability; handle a full lot.

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
import threading
import itertools


# ---------- Enums ----------
class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    TRUCK = 3

class SpotSize(Enum):
    MOTORCYCLE = 1
    COMPACT = 2
    LARGE = 3


# ---------- Domain objects ----------
@dataclass(frozen=True)
class Vehicle:
    license_plate: str
    vehicle_type: VehicleType

    def required_size(self) -> SpotSize:
        return {
            VehicleType.MOTORCYCLE: SpotSize.MOTORCYCLE,
            VehicleType.CAR:        SpotSize.COMPACT,
            VehicleType.TRUCK:      SpotSize.LARGE,
        }[self.vehicle_type]


class Spot:
    def __init__(self, spot_id: str, size: SpotSize, level: int):
        self.spot_id = spot_id
        self.size = size
        self.level = level
        self.vehicle: Optional[Vehicle] = None

    def is_free(self) -> bool:
        return self.vehicle is None

    def fits(self, vehicle: Vehicle) -> bool:
        # a vehicle fits any spot at least as large as it needs
        return self.size.value >= vehicle.required_size().value

    def occupy(self, vehicle: Vehicle) -> None:
        if not self.is_free():
            raise ValueError(f"spot {self.spot_id} already occupied")
        self.vehicle = vehicle

    def release(self) -> None:
        self.vehicle = None


@dataclass
class Ticket:
    ticket_id: str
    vehicle: Vehicle
    spot: Spot
    entry_time: datetime
    exit_time: Optional[datetime] = None

    def duration_hours(self) -> float:
        end = self.exit_time or datetime.now()
        return max((end - self.entry_time).total_seconds() / 3600, 0.0)


# ---------- Strategy: pricing ----------
class PricingStrategy(ABC):
    @abstractmethod
    def calculate(self, ticket: Ticket) -> float: ...

class HourlyPricing(PricingStrategy):
    RATES = {VehicleType.MOTORCYCLE: 1.0,
             VehicleType.CAR: 2.0,
             VehicleType.TRUCK: 3.5}
    def calculate(self, ticket: Ticket) -> float:
        import math
        hours = math.ceil(ticket.duration_hours())      # round up partial hours
        return hours * self.RATES[ticket.vehicle.vehicle_type]

class FlatDayPricing(PricingStrategy):
    def calculate(self, ticket: Ticket) -> float:
        return 20.0


# ---------- Observer: displays ----------
class LotObserver(ABC):
    @abstractmethod
    def on_event(self, event: str, payload: dict) -> None: ...

class DisplayBoard(LotObserver):
    def on_event(self, event, payload):
        if event == "OCCUPANCY_CHANGED":
            print(f"Available: {payload['available']}/{payload['total']}")


# ---------- Level ----------
class Level:
    def __init__(self, level_number: int, spots: list[Spot]):
        self.level_number = level_number
        self.spots = spots
        self._lock = threading.Lock()

    def find_and_occupy(self, vehicle: Vehicle) -> Optional[Spot]:
        """Smallest fitting free spot. Locked: find-and-claim must be atomic."""
        with self._lock:
            candidates = [s for s in self.spots if s.is_free() and s.fits(vehicle)]
            if not candidates:
                return None
            spot = min(candidates, key=lambda s: s.size.value)
            spot.occupy(vehicle)
            return spot

    def available_count(self) -> int:
        return sum(1 for s in self.spots if s.is_free())


# ---------- Aggregate root ----------
class ParkingLot:
    def __init__(self, levels: list[Level], pricing: PricingStrategy):
        self.levels = levels
        self.pricing = pricing                     # injected — Dependency Inversion
        self.active_tickets: dict[str, Ticket] = {}
        self._observers: list[LotObserver] = []
        self._ticket_seq = itertools.count(1)
        self._lock = threading.Lock()

    # --- observer plumbing ---
    def subscribe(self, o: LotObserver): self._observers.append(o)
    def _notify(self, event: str, payload: dict):
        for o in list(self._observers):
            o.on_event(event, payload)

    # --- core flows ---
    def park(self, vehicle: Vehicle) -> Ticket:
        for level in self.levels:
            spot = level.find_and_occupy(vehicle)
            if spot:
                ticket = Ticket(
                    ticket_id=f"T{next(self._ticket_seq):06d}",
                    vehicle=vehicle,
                    spot=spot,
                    entry_time=datetime.now(),
                )
                with self._lock:
                    self.active_tickets[ticket.ticket_id] = ticket
                self._notify("OCCUPANCY_CHANGED", self.occupancy())
                return ticket
        raise RuntimeError("parking lot full")

    def unpark(self, ticket_id: str) -> float:
        with self._lock:
            ticket = self.active_tickets.pop(ticket_id, None)
        if ticket is None:
            raise ValueError(f"unknown or already-closed ticket: {ticket_id}")
        ticket.exit_time = datetime.now()
        ticket.spot.release()
        fee = self.pricing.calculate(ticket)
        self._notify("OCCUPANCY_CHANGED", self.occupancy())
        return fee

    def occupancy(self) -> dict:
        total = sum(len(l.spots) for l in self.levels)
        available = sum(l.available_count() for l in self.levels)
        return {"total": total, "available": available}
```

**Talking points to raise unprompted:**
- Pricing is a Strategy → new schemes add classes, never edit `ParkingLot`.
- `find_and_occupy` is locked because find-then-claim is a check-then-act race.
- `Ticket` holds a `Spot` reference so `unpark` is O(1) rather than scanning.
- To persist, introduce `TicketRepository` and `SpotRepository` interfaces; the domain doesn't change.
- To scale to multiple lots, add a `ParkingLotManager` and route by lot ID.

---

## 13.6 The design catalogue

Build each of these. Order is by value.

### Tier 1 — build all five

**1. Parking Lot** (above) — Strategy, Observer, Factory, concurrency.

**2. Elevator System** — the hardest of the five, and the best signal.
- Entities: `Elevator`, `ElevatorController`, `Request` (internal vs external), `Floor`, `Direction`
- State pattern: Idle / MovingUp / MovingDown / DoorsOpen / Maintenance
- The real problem is **scheduling**: which elevator serves a request? Start with nearest-idle, then discuss the SCAN/elevator algorithm (keep going in one direction, serving requests along the way, then reverse).
- Talking point: an external request specifies a *direction*; an elevator moving up should not pick up someone going down.

**3. LRU Cache** — hashmap + doubly linked list with sentinels. Code is in [file 03](03-stack-search-linkedlist.md). Follow-ups: make it thread-safe (a lock around get/put), add TTL (store expiry, lazily evict), and implement LFU.

**4. Rate Limiter** — high value because it's also an HLD topic.
```python
import time, threading

class TokenBucket:
    """Allows bursts up to `capacity`, refills at `rate` tokens/second."""
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.rate = refill_rate
        self.tokens = float(capacity)
        self.last = time.monotonic()          # monotonic — immune to clock changes
        self._lock = threading.Lock()

    def allow(self, cost: int = 1) -> bool:
        with self._lock:
            now = time.monotonic()
            self.tokens = min(self.capacity,
                              self.tokens + (now - self.last) * self.rate)
            self.last = now
            if self.tokens >= cost:
                self.tokens -= cost
                return True
            return False
```
Then implement **sliding window log** (a deque of timestamps — exact but O(n) memory per user) and **sliding window counter** (weighted blend of the current and previous fixed windows — approximate, O(1) memory). Compare: fixed window allows a 2× burst at the boundary; token bucket allows controlled bursts; sliding log is exact but expensive. That comparison *is* the interview.

**5. Splitwise / Expense Sharing**
- Entities: `User`, `Group`, `Expense`, `Split` (Equal / Exact / Percentage — a Strategy), `BalanceSheet`
- Core structure: `balances[creditor][debtor] = amount`
- The interesting part is **debt simplification**: net every user to a single balance, then greedily match the largest creditor with the largest debtor using two heaps. Minimizing the *number* of transactions is NP-hard in general — say that; the greedy heuristic is what's wanted.

### Tier 2 — build three of these

| Design | Core concepts |
|---|---|
| **Vending Machine** | State pattern (Idle → HasMoney → Dispensing), inventory, change-making (greedy or DP) |
| **Tic-Tac-Toe / Game board** | O(1) win check via row/col/diagonal counters; extend to N×N and Connect-4 |
| **Library Management** | Book vs BookItem (title vs physical copy), lending rules, reservations, fines |
| **BookMyShow / Ticket booking** | Seat locking with expiry (the hard part), concurrency, payment state machine |
| **ATM** | State pattern, cash dispensing, transaction atomicity, card/PIN auth |
| **Chess** | Piece hierarchy with polymorphic `valid_moves`, board state, move validation, check detection |
| **Snake & Ladder** | Simple simulation — good warm-up |
| **Logging framework** | Levels, Chain of Responsibility for handlers, appenders (console/file), formatters |
| **Notification system** | Strategy per channel (email/SMS/push), Observer for subscriptions, retry with backoff |
| **In-memory key-value store with TTL** | Hashmap + expiry heap or lazy eviction; concurrency |
| **Food delivery (Swiggy/DoorDash)** | Restaurant, Menu, Order state machine, delivery assignment |
| **Ride hailing (Uber)** | Driver matching (spatial index), trip state machine, surge pricing Strategy |

### Common follow-up questions

Prepare answers for these — they come up in nearly every LLD round:

1. **"How would you make this thread-safe?"** → identify the critical sections (check-then-act sequences), use a lock per shared mutable resource, keep lock scope minimal, and mention that lock ordering prevents deadlock.
2. **"How would you persist this?"** → Repository interface, domain stays ignorant of storage, swap the implementation.
3. **"How would you test this?"** → dependency injection makes the units testable; fake the gateway/clock/repo; test the invariants (never two vehicles in one spot).
4. **"What if we had 10 million users?"** → this becomes an HLD question: shard by key, cache hot reads, move writes to a queue.
5. **"Add feature X."** → the correct answer demonstrates Open/Closed: "X is a new Strategy implementation, no existing class changes."

---

## 13.7 Practice plan

| Week | Work |
|---|---|
| 12 | SOLID + write the violation/fix for each of the 5. Strategy and Factory. |
| 13 | Observer and State. Implement the Elevator state machine. |
| 14 | Parking Lot, complete and tested |
| 15 | LRU Cache (+ thread-safe, + TTL, + LFU) and Rate Limiter (3 algorithms) |
| 16 | Splitwise with debt simplification |
| 17 | Two Tier-2 designs, timed at 45 minutes each |
| 18 | One Tier-2 design **cold**, timed, spoken aloud, recorded |

**Put it all in a public repo** — `lld-practice`, one folder per design, a README per design explaining the entities, the patterns used, and the trade-offs, plus pytest tests. That repo is simultaneously interview prep, a portfolio artifact, and something to point at in a behavioral answer.

**Section check:**
- Explain composition vs aggregation using an example from your own code.
- Give the Rectangle/Square Liskov violation and why it's a violation.
- Explain Dependency Inversion in terms of testability.
- Name the critical section in a parking-lot `park()` and why it needs a lock.
- Compare token bucket, sliding window log, and sliding window counter.

→ Next: **[14 — High-Level Design, in depth](14-hld-deep.md)**
