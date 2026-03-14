/**
 * scripts/seedQuestions.js
 *
 * Seed script for the AI Adaptive Interview System.
 * Inserts 100 topics: 50 Backend Engineer + 50 ML Engineer
 * Difficulty is a numeric scale 1–10: 1–3 easy · 4–6 medium · 7–9 hard · 10 very hard
 *
 * Usage:
 *   MONGO_URI=mongodb://localhost:27017/interview node scripts/seedQuestions.js
 */
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Question = require("../models/Question");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/interview";

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
const mq = (text) => ({
  text,
  maxScore: 10,
  upperThreshold: 0.8,
  lowerThreshold: 0.4,
});

const fu = (text) => ({ text, maxScore: 5 });

// ---------------------------------------------------------------------------
// BACKEND ENGINEER  –  15 easy · 20 medium · 15 hard  =  50 topics
// ---------------------------------------------------------------------------
const backendQuestions = [
  // ─── EASY (15) ────────────────────────────────────────────────────────────
  {
    role: "Backend Engineer",
    topic: "HTTP Methods",
    difficulty: 1,
    mainQuestion: mq(
      "Explain the differences between the GET, POST, PUT, PATCH, and DELETE HTTP methods and when each should be used in a REST API."
    ),
    followups: [
      fu("What makes GET requests idempotent and why does that matter?"),
      fu("How does PUT differ from PATCH semantically?"),
      fu("Why should GET requests never modify server state?"),
      fu("What HTTP method would you use to check whether a resource exists without downloading it?"),
      fu("How do HTTP methods relate to CRUD operations?"),
    ],
    evaluationPoints: [
      "GET retrieves data, POST creates, PUT replaces, PATCH partially updates, DELETE removes",
      "GET and DELETE are idempotent; POST is not",
      "PUT replaces the entire resource; PATCH applies partial changes",
      "HEAD method checks resource existence without body",
      "Safe methods (GET, HEAD) must not alter server state",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "REST API Design Principles",
    difficulty: 2,
    mainQuestion: mq(
      "What are the core principles of RESTful API design, and why are they important?"
    ),
    followups: [
      fu("What does it mean for a REST API to be stateless?"),
      fu("How do you handle versioning in a REST API?"),
      fu("What is HATEOAS and do most production APIs implement it?"),
      fu("What HTTP status codes should a REST API return for common scenarios?"),
      fu("What is the difference between a resource and a representation in REST?"),
    ],
    evaluationPoints: [
      "Stateless client-server communication",
      "Uniform interface with resource-based URLs",
      "Cacheable responses improve scalability",
      "Layered system and code-on-demand constraints",
      "Proper use of HTTP verbs and status codes",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "HTTP Status Codes",
    difficulty: 1,
    mainQuestion: mq(
      "Describe the main HTTP status code categories and give examples of when each is used in a backend API."
    ),
    followups: [
      fu("What is the difference between 401 Unauthorized and 403 Forbidden?"),
      fu("When would you return a 422 Unprocessable Entity instead of 400 Bad Request?"),
      fu("What does a 201 Created response typically include in its headers?"),
      fu("When should you use 204 No Content versus 200 OK?"),
      fu("What is the purpose of 3xx redirect codes?"),
    ],
    evaluationPoints: [
      "2xx success, 3xx redirect, 4xx client error, 5xx server error",
      "401 means unauthenticated; 403 means authenticated but unauthorized",
      "201 should include a Location header pointing to the new resource",
      "204 is used when there is no response body",
      "422 is for validation failures where syntax is correct but semantics are wrong",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "JSON vs XML",
    difficulty: 2,
    mainQuestion: mq(
      "Compare JSON and XML as data interchange formats. When might you choose one over the other in a backend service?"
    ),
    followups: [
      fu("What are the payload size differences between JSON and XML?"),
      fu("How does XML support attributes while JSON does not?"),
      fu("What is XML Schema and does JSON have an equivalent?"),
      fu("Which format is more human-readable and why?"),
      fu("Why has JSON largely replaced XML in modern REST APIs?"),
    ],
    evaluationPoints: [
      "JSON is lighter and more human-readable",
      "XML supports attributes, namespaces, and XSLT transformations",
      "JSON has native support in JavaScript and most modern languages",
      "XML is still common in SOAP, configuration files, and enterprise systems",
      "JSON Schema provides validation similar to XML Schema",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Authentication vs Authorization",
    difficulty: 2,
    mainQuestion: mq(
      "Explain the difference between authentication and authorization. How are they typically implemented in a backend system?"
    ),
    followups: [
      fu("What is JWT and how does it encode identity information?"),
      fu("How do sessions differ from token-based authentication?"),
      fu("What is OAuth 2.0 and when would you use it?"),
      fu("How do role-based access control (RBAC) systems work?"),
      fu("What is the principle of least privilege and how does it apply to authorization?"),
    ],
    evaluationPoints: [
      "Authentication verifies who you are; authorization determines what you can do",
      "JWT encodes claims as a signed, base64-encoded JSON payload",
      "Sessions store state server-side; tokens are stateless",
      "OAuth 2.0 delegates authorization to a third party",
      "RBAC assigns permissions to roles rather than individual users",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "SQL vs NoSQL",
    difficulty: 3,
    mainQuestion: mq(
      "What are the key differences between SQL and NoSQL databases? How do you decide which type to use for a given use case?"
    ),
    followups: [
      fu("What is a schema-on-write versus schema-on-read approach?"),
      fu("How do NoSQL databases achieve horizontal scalability?"),
      fu("What types of NoSQL databases exist (document, key-value, column, graph)?"),
      fu("When is strong consistency more important than availability?"),
      fu("Can you use transactions in NoSQL databases like MongoDB?"),
    ],
    evaluationPoints: [
      "SQL enforces a fixed schema; NoSQL allows flexible or schemaless documents",
      "SQL databases excel at complex joins and ACID transactions",
      "NoSQL scales horizontally more easily",
      "Choosing depends on data model, query patterns, and consistency needs",
      "NoSQL types: document, key-value, wide-column, graph",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Environment Variables and Configuration",
    difficulty: 1,
    mainQuestion: mq(
      "Why should sensitive configuration values be stored in environment variables rather than in source code? Describe best practices for managing app configuration."
    ),
    followups: [
      fu("What is a .env file and how should it be handled in version control?"),
      fu("How do secrets managers like AWS Secrets Manager improve on .env files?"),
      fu("What is the Twelve-Factor App methodology's stance on configuration?"),
      fu("How do you inject environment variables in a Docker container?"),
      fu("What risks arise from logging environment variables accidentally?"),
    ],
    evaluationPoints: [
      "Secrets in source code risk exposure via version control",
      ".env files should be in .gitignore and never committed",
      "Secrets managers provide auditing, rotation, and access control",
      "Twelve-Factor App: store config in environment",
      "Docker uses -e flags or --env-file to inject env vars",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "CRUD Operations",
    difficulty: 2,
    mainQuestion: mq(
      "Walk me through implementing a basic CRUD REST API for a 'users' resource in Node.js with Express and a relational database."
    ),
    followups: [
      fu("How would you validate incoming request bodies before writing to the database?"),
      fu("What ORM or query builder would you use and why?"),
      fu("How do you handle a 'not found' case when fetching by ID?"),
      fu("How would you implement soft-delete instead of hard-delete?"),
      fu("What SQL queries underlie the update and delete operations?"),
    ],
    evaluationPoints: [
      "GET /users, POST /users, GET /users/:id, PUT/PATCH /users/:id, DELETE /users/:id",
      "Input validation with libraries like Joi or Zod",
      "Return 404 when a resource is not found",
      "Soft delete uses a deletedAt timestamp column instead of removing rows",
      "Parameterized queries prevent SQL injection",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Middleware in Express",
    difficulty: 3,
    mainQuestion: mq(
      "What is middleware in Express.js? Explain its execution order and common use cases."
    ),
    followups: [
      fu("How do you write error-handling middleware in Express?"),
      fu("What happens if you forget to call next() in middleware?"),
      fu("How does app.use() differ from router.use()?"),
      fu("What built-in middleware does Express provide?"),
      fu("How would you write middleware to log request duration?"),
    ],
    evaluationPoints: [
      "Middleware are functions with access to req, res, and next",
      "Execution is sequential in the order of definition",
      "Error middleware has four parameters: (err, req, res, next)",
      "Forgetting next() halts the request-response cycle",
      "Common uses: logging, auth, body parsing, CORS",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Pagination",
    difficulty: 2,
    mainQuestion: mq(
      "Describe offset-based and cursor-based pagination. What are the advantages and disadvantages of each?"
    ),
    followups: [
      fu("What problem does cursor-based pagination solve that offset pagination cannot?"),
      fu("How would you implement cursor pagination in SQL?"),
      fu("What metadata should a paginated API response include?"),
      fu("How does page size (limit) affect database performance?"),
      fu("How does infinite scroll relate to cursor-based pagination?"),
    ],
    evaluationPoints: [
      "Offset pagination uses LIMIT and OFFSET; cursor uses a reference point",
      "Offset pagination suffers from data drift when records are inserted or deleted",
      "Cursor pagination is stable and performs better at large offsets",
      "Responses should include next/prev cursors or total count",
      "Large offsets in SQL require scanning all preceding rows",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Error Handling",
    difficulty: 1,
    mainQuestion: mq(
      "How do you design a consistent error-handling strategy for a REST API? What should error responses include?"
    ),
    followups: [
      fu("How do you differentiate operational errors from programmer errors in Node.js?"),
      fu("Should stack traces be returned to API clients? Why or why not?"),
      fu("How do you log errors centrally in a Node.js application?"),
      fu("What is the purpose of a global unhandledRejection handler?"),
      fu("How would you design a standardized error response body?"),
    ],
    evaluationPoints: [
      "Consistent error schema: status code, error code, message, details",
      "Never expose stack traces to clients in production",
      "Operational errors are expected; programmer errors indicate bugs",
      "Centralized error middleware catches and formats all errors",
      "unhandledRejection catches unhandled Promise rejections",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "CORS",
    difficulty: 2,
    mainQuestion: mq(
      "What is CORS, why does it exist, and how do you configure it correctly in a Node.js backend?"
    ),
    followups: [
      fu("What is a preflight request and when is it triggered?"),
      fu("What headers does the server need to set to allow cross-origin requests?"),
      fu("Why is setting Access-Control-Allow-Origin: * dangerous for authenticated endpoints?"),
      fu("How does the same-origin policy differ from CORS?"),
      fu("How do credentials (cookies) interact with CORS?"),
    ],
    evaluationPoints: [
      "CORS enforces the same-origin policy in browsers",
      "Preflight (OPTIONS) request verifies permission before the actual request",
      "Access-Control-Allow-Origin, Allow-Methods, Allow-Headers must be set",
      "Wildcard origin breaks credentialed requests",
      "Access-Control-Allow-Credentials: true must accompany specific origins",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Database Indexing Basics",
    difficulty: 2,
    mainQuestion: mq(
      "What is a database index and how does it improve query performance? Explain with an example."
    ),
    followups: [
      fu("What data structure is most commonly used for database indexes?"),
      fu("How does indexing affect INSERT and UPDATE performance?"),
      fu("What is a composite index and when would you create one?"),
      fu("What is index cardinality and why does it matter?"),
      fu("How do you identify which columns to index?"),
    ],
    evaluationPoints: [
      "Indexes allow the database to find rows without a full table scan",
      "B-tree is the default structure for most SQL indexes",
      "Indexes speed up reads but slow down writes",
      "Composite indexes cover multiple columns in a specific order",
      "High-cardinality columns (unique values) benefit most from indexing",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Input Validation and Sanitization",
    difficulty: 1,
    mainQuestion: mq(
      "Why is input validation and sanitization critical in a backend service? Describe common attack vectors that improper handling enables."
    ),
    followups: [
      fu("What is SQL injection and how do parameterized queries prevent it?"),
      fu("What is XSS and how does it relate to backend output encoding?"),
      fu("What is the difference between allow-listing and deny-listing inputs?"),
      fu("How do validation libraries like Zod or Joi help?"),
      fu("Should validation happen on the client, server, or both?"),
    ],
    evaluationPoints: [
      "SQL injection injects malicious queries through unsanitized input",
      "Parameterized queries separate code from data",
      "XSS stores or reflects malicious scripts returned to browsers",
      "Allow-listing (whitelist) is safer than deny-listing",
      "Validation must always happen server-side regardless of client validation",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Logging Best Practices",
    difficulty: 3,
    mainQuestion: mq(
      "What makes a good logging strategy in a backend service? What should and should not be logged?"
    ),
    followups: [
      fu("What structured logging format do you prefer and why?"),
      fu("What log levels exist and when should each be used?"),
      fu("How should sensitive data like passwords or tokens be handled in logs?"),
      fu("What is log aggregation and what tools support it?"),
      fu("How do correlation/trace IDs improve distributed system debugging?"),
    ],
    evaluationPoints: [
      "Structured logs (JSON) are machine-readable and easier to search",
      "Log levels: TRACE, DEBUG, INFO, WARN, ERROR, FATAL",
      "Never log passwords, tokens, or PII",
      "Centralized log aggregation with ELK, Datadog, or similar",
      "Correlation IDs link logs across service boundaries",
    ],
  },

  // ─── MEDIUM (20) ──────────────────────────────────────────────────────────
  {
    role: "Backend Engineer",
    topic: "Database Transactions and ACID",
    difficulty: 5,
    mainQuestion: mq(
      "Explain ACID properties and how they are guaranteed in relational databases. Give a real-world example where violating any ACID property causes data corruption."
    ),
    followups: [
      fu("What is a dirty read and which isolation level prevents it?"),
      fu("How does a database implement atomicity using write-ahead logging?"),
      fu("What is a phantom read and what isolation level prevents it?"),
      fu("How does optimistic locking differ from pessimistic locking?"),
      fu("What trade-offs does the SERIALIZABLE isolation level introduce?"),
    ],
    evaluationPoints: [
      "Atomicity: all operations succeed or all roll back",
      "Consistency: transaction leaves DB in valid state",
      "Isolation: concurrent transactions don't interfere",
      "Durability: committed data survives crashes",
      "Write-ahead logging (WAL) enables crash recovery",
      "Higher isolation levels reduce concurrency",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Caching Strategies",
    difficulty: 5,
    mainQuestion: mq(
      "Describe the main caching strategies (cache-aside, write-through, write-behind, read-through) and when each is appropriate in a backend system."
    ),
    followups: [
      fu("What is cache invalidation and why is it considered hard?"),
      fu("What is a cache stampede and how do you prevent it?"),
      fu("How do TTL and LRU eviction policies differ?"),
      fu("What data is a bad candidate for caching?"),
      fu("How would you cache database query results with Redis in Node.js?"),
    ],
    evaluationPoints: [
      "Cache-aside: application checks cache first, populates on miss",
      "Write-through: write to cache and DB simultaneously",
      "Write-behind: write to cache, async flush to DB",
      "Read-through: cache sits in front, fills itself on miss",
      "Cache stampede occurs when many requests miss simultaneously",
      "Frequently mutated or user-specific data is a poor cache candidate",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Message Queues",
    difficulty: 4,
    mainQuestion: mq(
      "What problem do message queues solve in a distributed backend architecture? Compare RabbitMQ and Kafka in terms of use cases and guarantees."
    ),
    followups: [
      fu("What is the difference between a queue and a topic?"),
      fu("What does 'at-least-once delivery' mean and how do you handle duplicate messages?"),
      fu("How does Kafka achieve high throughput compared to traditional message brokers?"),
      fu("What is a dead-letter queue and when is it useful?"),
      fu("How do you ensure message ordering in a distributed queue?"),
    ],
    evaluationPoints: [
      "Queues decouple producers from consumers and absorb traffic spikes",
      "RabbitMQ is broker-centric with routing; Kafka is a distributed log",
      "Kafka retains messages for replay; RabbitMQ deletes after acknowledgment",
      "Idempotent consumers handle duplicate delivery safely",
      "Dead-letter queues isolate failed messages for inspection",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Rate Limiting",
    difficulty: 4,
    mainQuestion: mq(
      "How would you design and implement a rate limiting system for a public API? Discuss the token bucket and sliding window algorithms."
    ),
    followups: [
      fu("What is the fixed window counter algorithm and what is its main flaw?"),
      fu("How does a sliding window log fix the fixed window problem?"),
      fu("How do you implement distributed rate limiting across multiple servers?"),
      fu("What HTTP headers should a rate-limited API return?"),
      fu("How would you differentiate rate limits for authenticated vs anonymous users?"),
    ],
    evaluationPoints: [
      "Token bucket allows bursts; sliding window provides smoother enforcement",
      "Fixed window has boundary-edge problem allowing 2x burst",
      "Distributed rate limiting requires a shared store like Redis",
      "X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After headers",
      "Per-user limits require identifying the requester (API key, IP, token)",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Load Balancing",
    difficulty: 4,
    mainQuestion: mq(
      "Explain how load balancing works and compare round-robin, least connections, and IP hash algorithms. When would you choose each?"
    ),
    followups: [
      fu("What is the difference between L4 and L7 load balancing?"),
      fu("How do sticky sessions work and what problems do they cause?"),
      fu("How does a health check integrate with load balancer routing?"),
      fu("What is weighted round-robin and when is it useful?"),
      fu("How does a load balancer handle SSL termination?"),
    ],
    evaluationPoints: [
      "Round-robin distributes evenly but ignores server load",
      "Least connections routes to the least busy server",
      "IP hash ensures the same client always hits the same server",
      "L7 load balancers inspect HTTP content for routing decisions",
      "Health checks remove unhealthy instances from the pool",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Microservices Architecture",
    difficulty: 5,
    mainQuestion: mq(
      "What are the key benefits and challenges of a microservices architecture compared to a monolith? How do teams decide when to break a service apart?"
    ),
    followups: [
      fu("What is the strangler fig pattern for migrating from a monolith?"),
      fu("How do microservices communicate synchronously versus asynchronously?"),
      fu("What is a service mesh and what problems does it solve?"),
      fu("How do you handle distributed transactions across microservices?"),
      fu("What is Conway's Law and how does it relate to microservices?"),
    ],
    evaluationPoints: [
      "Independent deployment and scaling are key microservice benefits",
      "Network latency, distributed state, and operational complexity are challenges",
      "Synchronous: REST/gRPC; Asynchronous: message queues/event bus",
      "Saga pattern handles distributed transactions without 2PC",
      "Conway's Law: system architecture reflects team communication structure",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "API Gateway Pattern",
    difficulty: 4,
    mainQuestion: mq(
      "What is an API gateway and what responsibilities does it typically own in a microservices architecture?"
    ),
    followups: [
      fu("How does an API gateway differ from a reverse proxy?"),
      fu("What is the BFF (Backend for Frontend) pattern?"),
      fu("How does an API gateway handle authentication centrally?"),
      fu("What risks does a single API gateway introduce?"),
      fu("How do you implement request aggregation in an API gateway?"),
    ],
    evaluationPoints: [
      "API gateway handles routing, auth, rate limiting, logging, and SSL",
      "It is a single entry point reducing client-service coupling",
      "BFF creates gateway variants tailored to specific client types",
      "Single point of failure must be mitigated with redundancy",
      "Request aggregation fans out to multiple services and merges responses",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "WebSockets and Real-Time Communication",
    difficulty: 5,
    mainQuestion: mq(
      "How do WebSockets differ from HTTP polling and Server-Sent Events? When should you use each for real-time features?"
    ),
    followups: [
      fu("How is the WebSocket handshake initiated over HTTP?"),
      fu("How do you scale WebSocket connections across multiple servers?"),
      fu("What are the security considerations for WebSocket connections?"),
      fu("When is Server-Sent Events preferable to WebSockets?"),
      fu("How do you implement reconnection logic in a WebSocket client?"),
    ],
    evaluationPoints: [
      "WebSockets are full-duplex; SSE is server-to-client only; polling is inefficient",
      "WebSocket handshake upgrades HTTP via Upgrade header",
      "Scaling requires a shared pub/sub layer (e.g., Redis Pub/Sub)",
      "SSE is simpler for unidirectional streams (e.g., news feeds)",
      "Authentication tokens should be passed during handshake, not URLs",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Database Connection Pooling",
    difficulty: 5,
    mainQuestion: mq(
      "What is database connection pooling and why is it critical for backend performance? How do you configure it correctly?"
    ),
    followups: [
      fu("What happens when all connections in the pool are exhausted?"),
      fu("How do you set the appropriate pool size for a given workload?"),
      fu("What is connection leaking and how do you detect it?"),
      fu("How does a PgBouncer-style proxy improve pooling for PostgreSQL?"),
      fu("How does connection pool behavior change with serverless functions?"),
    ],
    evaluationPoints: [
      "Pooling reuses connections rather than creating new ones per request",
      "New connections are expensive: TCP handshake + DB auth overhead",
      "Pool exhaustion causes request queuing or rejection",
      "Pool size ≈ CPU cores × 2 is a common starting heuristic",
      "Serverless requires per-invocation connection management or proxy",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Event-Driven Architecture",
    difficulty: 5,
    mainQuestion: mq(
      "Explain event-driven architecture. What are events, event producers, and event consumers? How does EDA compare to request-response architectures?"
    ),
    followups: [
      fu("What is event sourcing and how does it differ from standard event-driven design?"),
      fu("What are the challenges of ensuring event ordering in distributed systems?"),
      fu("How do you handle schema evolution in event payloads over time?"),
      fu("What is the outbox pattern and what problem does it solve?"),
      fu("How do you replay events to rebuild application state?"),
    ],
    evaluationPoints: [
      "EDA decouples producers and consumers via events",
      "Better scalability and resilience than synchronous request-response",
      "Event sourcing stores state as a sequence of immutable events",
      "Outbox pattern ensures DB writes and event publishes are atomic",
      "Schema registries (Avro, Protobuf) manage event schema evolution",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "JWT and Session Management",
    difficulty: 4,
    mainQuestion: mq(
      "Compare JWT-based authentication with server-side session management. What are the security trade-offs of each approach?"
    ),
    followups: [
      fu("How can you invalidate a JWT before it expires?"),
      fu("What are the risks of storing JWTs in localStorage vs httpOnly cookies?"),
      fu("What is the purpose of the refresh token pattern?"),
      fu("What claims should a JWT contain minimally and what should be avoided?"),
      fu("How does JWT signature verification prevent token tampering?"),
    ],
    evaluationPoints: [
      "Sessions are stateful (server-stored); JWTs are stateless (self-contained)",
      "JWTs cannot be revoked easily without a denylist",
      "localStorage exposes JWTs to XSS; httpOnly cookies prevent JS access",
      "Refresh tokens allow long-lived sessions with short-lived access tokens",
      "JWTs are signed (HMAC or RSA) — tampering invalidates the signature",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "CAP Theorem",
    difficulty: 4,
    mainQuestion: mq(
      "Explain the CAP theorem and its practical implications when designing distributed backend systems."
    ),
    followups: [
      fu("Why can a distributed system only guarantee two of the three CAP properties?"),
      fu("How do CP systems handle partition scenarios differently from AP systems?"),
      fu("What is the PACELC theorem and how does it extend CAP?"),
      fu("Give examples of databases that are CP versus AP."),
      fu("What is eventual consistency and how is it implemented?"),
    ],
    evaluationPoints: [
      "CAP: Consistency, Availability, Partition Tolerance",
      "Network partitions are unavoidable, so systems choose C or A",
      "CP: HBase, ZooKeeper; AP: Cassandra, DynamoDB, CouchDB",
      "PACELC adds latency vs consistency trade-off in normal operation",
      "Eventual consistency allows temporary divergence that resolves over time",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Containerization with Docker",
    difficulty: 5,
    mainQuestion: mq(
      "How does Docker containerization improve backend development and deployment? Explain images, containers, and layers."
    ),
    followups: [
      fu("How does a Dockerfile build an image layer by layer?"),
      fu("What is the difference between CMD and ENTRYPOINT?"),
      fu("How do you reduce Docker image size?"),
      fu("What security risks are introduced by running containers as root?"),
      fu("How does Docker networking enable communication between containers?"),
    ],
    evaluationPoints: [
      "Containers isolate application and its dependencies from the host",
      "Images are immutable layered filesystems built from Dockerfiles",
      "Each RUN/COPY instruction adds a new layer",
      "Multi-stage builds and .dockerignore reduce image size",
      "Containers should run as non-root users to limit attack surface",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "API Versioning Strategies",
    difficulty: 4,
    mainQuestion: mq(
      "What API versioning strategies exist and what are the trade-offs of each? How do you handle breaking changes without disrupting clients?"
    ),
    followups: [
      fu("What constitutes a breaking change in a REST API?"),
      fu("How does URL versioning (/v1/, /v2/) compare to header-based versioning?"),
      fu("What is semantic versioning and does it apply to APIs?"),
      fu("How long should an old API version remain supported?"),
      fu("How do you communicate deprecation to API consumers?"),
    ],
    evaluationPoints: [
      "URL versioning (/v1) is explicit and cacheable",
      "Header versioning (Accept: application/vnd.api+json; version=2) is cleaner but less visible",
      "Breaking changes: removed fields, changed types, altered semantics",
      "Deprecation notices via Sunset and Deprecation HTTP headers",
      "Maintain old versions until traffic drops below a threshold",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Horizontal vs Vertical Scaling",
    difficulty: 5,
    mainQuestion: mq(
      "Explain horizontal and vertical scaling. What architectural considerations determine which approach is appropriate?"
    ),
    followups: [
      fu("What is stateless design and why is it required for horizontal scaling?"),
      fu("What is the shared-nothing architecture?"),
      fu("How do distributed caches and sessions enable horizontal scaling?"),
      fu("At what point does vertical scaling hit a hard limit?"),
      fu("What is auto-scaling and how does it relate to horizontal scaling?"),
    ],
    evaluationPoints: [
      "Vertical: add more resources to one machine; horizontal: add more machines",
      "Horizontal scaling requires stateless services or externalized state",
      "Shared-nothing: each node is independent with no shared disk or memory",
      "Vertical scaling has physical and cost limits (single machine ceiling)",
      "Auto-scaling adds/removes instances based on load metrics",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "gRPC vs REST",
    difficulty: 5,
    mainQuestion: mq(
      "How does gRPC differ from REST? In what scenarios would you choose gRPC over REST for inter-service communication?"
    ),
    followups: [
      fu("What is Protocol Buffers and how does it compare to JSON serialization?"),
      fu("How does gRPC handle streaming (client, server, bidirectional)?"),
      fu("What are the challenges of using gRPC with web browsers?"),
      fu("How does gRPC's generated code improve developer productivity?"),
      fu("What is the performance difference between gRPC and REST under high load?"),
    ],
    evaluationPoints: [
      "gRPC uses HTTP/2 and Protobuf for efficient binary serialization",
      "REST uses HTTP/1.1 and text-based JSON",
      "gRPC is 5-10x faster with smaller payload sizes",
      "gRPC supports streaming natively; REST requires workarounds",
      "gRPC is less browser-friendly; grpc-web is required for web clients",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Database Sharding",
    difficulty: 6,
    mainQuestion: mq(
      "What is database sharding and how does it enable horizontal database scaling? Describe common sharding strategies."
    ),
    followups: [
      fu("What is a shard key and how does it affect query routing?"),
      fu("What is hotspot sharding and how do you prevent it?"),
      fu("How do cross-shard queries and joins work?"),
      fu("What is consistent hashing and why is it used for sharding?"),
      fu("How does resharding work when you need to add more shards?"),
    ],
    evaluationPoints: [
      "Sharding splits data across multiple database instances",
      "Shard key determines which shard a row belongs to",
      "Poor shard key choices create hotspots (uneven distribution)",
      "Cross-shard queries are expensive and may require scatter-gather",
      "Consistent hashing minimizes data movement when adding shards",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "CI/CD Pipelines",
    difficulty: 6,
    mainQuestion: mq(
      "Describe a typical CI/CD pipeline for a backend Node.js service. What stages should it include and what tools would you use?"
    ),
    followups: [
      fu("What is the difference between continuous delivery and continuous deployment?"),
      fu("How do you run database migrations safely in a CI/CD pipeline?"),
      fu("What is a blue-green deployment and what problem does it solve?"),
      fu("How do you roll back a bad deployment quickly?"),
      fu("What is the role of feature flags in a CI/CD workflow?"),
    ],
    evaluationPoints: [
      "Stages: lint, test, build, push artifact, deploy to staging, deploy to prod",
      "Continuous delivery requires manual approval; deployment is fully automated",
      "Blue-green deployments allow instant rollback by switching traffic",
      "Database migrations must be backward-compatible for zero-downtime deploys",
      "Feature flags decouple deployment from feature release",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Idempotency in APIs",
    difficulty: 4,
    mainQuestion: mq(
      "What is idempotency in the context of APIs? Why is it important for payment systems and distributed operations, and how do you implement it?"
    ),
    followups: [
      fu("Which HTTP methods are idempotent by definition?"),
      fu("How does an idempotency key pattern work for POST requests?"),
      fu("How do you store and check idempotency keys at scale?"),
      fu("What happens if two requests with the same idempotency key arrive simultaneously?"),
      fu("How does idempotency protect against network retries causing duplicate charges?"),
    ],
    evaluationPoints: [
      "Idempotent operations produce the same result if called multiple times",
      "GET, PUT, DELETE are idempotent; POST is not by definition",
      "Idempotency key is a unique client-provided ID stored server-side",
      "Duplicate requests return cached response without re-executing",
      "Critical in payment systems to prevent double charges on retry",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "N+1 Query Problem",
    difficulty: 5,
    mainQuestion: mq(
      "What is the N+1 query problem in ORM-based applications? How do you detect and fix it?"
    ),
    followups: [
      fu("How does eager loading solve the N+1 problem?"),
      fu("What is the difference between JOIN-based and batching-based eager loading?"),
      fu("How do query profiling tools help identify N+1 issues?"),
      fu("What is DataLoader (from GraphQL) and how does it batch queries?"),
      fu("When can eager loading itself cause performance problems?"),
    ],
    evaluationPoints: [
      "N+1: fetching N related records triggers N additional queries",
      "Eager loading (include/join) fetches related data in one query",
      "ORMs like Sequelize and TypeORM support eager loading via includes",
      "DataLoader batches and caches DB calls within a request lifecycle",
      "Over-eager loading of large associations can waste memory",
    ],
  },

  // ─── HARD (15) ────────────────────────────────────────────────────────────
  {
    role: "Backend Engineer",
    topic: "Distributed Systems Consensus",
    difficulty: 7,
    mainQuestion: mq(
      "Explain the Raft consensus algorithm. How does it achieve leader election, log replication, and safety guarantees in a distributed system?"
    ),
    followups: [
      fu("How does Raft's leader election differ from Paxos?"),
      fu("What is a split-brain scenario and how does Raft's quorum prevent it?"),
      fu("How does log compaction (snapshotting) work in Raft?"),
      fu("What happens to a Raft cluster if more than half the nodes fail?"),
      fu("How are linearizability and safety guaranteed in Raft?"),
    ],
    evaluationPoints: [
      "Raft uses a single strong leader per term for log replication",
      "Leader election requires majority (quorum) vote",
      "Log entries are committed only when replicated to majority",
      "Raft is understandable by design, unlike Paxos",
      "Safety: two committed entries with the same index must be identical",
      "Snapshotting compacts the log to prevent unbounded growth",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Two-Phase Commit",
    difficulty: 8,
    mainQuestion: mq(
      "Explain the two-phase commit (2PC) protocol. What problem does it solve, and what are its fundamental limitations in a distributed system?"
    ),
    followups: [
      fu("What is the blocking problem in 2PC during coordinator failure?"),
      fu("How does three-phase commit (3PC) attempt to fix 2PC's blocking issue?"),
      fu("How does the Saga pattern avoid the need for 2PC?"),
      fu("What is heuristic commitment and when does it occur?"),
      fu("Why is 2PC rarely used across microservices despite its correctness guarantees?"),
    ],
    evaluationPoints: [
      "2PC: prepare phase gathers votes; commit phase finalizes or aborts",
      "Coordinator failure after prepare leaves participants blocked",
      "3PC adds a pre-commit phase to allow timeout-based abort",
      "Saga uses local transactions and compensating transactions",
      "2PC is synchronous, slow, and has high latency and availability cost",
      "Microservices favor eventual consistency over 2PC",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Circuit Breaker Pattern",
    difficulty: 7,
    mainQuestion: mq(
      "Describe the circuit breaker design pattern in microservices. How does it prevent cascade failures, and how do the three states work?"
    ),
    followups: [
      fu("What metrics determine when a circuit breaker should trip open?"),
      fu("How does the half-open state work and why is it needed?"),
      fu("How do you implement a circuit breaker in Node.js (e.g., with opossum)?"),
      fu("How do circuit breakers interact with retry logic?"),
      fu("What is the bulkhead pattern and how does it complement circuit breakers?"),
    ],
    evaluationPoints: [
      "Three states: closed (normal), open (failing, reject fast), half-open (probing)",
      "Prevents downstream failures from cascading upstream",
      "Opens on error rate or consecutive failure threshold",
      "Half-open allows a probe request to test recovery",
      "Retries with circuit breaker need exponential backoff and jitter",
      "Bulkhead isolates failure domains by limiting concurrent calls",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "CQRS and Event Sourcing",
    difficulty: 8,
    mainQuestion: mq(
      "Explain CQRS (Command Query Responsibility Segregation) and how it combines with Event Sourcing. What problems do they solve together?"
    ),
    followups: [
      fu("How does CQRS enable independent scaling of read and write sides?"),
      fu("How are read models (projections) built from an event log?"),
      fu("What is eventual consistency in a CQRS system and how do you handle it in the UI?"),
      fu("What is a snapshot in event sourcing and why is it needed?"),
      fu("What are the operational challenges of running an event-sourced system in production?"),
    ],
    evaluationPoints: [
      "CQRS separates command (write) and query (read) models",
      "Event sourcing stores all state changes as an immutable event log",
      "Read models are derived projections rebuilt from events",
      "Allows time travel: replaying events to restore any past state",
      "Snapshots optimize replay for aggregates with long event histories",
      "Operational complexity: event store migrations, projection rebuilds",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Distributed Tracing",
    difficulty: 7,
    mainQuestion: mq(
      "What is distributed tracing and how does it work across microservices? Describe the key concepts of spans, traces, and context propagation."
    ),
    followups: [
      fu("How does OpenTelemetry standardize distributed tracing?"),
      fu("What is trace context propagation and how is it done over HTTP?"),
      fu("How do you implement sampling to reduce tracing overhead?"),
      fu("What is the difference between a root span and a child span?"),
      fu("How do you correlate traces with logs and metrics in an observability platform?"),
    ],
    evaluationPoints: [
      "A trace is the full path of a request; a span is a single operation within it",
      "Context propagation passes trace-id and span-id via HTTP headers (W3C Trace Context)",
      "OpenTelemetry provides vendor-neutral instrumentation",
      "Head-based and tail-based sampling reduce volume",
      "Traces, logs, and metrics form the three pillars of observability",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Eventual Consistency Patterns",
    difficulty: 8,
    mainQuestion: mq(
      "Describe practical patterns for implementing eventual consistency in distributed systems. How do you handle conflicting writes and convergence?"
    ),
    followups: [
      fu("What is a vector clock and how does it track causality?"),
      fu("What are CRDTs (Conflict-free Replicated Data Types) and when are they used?"),
      fu("How does Amazon DynamoDB handle conflicts with last-write-wins?"),
      fu("What is read repair in Cassandra and how does it restore consistency?"),
      fu("How do you test eventual consistency in a distributed system?"),
    ],
    evaluationPoints: [
      "Eventual consistency: all replicas converge given no new updates",
      "Vector clocks detect causality and identify concurrent conflicting writes",
      "CRDTs design data types whose merge operation is always safe",
      "Last-write-wins uses timestamps but risks losing concurrent updates",
      "Read repair detects stale replicas during reads and fixes them",
      "Chaos engineering (simulated partitions) tests consistency behavior",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Zero-Downtime Database Migrations",
    difficulty: 9,
    mainQuestion: mq(
      "How do you perform backward-compatible, zero-downtime database schema migrations in a system with multiple running application instances?"
    ),
    followups: [
      fu("What is the expand-contract (parallel change) migration pattern?"),
      fu("How do you add a NOT NULL column to a large table without locking it?"),
      fu("How does blue-green deployment interact with database migrations?"),
      fu("What is a ghost table migration and how does pt-online-schema-change work?"),
      fu("How do you validate that a migration was successful without downtime?"),
    ],
    evaluationPoints: [
      "Expand-contract: add new structure, migrate data, drop old structure in separate deploys",
      "New columns should be nullable or have defaults before backfilling",
      "Both old and new app versions must work with the intermediate schema",
      "pt-online-schema-change copies to a shadow table, syncs via triggers",
      "Dark reads and dual writes validate new schema before cutover",
      "Lock-free migrations are essential for large high-traffic tables",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Observability and SLOs",
    difficulty: 9,
    mainQuestion: mq(
      "Explain the concepts of SLIs, SLOs, and SLAs in the context of backend reliability engineering. How do you design an observability system around them?"
    ),
    followups: [
      fu("What is an error budget and how does it drive engineering decisions?"),
      fu("What are the four golden signals of monitoring?"),
      fu("How do you implement an alerting strategy that avoids alert fatigue?"),
      fu("What is burn rate alerting and how does it improve SLO-based alerting?"),
      fu("How do you calculate P99 latency and why is it more meaningful than average latency?"),
    ],
    evaluationPoints: [
      "SLI: measured indicator (e.g., request success rate); SLO: target (99.9%); SLA: contractual commitment",
      "Error budget = 1 - SLO availability; exhausting it triggers freeze on risky changes",
      "Four golden signals: latency, traffic, errors, saturation",
      "Burn rate alerts trigger earlier than simple threshold alerts",
      "P99 latency captures tail latency that averages hide",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Service Discovery",
    difficulty: 8,
    mainQuestion: mq(
      "How does service discovery work in a microservices architecture? Compare client-side and server-side discovery patterns."
    ),
    followups: [
      fu("How does Consul or etcd serve as a service registry?"),
      fu("What is DNS-based service discovery and what are its limitations?"),
      fu("How does Kubernetes implement service discovery natively?"),
      fu("What is a health check endpoint and how does it integrate with service discovery?"),
      fu("How do you handle service deregistration when a node crashes?"),
    ],
    evaluationPoints: [
      "Service discovery allows services to find each other dynamically without hardcoded IPs",
      "Client-side: client queries registry and load-balances; server-side: load balancer handles routing",
      "Consul uses gossip protocol and health checks; etcd uses Raft",
      "Kubernetes Service + kube-dns provides built-in service discovery",
      "TTL-based leases auto-deregister crashed nodes that stop renewing",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Bloom Filters",
    difficulty: 8,
    mainQuestion: mq(
      "What is a Bloom filter and how is it used in backend systems? Explain how false positives arise and how the false positive rate is controlled."
    ),
    followups: [
      fu("What operations does a Bloom filter support and which does it not?"),
      fu("How do you choose the number of hash functions and bit array size?"),
      fu("Where are Bloom filters used in databases like Cassandra or RocksDB?"),
      fu("What is a counting Bloom filter and what additional operation does it support?"),
      fu("How would you use a Bloom filter to reduce database lookups for non-existent keys?"),
    ],
    evaluationPoints: [
      "Bloom filter is a probabilistic data structure for set membership testing",
      "False positives possible; false negatives are impossible",
      "Optimal hash function count k = (m/n) * ln(2)",
      "Used in databases to skip disk reads for keys known not to exist",
      "Counting Bloom filters support deletion by storing counts instead of bits",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Consistent Hashing",
    difficulty: 9,
    mainQuestion: mq(
      "Explain consistent hashing. How does it minimize data redistribution when nodes are added or removed in a distributed cache or database?"
    ),
    followups: [
      fu("How does a virtual node (vnode) improve load distribution in consistent hashing?"),
      fu("What is the hash ring and how are nodes placed on it?"),
      fu("How does consistent hashing compare to modulo-based sharding?"),
      fu("Where is consistent hashing used in real-world systems like Cassandra or Memcached?"),
      fu("How do you handle hot spots in a consistent hashing ring?"),
    ],
    evaluationPoints: [
      "Consistent hashing maps both nodes and keys to a ring",
      "Adding/removing a node only moves ~1/N of keys",
      "Modulo sharding moves nearly all keys when adding a node",
      "Virtual nodes spread load and handle heterogeneous node sizes",
      "Cassandra uses consistent hashing with vnodes for token distribution",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Backpressure in Streaming Systems",
    difficulty: 7,
    mainQuestion: mq(
      "What is backpressure in a streaming system? Why is it necessary and how is it implemented in Node.js streams and reactive systems?"
    ),
    followups: [
      fu("What happens when a consumer cannot keep up with a producer without backpressure?"),
      fu("How do Node.js readable and writable streams implement backpressure via the highWaterMark?"),
      fu("How does backpressure work in reactive programming (RxJS)?"),
      fu("What is the difference between dropping, buffering, and blocking as backpressure strategies?"),
      fu("How does Kafka handle backpressure through consumer lag monitoring?"),
    ],
    evaluationPoints: [
      "Backpressure prevents fast producers from overwhelming slow consumers",
      "Without it, buffers grow unbounded, causing memory exhaustion or crashes",
      "Node.js stream.write() returns false when buffer is full; drain event signals readiness",
      "highWaterMark controls the internal buffer size threshold",
      "Strategies: drop (lossy), buffer (bounded), block (blocking producer)",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Multi-Region Deployment",
    difficulty: 8,
    mainQuestion: mq(
      "How do you architect a backend system for multi-region deployment? Discuss data replication, latency optimization, and failover strategies."
    ),
    followups: [
      fu("What is active-active versus active-passive multi-region deployment?"),
      fu("How do you handle cross-region database replication lag?"),
      fu("What is GeoDNS routing and how does it direct users to the nearest region?"),
      fu("How do you implement read-local, write-global for a globally distributed database?"),
      fu("What is the role of a global load balancer in multi-region setups?"),
    ],
    evaluationPoints: [
      "Active-active: all regions serve traffic; active-passive: standby promotes on failure",
      "Replication lag can cause stale reads — accept eventual consistency or use synchronous replication",
      "GeoDNS routes users based on IP geolocation to the nearest region",
      "Read-local reduces latency; writes may go to a primary region",
      "Global load balancers route traffic based on health checks and latency",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "Write-Ahead Logging",
    difficulty: 8,
    mainQuestion: mq(
      "What is write-ahead logging (WAL) and how do databases use it to ensure durability and support crash recovery?"
    ),
    followups: [
      fu("How does WAL enable point-in-time recovery (PITR) in PostgreSQL?"),
      fu("What is a checkpoint in the context of WAL and why is it needed?"),
      fu("How does logical replication use WAL to replicate data between servers?"),
      fu("What is WAL segmentation and how is it managed in production?"),
      fu("How does WAL impact write performance and how do databases tune it?"),
    ],
    evaluationPoints: [
      "WAL writes changes to a log before applying them to data pages",
      "If the system crashes, the log is replayed to restore consistent state",
      "Checkpoints flush dirty pages to disk and advance the WAL recovery point",
      "PITR replays WAL segments to restore to any past point",
      "WAL segmentation archives old segments for backup and replication",
      "fsync controls durability vs performance trade-off in WAL writes",
    ],
  },
  {
    role: "Backend Engineer",
    topic: "API Security: OAuth 2.0 and PKCE",
    difficulty: 7,
    mainQuestion: mq(
      "Describe the OAuth 2.0 authorization code flow with PKCE. Why was PKCE introduced and what attack does it prevent?"
    ),
    followups: [
      fu("What is the difference between the authorization code flow and the implicit flow?"),
      fu("How does the code verifier and code challenge work cryptographically in PKCE?"),
      fu("What is token binding and how does it address access token theft?"),
      fu("How do you implement token introspection for stateful token validation?"),
      fu("What is the difference between opaque tokens and JWT access tokens in OAuth 2.0?"),
    ],
    evaluationPoints: [
      "PKCE prevents authorization code interception attacks in public clients",
      "Code verifier is a random secret; code challenge is its SHA-256 hash",
      "Implicit flow is deprecated — it exposes tokens in URL fragments",
      "Token introspection checks token validity with the authorization server",
      "Opaque tokens require server-side lookup; JWTs are self-contained but unrevocable",
      "Public clients (SPAs, mobile) cannot safely store client secrets — PKCE replaces it",
    ],
  },
];

// ---------------------------------------------------------------------------
// ML ENGINEER  –  15 easy · 20 medium · 15 hard  =  50 topics
// ---------------------------------------------------------------------------
const mlQuestions = [
  // ─── EASY (15) ────────────────────────────────────────────────────────────
  {
    role: "Machine Learning Engineer",
    topic: "Supervised vs Unsupervised Learning",
    difficulty: 1,
    mainQuestion: mq(
      "Explain the difference between supervised and unsupervised learning. Give two real-world examples of each."
    ),
    followups: [
      fu("What is semi-supervised learning and when is it used?"),
      fu("What kind of output does a supervised learning model produce?"),
      fu("How does clustering differ from classification?"),
      fu("What is self-supervised learning and how does it differ from unsupervised learning?"),
      fu("Why is labeling data expensive and how does it affect algorithm choice?"),
    ],
    evaluationPoints: [
      "Supervised: labeled data, learns input-output mapping (classification, regression)",
      "Unsupervised: no labels, discovers structure (clustering, dimensionality reduction)",
      "Semi-supervised combines small labeled set with large unlabeled set",
      "Self-supervised creates labels from data itself (e.g., masked language modeling)",
      "Labeling cost often drives adoption of unsupervised or semi-supervised methods",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Overfitting and Underfitting",
    difficulty: 2,
    mainQuestion: mq(
      "What are overfitting and underfitting in machine learning models? How do you detect and mitigate each?"
    ),
    followups: [
      fu("How does the bias-variance trade-off relate to overfitting and underfitting?"),
      fu("What role does training set size play in overfitting?"),
      fu("How can regularization prevent overfitting?"),
      fu("What is a learning curve and how does it reveal overfitting vs underfitting?"),
      fu("What is the difference between a model with high variance and high bias?"),
    ],
    evaluationPoints: [
      "Overfitting: model memorizes training data, generalizes poorly",
      "Underfitting: model is too simple to capture the pattern",
      "Learning curves show training vs validation error gap",
      "Regularization, more data, and simpler models address overfitting",
      "High bias → underfitting; high variance → overfitting",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Train/Validation/Test Split",
    difficulty: 2,
    mainQuestion: mq(
      "Why do we split datasets into training, validation, and test sets? What are the risks of using only a train/test split?"
    ),
    followups: [
      fu("What is data leakage and how can it occur through the test set?"),
      fu("How do you handle a very small dataset with limited examples?"),
      fu("What is stratified splitting and when is it necessary?"),
      fu("How does the test set differ in purpose from the validation set?"),
      fu("What split ratios are commonly used and how do they depend on dataset size?"),
    ],
    evaluationPoints: [
      "Training: model learns; validation: hyperparameter tuning; test: final unbiased evaluation",
      "Using test set for tuning causes data leakage and overfitting to test set",
      "Stratified split ensures each set has proportional class representation",
      "Small datasets benefit from cross-validation instead of fixed splits",
      "Common ratios: 70/15/15 or 80/10/10",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Linear Regression",
    difficulty: 2,
    mainQuestion: mq(
      "Explain how linear regression works. What are its assumptions and how do violations of those assumptions affect the model?"
    ),
    followups: [
      fu("What is the ordinary least squares (OLS) objective?"),
      fu("How does multicollinearity affect linear regression coefficients?"),
      fu("What is the difference between simple and multiple linear regression?"),
      fu("How do you interpret regression coefficients?"),
      fu("What is the difference between R² and adjusted R²?"),
    ],
    evaluationPoints: [
      "Linear regression fits a hyperplane by minimizing sum of squared residuals",
      "Assumptions: linearity, homoscedasticity, independence, normality of residuals",
      "Multicollinearity inflates coefficient variance and makes them unstable",
      "R² measures explained variance; adjusted R² penalizes extra features",
      "Coefficients represent change in output per unit change in a feature",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Gradient Descent",
    difficulty: 2,
    mainQuestion: mq(
      "Explain how gradient descent optimizes a machine learning model. Compare batch, stochastic, and mini-batch variants."
    ),
    followups: [
      fu("What is the learning rate and how does its value affect convergence?"),
      fu("What is a local minimum and how do saddle points relate to neural network optimization?"),
      fu("Why does stochastic gradient descent sometimes converge faster than batch gradient descent?"),
      fu("What is learning rate scheduling and why is it used?"),
      fu("How does gradient descent change with momentum?"),
    ],
    evaluationPoints: [
      "Gradient descent iteratively moves in the direction of steepest loss decrease",
      "Batch uses all data; SGD uses one sample; mini-batch uses a subset",
      "High learning rate overshoots; too low converges slowly",
      "SGD noise helps escape local minima in non-convex landscapes",
      "Momentum accumulates past gradients to dampen oscillations",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Decision Trees",
    difficulty: 1,
    mainQuestion: mq(
      "How does a decision tree learn to classify data? Explain the splitting criteria (Gini impurity, information gain) and the risk of overfitting."
    ),
    followups: [
      fu("What is Gini impurity versus entropy as a splitting criterion?"),
      fu("How does tree depth control overfitting?"),
      fu("What is pruning and how does it improve generalization?"),
      fu("How do decision trees handle continuous features?"),
      fu("Why are decision trees prone to high variance?"),
    ],
    evaluationPoints: [
      "Decision trees recursively split data to minimize impurity",
      "Gini impurity measures probability of misclassification; entropy measures uncertainty",
      "Deeper trees overfit; max depth and min samples per leaf constrain growth",
      "Pruning removes branches that do not improve validation performance",
      "Trees are unstable: small data changes produce very different trees",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Classification Metrics",
    difficulty: 2,
    mainQuestion: mq(
      "Explain accuracy, precision, recall, and F1-score. When is each the most appropriate metric for evaluating a classifier?"
    ),
    followups: [
      fu("What is a confusion matrix and what four values does it contain?"),
      fu("When would you prioritize recall over precision (or vice versa)?"),
      fu("What is the F-beta score and how does beta adjust the precision-recall balance?"),
      fu("Why is accuracy misleading on imbalanced datasets?"),
      fu("What is the micro vs macro averaging distinction for multi-class metrics?"),
    ],
    evaluationPoints: [
      "Accuracy = correct / total; misleading with class imbalance",
      "Precision = TP / (TP + FP); recall = TP / (TP + FN)",
      "F1 = harmonic mean of precision and recall",
      "High recall prioritized when false negatives are costly (e.g., cancer screening)",
      "Macro averages treat all classes equally; micro weights by class frequency",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Feature Scaling",
    difficulty: 1,
    mainQuestion: mq(
      "Why is feature scaling important in machine learning? Compare normalization (min-max) and standardization (z-score) and explain when to use each."
    ),
    followups: [
      fu("Which algorithms are sensitive to feature scale and which are not?"),
      fu("What is the problem with applying scaling before train/test split?"),
      fu("How does standardization handle outliers compared to min-max scaling?"),
      fu("What is robust scaling and when is it preferred?"),
      fu("Does tree-based models require feature scaling? Why or why not?"),
    ],
    evaluationPoints: [
      "Algorithms like KNN, SVM, and neural networks are scale-sensitive",
      "Min-max scales to [0,1]; standardization produces mean=0, std=1",
      "Scaler must be fit only on training data to prevent data leakage",
      "Outliers distort min-max scaling; standardization is more robust",
      "Tree-based models are scale-invariant due to threshold-based splits",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "k-Nearest Neighbors",
    difficulty: 2,
    mainQuestion: mq(
      "How does the k-Nearest Neighbors (kNN) algorithm work for classification? What are its main assumptions and limitations?"
    ),
    followups: [
      fu("How does the choice of k affect the bias-variance trade-off?"),
      fu("What distance metrics can be used and how does the choice matter?"),
      fu("What is the curse of dimensionality and how does it affect kNN?"),
      fu("What is the computational cost of kNN at inference time?"),
      fu("How do you handle categorical features in kNN?"),
    ],
    evaluationPoints: [
      "kNN classifies by majority vote among k nearest training examples",
      "Small k → high variance; large k → high bias",
      "Euclidean, Manhattan, and cosine are common distance metrics",
      "Curse of dimensionality: distance becomes meaningless in high dimensions",
      "kNN is lazy learning: no training cost, but O(n) inference per query",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Cross-Validation",
    difficulty: 2,
    mainQuestion: mq(
      "What is k-fold cross-validation? Why is it preferred over a single train-test split for model evaluation and hyperparameter selection?"
    ),
    followups: [
      fu("What is the difference between k-fold and leave-one-out cross-validation?"),
      fu("How does stratified k-fold cross-validation improve evaluation on imbalanced data?"),
      fu("What is nested cross-validation and why is it needed for unbiased evaluation?"),
      fu("How does cross-validation help estimate model variance?"),
      fu("What are the computational trade-offs of using more folds?"),
    ],
    evaluationPoints: [
      "k-fold splits data into k folds, trains on k-1, validates on the remaining fold",
      "Repeating over all folds gives a more reliable performance estimate",
      "Stratified k-fold preserves class distribution in each fold",
      "Nested CV: outer loop for evaluation, inner loop for hyperparameter tuning",
      "More folds → lower bias, higher computational cost",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Logistic Regression",
    difficulty: 1,
    mainQuestion: mq(
      "How does logistic regression work for binary classification? Explain the sigmoid function, log-loss, and interpretation of coefficients."
    ),
    followups: [
      fu("What is the decision boundary in logistic regression?"),
      fu("How does logistic regression handle multi-class problems?"),
      fu("What is regularization in logistic regression and what does the C parameter control?"),
      fu("How do you interpret logistic regression coefficients as odds ratios?"),
      fu("When is logistic regression preferred over more complex models?"),
    ],
    evaluationPoints: [
      "Logistic regression applies sigmoid to a linear combination to output probability",
      "Log-loss (binary cross-entropy) is the training objective",
      "Decision boundary is where predicted probability = 0.5",
      "Softmax extends logistic regression to multi-class problems",
      "Regularization (L1/L2) penalizes large weights to prevent overfitting",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Data Preprocessing",
    difficulty: 2,
    mainQuestion: mq(
      "Describe the key steps in preprocessing a real-world dataset before training a machine learning model."
    ),
    followups: [
      fu("How do you handle missing values in a dataset?"),
      fu("What is one-hot encoding and when should label encoding be used instead?"),
      fu("How do you deal with duplicate records?"),
      fu("How should you handle highly imbalanced target classes?"),
      fu("What is outlier detection and how can outliers affect model training?"),
    ],
    evaluationPoints: [
      "Steps: load, inspect, handle missing values, encode categoricals, scale numerics, split",
      "Missing values: mean/median/mode imputation or model-based imputation",
      "One-hot for nominal categories; label encoding introduces ordinal relationship",
      "Imbalanced classes: SMOTE oversampling, undersampling, or class-weighted loss",
      "Outliers can distort linear models; robust scalers or capping can help",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Loss Functions",
    difficulty: 3,
    mainQuestion: mq(
      "What are common loss functions used in machine learning? How do you choose the appropriate loss function for a given task?"
    ),
    followups: [
      fu("Why is mean squared error (MSE) sensitive to outliers?"),
      fu("What is the difference between MSE and MAE and when would you prefer MAE?"),
      fu("What is cross-entropy loss and why is it used for classification?"),
      fu("What is Huber loss and what problem does it solve?"),
      fu("How does the loss function relate to the model's probabilistic assumptions?"),
    ],
    evaluationPoints: [
      "Regression: MSE, MAE, Huber; Classification: cross-entropy, hinge loss",
      "MSE penalizes large errors more heavily due to squaring",
      "MAE is more robust to outliers than MSE",
      "Cross-entropy directly optimizes predicted probability distributions",
      "Huber loss is quadratic for small errors and linear for large ones",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Support Vector Machines",
    difficulty: 3,
    mainQuestion: mq(
      "Explain how Support Vector Machines (SVMs) find a decision boundary. What is the margin and what are support vectors?"
    ),
    followups: [
      fu("What is the kernel trick and why is it needed?"),
      fu("How does the C parameter control the trade-off between margin and misclassification?"),
      fu("What is the difference between a hard margin and a soft margin SVM?"),
      fu("What kernels are commonly used in SVM and what patterns do they capture?"),
      fu("How does SVM scale with large datasets?"),
    ],
    evaluationPoints: [
      "SVM finds the hyperplane that maximizes margin between classes",
      "Support vectors are the data points closest to the decision boundary",
      "Kernel trick maps data to higher dimensions without explicit computation",
      "Large C = small margin, fewer misclassifications; small C = large margin, allows errors",
      "RBF kernel handles non-linear boundaries; linear kernel is efficient for high-dimensional data",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Dimensionality Reduction",
    difficulty: 2,
    mainQuestion: mq(
      "What is dimensionality reduction and why is it important? Explain PCA at a conceptual level."
    ),
    followups: [
      fu("What is explained variance ratio in PCA and how do you choose the number of components?"),
      fu("How does PCA differ from t-SNE in purpose and properties?"),
      fu("What are the limitations of PCA?"),
      fu("What is the curse of dimensionality and how does dimensionality reduction help?"),
      fu("How does feature selection differ from feature extraction?"),
    ],
    evaluationPoints: [
      "PCA finds orthogonal axes (principal components) of maximum variance",
      "Explained variance ratio helps choose the number of components",
      "PCA is linear; t-SNE is non-linear and used for visualization only",
      "PCA loses interpretability of original features",
      "Feature selection removes features; extraction creates new ones (PCA, autoencoders)",
    ],
  },

  // ─── MEDIUM (20) ──────────────────────────────────────────────────────────
  {
    role: "Machine Learning Engineer",
    topic: "Regularization Techniques",
    difficulty: 5,
    mainQuestion: mq(
      "Compare L1 (Lasso) and L2 (Ridge) regularization. How do they differ in their effect on model weights and feature selection?"
    ),
    followups: [
      fu("What is Elastic Net and when is it preferred over Lasso or Ridge alone?"),
      fu("How does L1 regularization produce sparse weights?"),
      fu("How does the regularization strength hyperparameter affect the bias-variance trade-off?"),
      fu("What is dropout regularization in neural networks?"),
      fu("How do you choose the optimal regularization strength?"),
    ],
    evaluationPoints: [
      "L1 adds absolute weight penalty; L2 adds squared weight penalty",
      "L1 drives weights to exactly zero (sparse), enabling feature selection",
      "L2 shrinks weights evenly without zeroing them out",
      "Elastic Net combines L1 and L2 for grouped feature selection",
      "Dropout randomly zeroes activations during training as implicit regularization",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Ensemble Methods",
    difficulty: 5,
    mainQuestion: mq(
      "Explain bagging and boosting as ensemble strategies. How does Random Forest implement bagging and how does Gradient Boosting implement boosting?"
    ),
    followups: [
      fu("What is bootstrap sampling and how does it introduce diversity in bagging?"),
      fu("How does AdaBoost differ from Gradient Boosting?"),
      fu("Why are XGBoost and LightGBM faster than vanilla Gradient Boosting?"),
      fu("What is stacking and how does it differ from bagging and boosting?"),
      fu("How do ensemble methods reduce variance and/or bias?"),
    ],
    evaluationPoints: [
      "Bagging trains models on bootstrap samples and averages predictions",
      "Boosting trains models sequentially, each correcting the previous",
      "Random Forest adds feature randomness to further decorrelate trees",
      "Gradient Boosting fits each tree to the residuals of the ensemble",
      "XGBoost uses second-order gradients and tree-level regularization for speed and accuracy",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Hyperparameter Tuning",
    difficulty: 5,
    mainQuestion: mq(
      "What strategies exist for hyperparameter optimization? Compare grid search, random search, and Bayesian optimization."
    ),
    followups: [
      fu("Why does random search often outperform grid search with the same budget?"),
      fu("How does Bayesian optimization use a surrogate model to guide search?"),
      fu("What is Hyperband and how does it improve hyperparameter search efficiency?"),
      fu("What is the difference between hyperparameters and model parameters?"),
      fu("How do you avoid overfitting to the validation set during hyperparameter tuning?"),
    ],
    evaluationPoints: [
      "Grid search exhaustively evaluates a predefined grid",
      "Random search samples hyperparameters stochastically, often finding better values faster",
      "Bayesian optimization builds a surrogate (e.g., Gaussian process) of the objective",
      "Hyperband eliminates poor configurations early using early stopping",
      "Nested cross-validation prevents leaking validation performance into tuning",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Neural Network Fundamentals",
    difficulty: 4,
    mainQuestion: mq(
      "Explain how a feedforward neural network computes predictions via forward pass. How are weights updated via backpropagation?"
    ),
    followups: [
      fu("What is the vanishing gradient problem and what activation functions help?"),
      fu("How does batch normalization stabilize training?"),
      fu("What is the universal approximation theorem?"),
      fu("How does weight initialization affect convergence?"),
      fu("What is the role of the activation function in neural networks?"),
    ],
    evaluationPoints: [
      "Forward pass: matrix multiplications followed by non-linear activations",
      "Backpropagation applies chain rule to compute gradients of the loss",
      "Vanishing gradients: sigmoid/tanh saturate; ReLU avoids this",
      "Batch normalization normalizes layer inputs, reducing internal covariate shift",
      "Xavier/He initialization prevents exploding or vanishing gradients at start",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Convolutional Neural Networks",
    difficulty: 4,
    mainQuestion: mq(
      "How do convolutional neural networks (CNNs) learn hierarchical features from images? Explain convolution, pooling, and the role of depth."
    ),
    followups: [
      fu("What is the receptive field of a neuron in a deep CNN?"),
      fu("How does stride and padding affect output feature map size?"),
      fu("What is the purpose of pooling layers?"),
      fu("How do CNNs achieve translation invariance?"),
      fu("What is the advantage of using multiple small filters vs one large filter?"),
    ],
    evaluationPoints: [
      "Convolutions detect local patterns using learned filter weights",
      "Shallow layers detect edges; deeper layers detect complex shapes",
      "Pooling reduces spatial dimensions and introduces translation invariance",
      "Shared weights across spatial locations reduce parameter count",
      "Multiple small filters stack to cover the same receptive field with fewer parameters",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Recurrent Neural Networks and LSTMs",
    difficulty: 5,
    mainQuestion: mq(
      "How do RNNs model sequential data? What problem do LSTMs solve compared to vanilla RNNs?"
    ),
    followups: [
      fu("What is the vanishing gradient problem in RNNs over long sequences?"),
      fu("How do the input, forget, and output gates of an LSTM work?"),
      fu("How does a bidirectional RNN improve sequence modeling?"),
      fu("When would you use a Transformer instead of an LSTM today?"),
      fu("What is teacher forcing in RNN training?"),
    ],
    evaluationPoints: [
      "RNNs maintain a hidden state that evolves with each time step",
      "Vanilla RNNs suffer from vanishing gradients over long sequences",
      "LSTM gates selectively remember or forget information",
      "Bidirectional RNN processes sequence in both directions for richer context",
      "Transformers with self-attention largely replaced LSTMs for NLP tasks",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Attention Mechanism and Transformers",
    difficulty: 5,
    mainQuestion: mq(
      "Explain the self-attention mechanism in Transformers. How does it differ from attention in seq2seq models, and why did it replace RNNs for NLP?"
    ),
    followups: [
      fu("How are query, key, and value matrices derived in self-attention?"),
      fu("What is multi-head attention and what does each head learn?"),
      fu("What is positional encoding and why is it necessary?"),
      fu("How does the Transformer encoder differ from the decoder?"),
      fu("What is the computational complexity of self-attention with respect to sequence length?"),
    ],
    evaluationPoints: [
      "Self-attention computes pairwise interactions between all token positions",
      "Scaled dot-product: (Q·Kᵀ)/√d, then softmax to get attention weights on V",
      "Multi-head attention learns different relationship types in parallel",
      "Positional encoding injects order information since attention is permutation-invariant",
      "Attention complexity is O(n²) in sequence length; efficient attention variants reduce this",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Bias-Variance Trade-off",
    difficulty: 6,
    mainQuestion: mq(
      "Explain the bias-variance decomposition of generalization error. How does it guide model selection and regularization decisions?"
    ),
    followups: [
      fu("How does model complexity affect bias and variance?"),
      fu("Can you simultaneously minimize both bias and variance? Why or why not?"),
      fu("How do ensemble methods like bagging and boosting address bias and variance separately?"),
      fu("What does the double descent phenomenon reveal about the bias-variance trade-off?"),
      fu("How do you empirically measure bias and variance of a model?"),
    ],
    evaluationPoints: [
      "Error = bias² + variance + irreducible noise",
      "High bias: model too simple; high variance: model too complex",
      "Increasing complexity reduces bias but increases variance",
      "Bagging reduces variance; boosting reduces bias",
      "Double descent: error can decrease again with very large models, challenging classical theory",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Data Leakage",
    difficulty: 6,
    mainQuestion: mq(
      "What is data leakage in machine learning? Describe common causes and how to detect and prevent it in a production pipeline."
    ),
    followups: [
      fu("How does preprocessing before train/test split cause leakage?"),
      fu("What is target leakage and give a realistic example?"),
      fu("How do temporal datasets require special care to avoid future leakage?"),
      fu("How can feature engineering introduce leakage?"),
      fu("What red flags in model performance should make you suspect leakage?"),
    ],
    evaluationPoints: [
      "Leakage occurs when information about the target is inadvertently included in features",
      "Preprocessing (scaling, encoding) must be fit only on training data",
      "Target leakage: feature is derived from or correlated with future knowledge of the label",
      "Temporal data must be split by time, not randomly",
      "Suspiciously high validation accuracy is a leakage red flag",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Model Evaluation: ROC and AUC",
    difficulty: 5,
    mainQuestion: mq(
      "What is the ROC curve and AUC score? How are they used to evaluate a binary classifier, and what are their limitations?"
    ),
    followups: [
      fu("How is the ROC curve constructed from varying the classification threshold?"),
      fu("What does AUC = 0.5 mean versus AUC = 1.0?"),
      fu("Why is the Precision-Recall curve preferred over ROC for highly imbalanced datasets?"),
      fu("What is the area under the Precision-Recall curve (AUPRC)?"),
      fu("How do you compare two models using their ROC curves beyond just AUC?"),
    ],
    evaluationPoints: [
      "ROC plots TPR vs FPR at all classification thresholds",
      "AUC measures the probability that the model ranks a positive higher than a negative",
      "AUC = 0.5 is random; 1.0 is perfect",
      "PR curve focuses on positive class performance, better for imbalanced data",
      "DeLong test statistically compares AUC values between two models",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Feature Engineering",
    difficulty: 6,
    mainQuestion: mq(
      "What is feature engineering and why is it often more impactful than algorithm selection? Describe common feature engineering techniques."
    ),
    followups: [
      fu("What is polynomial feature expansion and when is it used?"),
      fu("How do you encode high-cardinality categorical features?"),
      fu("What is target encoding and what are its risks?"),
      fu("How do you create time-based features from a timestamp column?"),
      fu("What is feature interaction and how can it improve linear models?"),
    ],
    evaluationPoints: [
      "Domain-specific features can make a weak model outperform a complex one",
      "Polynomial features capture non-linear relationships in linear models",
      "Target encoding replaces categories with mean target value; risk: leakage",
      "Time features: hour of day, day of week, time since event",
      "Feature interactions (e.g., A × B) model joint effects not captured individually",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Batch Normalization",
    difficulty: 4,
    mainQuestion: mq(
      "How does batch normalization work in neural networks and why does it speed up training? What are its limitations?"
    ),
    followups: [
      fu("How does batch normalization interact with dropout?"),
      fu("Why does batch normalization behave differently at inference time?"),
      fu("What is layer normalization and when is it preferred over batch normalization?"),
      fu("How does batch size affect batch normalization statistics?"),
      fu("Where in a neural network should batch normalization be applied?"),
    ],
    evaluationPoints: [
      "Batch norm normalizes layer inputs to zero mean and unit variance per mini-batch",
      "Reduces internal covariate shift and allows higher learning rates",
      "At inference, uses running statistics from training, not batch statistics",
      "Small batch sizes give noisy estimates; layer norm is independent of batch size",
      "Typically applied before activation functions in each layer",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Transfer Learning",
    difficulty: 5,
    mainQuestion: mq(
      "What is transfer learning and why does it improve performance on tasks with limited data? How is fine-tuning different from feature extraction?"
    ),
    followups: [
      fu("Why do earlier layers of pre-trained networks generalize to new tasks?"),
      fu("What is catastrophic forgetting and how do you mitigate it during fine-tuning?"),
      fu("How does domain shift affect transfer learning performance?"),
      fu("What is the difference between fine-tuning all layers versus just the head?"),
      fu("What is few-shot learning and how does it relate to transfer learning?"),
    ],
    evaluationPoints: [
      "Pre-trained models capture general features reusable across tasks",
      "Feature extraction: freeze pre-trained weights; fine-tuning: update all or some",
      "Catastrophic forgetting: fine-tuning overwrites old knowledge; use lower learning rates",
      "Domain shift: source and target distributions differ, reducing transfer benefit",
      "Few-shot learning generalizes from very few examples using meta-learned features",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Imbalanced Classification",
    difficulty: 5,
    mainQuestion: mq(
      "How do you handle severely imbalanced datasets in a classification problem? Describe sampling techniques, loss modifications, and appropriate evaluation metrics."
    ),
    followups: [
      fu("How does SMOTE generate synthetic minority samples?"),
      fu("What is the difference between SMOTE and ADASYN?"),
      fu("How does class-weighted loss function address imbalance?"),
      fu("Why is accuracy a poor metric for imbalanced problems?"),
      fu("How do threshold-moving techniques improve classification performance?"),
    ],
    evaluationPoints: [
      "Oversampling minority class or undersampling majority class",
      "SMOTE interpolates between existing minority examples",
      "Class-weighted loss penalizes misclassification of minority class more heavily",
      "F1, AUPRC, and MCC are better metrics than accuracy for imbalanced data",
      "Threshold moving adjusts classification cutoff based on class costs",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Clustering Algorithms",
    difficulty: 6,
    mainQuestion: mq(
      "Compare k-means, DBSCAN, and hierarchical clustering. What are the strengths and weaknesses of each?"
    ),
    followups: [
      fu("How does the elbow method help select k in k-means?"),
      fu("What is the silhouette score and how is it used to evaluate clustering quality?"),
      fu("How does DBSCAN define clusters and handle noise points?"),
      fu("What is the linkage criterion in hierarchical clustering?"),
      fu("What cluster shapes can k-means handle versus DBSCAN?"),
    ],
    evaluationPoints: [
      "k-means assumes spherical clusters and requires k upfront",
      "DBSCAN discovers arbitrary shapes and labels outliers as noise",
      "Hierarchical clustering produces a dendrogram and doesn't require k",
      "Elbow method looks for the bend in inertia vs k plot",
      "Silhouette score measures cohesion within clusters and separation between clusters",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "NLP Fundamentals",
    difficulty: 5,
    mainQuestion: mq(
      "Describe the standard NLP pipeline from raw text to model-ready features. What challenges does natural language present to machine learning?"
    ),
    followups: [
      fu("What is tokenization and what challenges arise with subword tokenization?"),
      fu("What is TF-IDF and what information does it capture?"),
      fu("How do word embeddings (Word2Vec, GloVe) represent semantic meaning?"),
      fu("What is the difference between stemming and lemmatization?"),
      fu("How do out-of-vocabulary words affect traditional NLP pipelines?"),
    ],
    evaluationPoints: [
      "Pipeline: tokenize, normalize, encode, represent as features",
      "TF-IDF weights terms by frequency in document vs rarity across corpus",
      "Word2Vec trains embeddings by predicting context words",
      "Lemmatization uses linguistic rules; stemming is a heuristic truncation",
      "BPE/WordPiece tokenization handles OOV words via subword units",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Model Interpretability",
    difficulty: 6,
    mainQuestion: mq(
      "What is model interpretability and why does it matter in production ML systems? Describe SHAP and LIME as explanation techniques."
    ),
    followups: [
      fu("What is the difference between global and local model interpretability?"),
      fu("How does SHAP use game-theoretic Shapley values to explain predictions?"),
      fu("How does LIME approximate a complex model with a local linear model?"),
      fu("What are the limitations of post-hoc explanation methods?"),
      fu("Why might a highly accurate black-box model be unacceptable in some domains?"),
    ],
    evaluationPoints: [
      "Interpretability is crucial for trust, debugging, and regulatory compliance",
      "SHAP assigns each feature a contribution based on Shapley values",
      "LIME perturbs input and fits a local interpretable surrogate model",
      "Post-hoc methods approximate — explanations may not reflect true model logic",
      "Finance, healthcare, and law require explainable decisions by regulation",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "ML Pipelines and MLflow",
    difficulty: 4,
    mainQuestion: mq(
      "What is an ML pipeline and why is it important for reproducibility and production readiness? Describe the key components and how tools like MLflow help."
    ),
    followups: [
      fu("What is experiment tracking and what metadata should be logged?"),
      fu("How does MLflow Model Registry manage model lifecycle?"),
      fu("What is feature store and what problem does it solve in ML pipelines?"),
      fu("How do you ensure that a pipeline trained offline matches production behavior?"),
      fu("What is training-serving skew and how do you detect it?"),
    ],
    evaluationPoints: [
      "Pipeline: data ingestion, preprocessing, training, evaluation, deployment",
      "MLflow tracks parameters, metrics, and artifacts for reproducibility",
      "Model Registry manages versioning and stage transitions (staging → production)",
      "Feature store centralizes feature computation and prevents training-serving skew",
      "Training-serving skew: feature distributions differ between training and inference",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Recommender Systems",
    difficulty: 5,
    mainQuestion: mq(
      "How do collaborative filtering and content-based filtering work in recommender systems? What are the strengths of each and what is the cold-start problem?"
    ),
    followups: [
      fu("How does matrix factorization implement collaborative filtering?"),
      fu("What is the cold-start problem for new users and new items?"),
      fu("How do hybrid recommenders combine collaborative and content-based signals?"),
      fu("What evaluation metrics are used for recommender systems?"),
      fu("How does implicit feedback (clicks, views) differ from explicit ratings?"),
    ],
    evaluationPoints: [
      "Collaborative filtering: users with similar history have similar preferences",
      "Content-based: recommends items similar to those a user liked",
      "Matrix factorization decomposes user-item matrix into latent factors",
      "Cold-start: new users/items lack interaction history for collaborative filtering",
      "Metrics: NDCG, MAP, precision@k, recall@k",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Distributed Training",
    difficulty: 4,
    mainQuestion: mq(
      "How does distributed training scale deep learning to large models and datasets? Compare data parallelism and model parallelism."
    ),
    followups: [
      fu("How does all-reduce synchronize gradients in data-parallel training?"),
      fu("What is gradient accumulation and when is it used?"),
      fu("What is pipeline parallelism and how does it differ from model parallelism?"),
      fu("How do frameworks like Horovod or PyTorch DDP implement distributed training?"),
      fu("What are the communication bottlenecks in distributed training?"),
    ],
    evaluationPoints: [
      "Data parallelism: each worker trains on a data shard and gradients are averaged",
      "Model parallelism: model layers split across devices for very large models",
      "All-reduce aggregates gradients across workers efficiently",
      "Gradient accumulation simulates larger batch sizes without extra memory",
      "Communication bottleneck: gradient synchronization is the dominant overhead",
    ],
  },

  // ─── HARD (15) ────────────────────────────────────────────────────────────
  {
    role: "Machine Learning Engineer",
    topic: "Generative Adversarial Networks",
    difficulty: 8,
    mainQuestion: mq(
      "How do Generative Adversarial Networks (GANs) work? Describe the minimax game between generator and discriminator and the training challenges."
    ),
    followups: [
      fu("What is mode collapse in GANs and how do techniques like Wasserstein GAN address it?"),
      fu("What is the Wasserstein distance and why is it a better training signal than Jensen-Shannon divergence?"),
      fu("How does progressive growing of GANs (ProGAN) improve image quality?"),
      fu("What are the training instabilities of GANs and what techniques stabilize them?"),
      fu("How does a conditional GAN differ from an unconditional GAN?"),
    ],
    evaluationPoints: [
      "Generator tries to fool discriminator; discriminator tries to distinguish real from fake",
      "Nash equilibrium: generator produces data indistinguishable from real",
      "Mode collapse: generator maps many inputs to the same output, losing diversity",
      "Wasserstein GAN uses Earth Mover's distance for stable training",
      "WGAN requires weight clipping or gradient penalty on discriminator",
      "Spectral normalization, two timescale update rule stabilize training",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Variational Autoencoders",
    difficulty: 8,
    mainQuestion: mq(
      "How do Variational Autoencoders (VAEs) differ from standard autoencoders? Explain the ELBO objective, the reparameterization trick, and the latent space properties."
    ),
    followups: [
      fu("What does KL divergence regularize in the VAE objective?"),
      fu("How does the reparameterization trick enable backpropagation through sampling?"),
      fu("What is posterior collapse and how does beta-VAE address it?"),
      fu("How can VAEs be used for anomaly detection?"),
      fu("How do VAEs compare to GANs in terms of sample quality and diversity?"),
    ],
    evaluationPoints: [
      "VAE encoder produces a distribution (mean, variance) not a point",
      "ELBO = reconstruction loss + KL divergence from prior",
      "Reparameterization: z = μ + σ·ε, where ε is sampled from N(0,1)",
      "KL term regularizes latent space to be smooth and continuous",
      "VAEs have smoother latent spaces than GANs but blurrier samples",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Reinforcement Learning Fundamentals",
    difficulty: 9,
    mainQuestion: mq(
      "Explain the Markov Decision Process (MDP) framework for reinforcement learning. How do policy gradient methods differ from value-based methods like Q-learning?"
    ),
    followups: [
      fu("What is the Bellman equation and how is it used in Q-learning?"),
      fu("What is the exploration-exploitation dilemma and how do epsilon-greedy strategies address it?"),
      fu("What is the actor-critic framework and what problem does it solve?"),
      fu("What is temporal difference learning and how does it differ from Monte Carlo methods?"),
      fu("How does Proximal Policy Optimization (PPO) improve training stability over REINFORCE?"),
    ],
    evaluationPoints: [
      "MDP: state, action, reward, transition, discount factor",
      "Value-based: learn Q(s,a), derive greedy policy; policy gradient: directly optimize policy",
      "Bellman equation: Q(s,a) = r + γ·max Q(s',a')",
      "Actor-critic: actor updates policy, critic estimates value to reduce gradient variance",
      "PPO clips policy update ratio to prevent destructive large updates",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Model Deployment and Serving",
    difficulty: 8,
    mainQuestion: mq(
      "Describe the architecture of a production ML model serving system. What are the key components and challenges when serving at low latency and high throughput?"
    ),
    followups: [
      fu("How does model quantization reduce inference latency without major accuracy loss?"),
      fu("What is dynamic batching in model serving and how does it improve throughput?"),
      fu("How do you perform A/B testing between two model versions in production?"),
      fu("What is canary deployment for ML models?"),
      fu("What is the role of a model registry and artifact store in the serving pipeline?"),
    ],
    evaluationPoints: [
      "Serving stack: model registry → serving framework → REST/gRPC API → monitoring",
      "Quantization reduces precision (FP32 → INT8) to speed up inference",
      "Dynamic batching groups concurrent requests to improve GPU utilization",
      "A/B testing routes a percentage of traffic to the new model",
      "Canary deployment gradually increases traffic to a new model version",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Graph Neural Networks",
    difficulty: 8,
    mainQuestion: mq(
      "What are Graph Neural Networks (GNNs) and how do they generalize neural networks to graph-structured data? Explain message passing and aggregation."
    ),
    followups: [
      fu("What is the over-smoothing problem in deep GNNs?"),
      fu("How does Graph Convolutional Network (GCN) differ from GraphSAGE?"),
      fu("What is the expressive power limitation of MPNNs and how do graph transformers address it?"),
      fu("How are GNNs applied in drug discovery or fraud detection?"),
      fu("What is edge prediction and how is it formulated as a GNN task?"),
    ],
    evaluationPoints: [
      "GNNs aggregate neighbor features iteratively via message passing",
      "Each round captures one more hop of neighborhood information",
      "Over-smoothing: deep GNNs make all node representations similar",
      "GCN uses spectral convolution; GraphSAGE samples and aggregates neighbors",
      "GNNs are at most as powerful as the Weisfeiler-Leman graph isomorphism test",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Contrastive Learning and Self-Supervised Representation",
    difficulty: 8,
    mainQuestion: mq(
      "How does contrastive learning enable self-supervised representation learning without labels? Explain SimCLR and the role of data augmentation and temperature scaling."
    ),
    followups: [
      fu("What is the NT-Xent loss used in SimCLR?"),
      fu("How does MoCo (Momentum Contrast) improve contrastive learning efficiency?"),
      fu("What is BYOL and how does it learn without negative pairs?"),
      fu("How does temperature in the softmax affect the learned representations?"),
      fu("How do representations from contrastive learning compare to supervised representations?"),
    ],
    evaluationPoints: [
      "Contrastive learning: representations of augmented views of same image should be close",
      "Negative pairs (different images) are pushed apart in embedding space",
      "NT-Xent loss maximizes agreement between augmented pair views",
      "MoCo uses a momentum-updated encoder and memory bank as negative queue",
      "BYOL eliminates negatives using an asymmetric architecture and exponential moving average",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Causal Inference in ML",
    difficulty: 7,
    mainQuestion: mq(
      "What is causal inference and why does correlation not imply causation in machine learning? Explain potential outcomes, confounders, and the do-calculus framework."
    ),
    followups: [
      fu("What is a confounder and how does it bias observational study estimates?"),
      fu("How does propensity score matching estimate causal effects?"),
      fu("What is the do-calculus and how does it formalize causal queries?"),
      fu("How do randomized controlled trials (RCTs) eliminate confounding?"),
      fu("What is the difference between average treatment effect (ATE) and individual treatment effect (ITE)?"),
    ],
    evaluationPoints: [
      "Correlation reflects association; causation requires intervention",
      "Potential outcomes: Y(1) = outcome if treated, Y(0) = outcome if untreated",
      "Confounder affects both treatment assignment and outcome, biasing estimates",
      "Propensity score balances covariate distributions between treatment groups",
      "Do-calculus uses backdoor and frontdoor criteria to estimate causal effects from observational data",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Federated Learning",
    difficulty: 7,
    mainQuestion: mq(
      "What is federated learning and how does it enable model training without centralizing data? Describe the FedAvg algorithm and its privacy properties."
    ),
    followups: [
      fu("What are the communication challenges in federated learning?"),
      fu("How does differential privacy complement federated learning?"),
      fu("What is client drift and how does it affect convergence?"),
      fu("How does heterogeneous (non-IID) data distribution affect federated model quality?"),
      fu("How do you evaluate a federated model without accessing raw data?"),
    ],
    evaluationPoints: [
      "Federated learning keeps data on device; only model updates are shared",
      "FedAvg: clients train locally, server aggregates weighted model averages",
      "Non-IID data: clients have different distributions, causing model divergence",
      "Differential privacy adds calibrated noise to gradients before sharing",
      "Communication rounds are expensive; gradient compression reduces overhead",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Neural Architecture Search",
    difficulty: 9,
    mainQuestion: mq(
      "What is Neural Architecture Search (NAS) and how does it automate the design of neural network architectures? Compare reinforcement learning-based, evolutionary, and differentiable NAS approaches."
    ),
    followups: [
      fu("What is a search space in NAS and what design choices does it encode?"),
      fu("How does DARTS make architecture search differentiable?"),
      fu("What is weight sharing in NAS and how does it accelerate search?"),
      fu("What computational cost reductions have made NAS practical?"),
      fu("How do NAS-found architectures compare to manually designed ones like ResNet?"),
    ],
    evaluationPoints: [
      "NAS automates hyperparameter architecture choices (layers, operations, connections)",
      "RL-based NAS: controller generates architectures, receives validation accuracy as reward",
      "Evolutionary NAS: mutates and selects architectures based on fitness",
      "DARTS relaxes discrete choices to continuous mixing weights, enables gradient-based optimization",
      "One-shot NAS / weight sharing trains a supernet once for all architectures",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Probabilistic Graphical Models",
    difficulty: 9,
    mainQuestion: mq(
      "What are probabilistic graphical models? Compare Bayesian Networks and Markov Random Fields. How is inference performed?"
    ),
    followups: [
      fu("What is the difference between directed and undirected graphical models?"),
      fu("How does belief propagation perform inference in a graph?"),
      fu("What is the junction tree algorithm and when is exact inference tractable?"),
      fu("How are PGMs applied to structured prediction tasks?"),
      fu("What is a Hidden Markov Model and how does the Viterbi algorithm decode it?"),
    ],
    evaluationPoints: [
      "PGMs encode conditional independence structure via graphs",
      "Bayesian Networks: directed acyclic graph, factored joint distribution",
      "MRFs: undirected graphs, clique potentials define joint distribution",
      "Exact inference is NP-hard in general; approximate methods: MCMC, variational inference",
      "HMM: latent states transition over time; Viterbi finds the most probable state sequence",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Differentially Private Machine Learning",
    difficulty: 9,
    mainQuestion: mq(
      "What is differential privacy (DP) in the context of machine learning? How is the (ε, δ)-DP guarantee defined, and how does DP-SGD achieve it during training?"
    ),
    followups: [
      fu("What is gradient clipping in DP-SGD and why is it necessary?"),
      fu("How does the privacy budget (ε) compose over multiple training steps?"),
      fu("What is the moments accountant technique for tight DP budget accounting?"),
      fu("What is the privacy-utility trade-off and how does noise scale affect model accuracy?"),
      fu("How does the number of training examples affect the achievable DP guarantee?"),
    ],
    evaluationPoints: [
      "(ε, δ)-DP: outputs of algorithm on adjacent datasets are ε-indistinguishable with probability 1-δ",
      "DP-SGD clips per-sample gradients and adds calibrated Gaussian noise",
      "Privacy budget degrades with more training steps; moments accountant enables tight composition",
      "More noise → stronger privacy but lower model accuracy",
      "Larger datasets dilute the per-example noise signal, improving utility under same ε",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Large Language Model Fine-tuning",
    difficulty: 8,
    mainQuestion: mq(
      "What approaches exist for fine-tuning large language models efficiently? Compare full fine-tuning, LoRA, and prompt tuning in terms of cost and performance."
    ),
    followups: [
      fu("How does LoRA (Low-Rank Adaptation) reduce trainable parameters?"),
      fu("What is QLoRA and how does 4-bit quantization reduce memory during fine-tuning?"),
      fu("How does instruction tuning differ from standard supervised fine-tuning?"),
      fu("What is catastrophic forgetting and how does it affect LLM fine-tuning?"),
      fu("How do you evaluate fine-tuned LLMs beyond perplexity?"),
    ],
    evaluationPoints: [
      "Full fine-tuning updates all parameters; LoRA adds low-rank weight updates only",
      "LoRA: ΔW = A·B, where A and B are low-rank matrices — only A and B are trained",
      "QLoRA quantizes base model to 4-bit, reducing memory by ~4x",
      "Instruction tuning: (instruction, input, output) triples teach following directions",
      "Evaluation: task-specific benchmarks, human eval, RLHF reward model scores",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Online Learning and Concept Drift",
    difficulty: 9,
    mainQuestion: mq(
      "What is concept drift in production ML systems and how do online learning systems adapt to it? Describe detection and mitigation strategies."
    ),
    followups: [
      fu("What is the difference between covariate shift and concept drift?"),
      fu("How do sliding window and ADWIN algorithms detect drift?"),
      fu("What is catastrophic forgetting in online learning?"),
      fu("How do you implement a model retraining trigger in a production pipeline?"),
      fu("How do you distinguish between model degradation due to drift versus data quality issues?"),
    ],
    evaluationPoints: [
      "Concept drift: the statistical relationship between features and target changes over time",
      "Covariate shift: input distribution changes; concept drift: conditional target distribution changes",
      "ADWIN uses adaptive windowing to detect distribution change in a data stream",
      "Retraining triggers: performance threshold, scheduled, drift detection alert",
      "Shadow models and feature distribution monitoring help diagnose drift",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Mixture of Experts",
    difficulty: 8,
    mainQuestion: mq(
      "What is the Mixture of Experts (MoE) architecture and how does it enable scaling language models with sparse activation? Explain the routing mechanism."
    ),
    followups: [
      fu("What is the load balancing loss in MoE and why is it needed?"),
      fu("How does token-choice routing differ from expert-choice routing?"),
      fu("What is expert collapse and how is it avoided?"),
      fu("How does sparse MoE reduce FLOPs compared to dense models of equivalent capacity?"),
      fu("What are the memory and communication challenges of MoE at inference time?"),
    ],
    evaluationPoints: [
      "MoE routes each token to a subset of expert FFN layers, activating only a fraction of parameters",
      "Gating network computes soft or hard router decisions",
      "Load balancing loss penalizes uneven token distribution across experts",
      "Expert collapse: all tokens routed to same few experts, wasteful",
      "Sparse activation: model capacity grows without proportional FLOPs increase",
    ],
  },
  {
    role: "Machine Learning Engineer",
    topic: "Uncertainty Quantification",
    difficulty: 10,
    mainQuestion: mq(
      "Why is uncertainty quantification important in production ML systems? Compare Bayesian deep learning, Monte Carlo Dropout, and conformal prediction as uncertainty estimation methods."
    ),
    followups: [
      fu("What is the difference between aleatoric and epistemic uncertainty?"),
      fu("How does MC Dropout approximate Bayesian inference?"),
      fu("What are the calibration concepts behind conformal prediction?"),
      fu("How do you evaluate whether a model's uncertainty estimates are well-calibrated?"),
      fu("In what domains is uncertainty quantification especially safety-critical?"),
    ],
    evaluationPoints: [
      "Epistemic: model uncertainty (reducible with more data); aleatoric: irreducible data noise",
      "MC Dropout: dropout at inference time approximates Bayesian model averaging",
      "Conformal prediction provides distribution-free coverage guarantees",
      "Calibration: expected confidence should match observed accuracy (ECE metric)",
      "Safety-critical domains: medical diagnosis, autonomous driving, financial risk",
    ],
  },
];

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------
async function seedDatabase() {
  let connection;
  try {
    console.log(`\nConnecting to MongoDB at ${MONGO_URI}...`);
    connection = await mongoose.connect(MONGO_URI);
    console.log("Connected.\n");

    const allQuestions = [...backendQuestions, ...mlQuestions];

    // Validate counts
    const beTotal = backendQuestions.length;
    const mlTotal = mlQuestions.length;
    const beEasy = backendQuestions.filter((q) => q.difficulty === "easy").length;
    const beMed = backendQuestions.filter((q) => q.difficulty === "medium").length;
    const beHard = backendQuestions.filter((q) => q.difficulty === "hard").length;
    const mlEasy = mlQuestions.filter((q) => q.difficulty === "easy").length;
    const mlMed = mlQuestions.filter((q) => q.difficulty === "medium").length;
    const mlHard = mlQuestions.filter((q) => q.difficulty === "hard").length;

    console.log("── Dataset Summary ──────────────────────────────");
    console.log(`Backend Engineer  : ${beTotal} topics  (${beEasy} easy · ${beMed} medium · ${beHard} hard)`);
    console.log(`ML Engineer       : ${mlTotal} topics  (${mlEasy} easy · ${mlMed} medium · ${mlHard} hard)`);
    console.log(`Total             : ${allQuestions.length} topics`);
    console.log("─────────────────────────────────────────────────\n");

    // Clear existing documents
    const deleted = await Question.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing question(s).\n`);

    // Validate follow-up counts
    for (const q of allQuestions) {
      if (q.followups.length !== 5) {
        throw new Error(
          `Topic "${q.topic}" has ${q.followups.length} follow-ups (expected 5).`
        );
      }
      if (q.evaluationPoints.length < 4 || q.evaluationPoints.length > 6) {
        throw new Error(
          `Topic "${q.topic}" has ${q.evaluationPoints.length} evaluation points (expected 4–6).`
        );
      }
    }

    const inserted = await Question.insertMany(allQuestions, {
      ordered: true,
    });

    console.log(`✅  Successfully inserted ${inserted.length} questions.\n`);

    // Print a sample document
    console.log("── Sample Document ──────────────────────────────");
    const sample = inserted[0].toObject();
    console.log(JSON.stringify(sample, null, 2));
    console.log("─────────────────────────────────────────────────\n");
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }
  }
}

seedDatabase();
