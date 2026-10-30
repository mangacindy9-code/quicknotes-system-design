# QuickNotes System Architecture & Scaling Plan

This document outlines the functional and non-functional requirements, traffic load estimations, architecture topology, request flows, and fault-tolerance mechanisms for QuickNotes serving 1 million daily active users.

---

## 1. Functional & Non-Functional Requirements

### Functional Requirements
* Users can create, read, update, and soft-delete notes.
* Users can categorize notes using tags.
* Users can search and filter their list of notes.

### Non-Functional Requirements
* **High Availability:** $99.9\%$ uptime.
* **Low Latency:** Read latency $< 50\text{ ms}$; Write latency $< 150\text{ ms}$.
* **Scalability:** Scale horizontally to support 1,000,000 users.
* **Data Integrity & Security:** Data persistence with encrypted transmission (TLS/HTTPS).

---

## 2. Load Estimates (1 Million Daily Active Users)

### Assumptions
* **Active Users:** $1,000,000$ Daily Active Users (DAU).
* **Read Activity:** Each active user reads their note list 20 times per day.
* **Write Activity:** Each active user creates or updates 2 notes per day.
* **Note Size:** Average note text size = 1 KB.
* **Time Scale Estimate:** $1\text{ day} \approx 100,000\text{ seconds}$.

### Traffic Calculations
* **Total Reads per Day:** $1,000,000 \times 20 = 20,000,000\text{ reads/day}$
* **Average Reads per Second:** 
  $$\frac{20,000,000}{100,000} = 200\text{ reads/sec}$$
* **Peak Reads per Second ($5\times$ multiplier):** $1,000\text{ reads/sec}$

* **Total Writes per Day:** $1,000,000 \times 2 = 2,000,000\text{ writes/day}$
* **Average Writes per Second:** 
  $$\frac{2,000,000}{100,000} = 20\text{ writes/sec}$$
* **Peak Writes per Second ($5\times$ multiplier):** $100\text{ writes/sec}$

### Storage Calculations per Year
* **Daily Storage:** $2,000,000\text{ notes/day} \times 1\text{ KB} = 2,000,000\text{ KB/day} = 2\text{ GB/day}$
* **Yearly Storage (365 days):** 
  $$2\text{ GB/day} \times 365 = \mathbf{730\text{ GB/year}}$$

---

## 3. Architecture Diagram

```text
[Client App / Browser]
        │
        ▼
   [DNS Routing]
        │
        ▼
  [CDN / Edge API Cache]
        │
        ▼
   [Load Balancer]
        │
        ├──► [App Server 1] ──┐
        ├──► [App Server 2] ──┼──► [Redis Cache] (Cached Note Lists & Sessions)
        └──► [App Server N] ──┤
                              ├──► [Primary DB] (Writes)
                              │         │
                              │         └──(Replication)──► [Read Replica DB] (Reads)
                              │
                              └──► [Message Queue] ──► [Background Worker] (Audit Logging & Search Indexing)
