# ReliSoft HR - Architecture Specification

## System Overview

ReliSoft HR is a comprehensive Human Resource Management System designed for mid-to-large enterprises. It is built on the MERN stack (MongoDB, Express, React, Node.js) following a Spec-Driven Development (SDD) methodology with AI augmentation across the entire lifecycle.

The system covers the complete employee lifecycle — from recruitment and onboarding through performance management, payroll, and separation — while also providing compliance, analytics, and automation capabilities.

---

## Architecture Principles

### 1. Spec-First Development
Every feature begins with a formal specification document. The spec defines the data model, API contracts, UI behavior, business rules, AI integration points, and permissions. Code is either generated or validated against these specs. No implementation is considered complete without a corresponding spec.

### 2. AI-Augmented Development
AI agents assist throughout the SDLC:
- **Spec Engine**: Generates initial spec drafts from feature requests
- **Code Generator**: Produces implementation code from approved specs
- **Code Reviewer**: Validates code against spec requirements
- **Test Generator**: Creates test cases from spec scenarios
- **Documentation Generator**: Keeps docs in sync with specs

### 3. Human-in-the-Loop
All AI-generated artifacts require human review before acceptance. The system enforces approval gates:
- Spec Review (Product/Architecture)
- Code Review (Engineering)
- QA Review (Testing)
- Security Review (Compliance)

### 4. Modular by Design
Each HR domain module is independently spec'd, built, tested, and deployable. Modules communicate through well-defined API contracts and event bus integration. This enables:
- Independent team ownership
- Parallel development
- Isolated deployments
- Reusable cross-module services

### 5. API-First Contract Design
RESTful API contracts are defined in OpenAPI 3.0 specification **before** any implementation begins. The API spec serves as the single source of truth for:
- Frontend-backend integration
- Third-party integrations
- Automated test generation
- API documentation

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | React 18 | UI component library |
| Build Tool | Vite | Fast development & bundling |
| Styling | Tailwind CSS | Utility-first styling |
| State Management | Redux Toolkit | Global state management |
| Backend Runtime | Node.js 20 | Server-side JavaScript |
| API Framework | Express 4 | REST API routing |
| Database | MongoDB 7 | Document store |
| ODM | Mongoose 8 | Schema validation & modeling |
| Authentication | JWT + bcrypt | Token-based auth |
| Authorization | RBAC (Casl/Ability) | Role-based access control |
| Real-time | Socket.io | Live notifications & events |
| Task Queue | Bull/BullMQ | Background job processing |
| Caching | Redis | Session & data caching |
| File Storage | S3/MinIO | Document & asset storage |
| Search | Elasticsearch | Full-text search across modules |
| AI Provider | OpenAI API / Local LLM | AI features |
| Container | Docker + Docker Compose | Development & deployment |
| CI/CD | GitHub Actions | Automated pipelines |
| Monitoring | Prometheus + Grafana | System metrics |

---

## Module Architecture

### Module Structure
Every module follows a consistent internal structure:

```
modules/
  {module-name}/
    spec/               # Formal specification
    api/                # OpenAPI contract
    server/
      model.ts          # Mongoose schema
      controller.ts     # Request handlers
      service.ts        # Business logic
      routes.ts         # Express routes
      validation.ts     # Request validation
      middleware.ts     # Module-specific middleware
      events.ts         # Domain events
      scheduler.ts     # Cron jobs (if applicable)
    client/
      components/       # React components
      pages/           # Route pages
      hooks/           # Custom React hooks
      store/           # Redux slice
      api/             # API client functions
      types/           # TypeScript types
      utils/           # Utility functions
    tests/
      unit/            # Unit tests
      integration/     # Integration tests
      e2e/             # End-to-end tests
    ai/                # AI integration hooks
    index.ts           # Module entry point
```

### Module Dependency Graph

```
recruitment ──> onboarding ──> employee-management <── performance
                                  |       |              |
                                  |       └── training ──┘
                                  |
                    ┌─────────────┼─────────────┐
                    |             |             |
               attendance    leave-mgmt     travel-expense
                    |             |             |
                    └── payroll ──┘             |
                          |                     |
                     compliance             expense
                          |                     |
                     analytics ────────────────┘
                   
asset-management ──> separation ──> fnf ──> compliance
       |                                |
    helpdesk                       document-management

shift-management ──> attendance
holiday-management ──> attendance, leave-mgmt
workflow ──> leave-mgmt, travel-expense, helpdesk, separation
notifications ──> all modules
```

---

## AI Architecture

### AI Agent Framework

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Gateway Service                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ OpenAI   │  │ Claude   │  │ Local    │  │ Fallback │   │
│  │ Adapter  │  │ Adapter  │  │ LLM Adptr│  │ Provider │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Spec Agent  │  │ Code Gen    │  │ Code Review │         │
│  │             │  │ Agent       │  │ Agent       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Test Agent  │  │ Docs Agent  │  │ Insight     │         │
│  │             │  │             │  │ Agent       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Prompt Management System                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Templates│  │ Versions │  │ Variables│  │ A/B Test │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Human Review Queue                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Spec     │  │ Code     │  │ AI       │  │ Audit    │   │
│  │ Reviews  │  │ Reviews  │  │ Responses│  │ Log      │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### AI Services

| Service | Module | Description |
|---------|--------|-------------|
| Chatbot | All | Natural language HR queries, policy lookup, leave application |
| Resume Parser | Recruitment | Extract skills, experience, education from resumes |
| Candidate Matcher | Recruitment | Match candidates to job requirements using embeddings |
| Leave Predictor | Leave | Predict leave patterns, suggest coverage |
| Attrition Predictor | Analytics | Flag at-risk employees using ML models |
| Smart Scheduler | Shift | AI-optimized shift scheduling |
| Document Generator | Documents | AI-generated offer letters, experience letters |
| Compliance Checker | Compliance | Auto-check compliance against labour laws |
| Insight Engine | Analytics | Natural language insights from HR data |
| Performance Insights | Performance | AI analysis of performance trends |

---

## Data Flow Architecture

### Request Flow

```
Browser/Mobile App
       │
       ▼
  CDN / Load Balancer
       │
       ▼
  Nginx Reverse Proxy
       │
       ▼
  Express API Gateway
       │
       ├──> Rate Limiter
       ├──> Auth Middleware (JWT validation)
       ├──> RBAC Middleware (permission check)
       ├──> Request Validator (Joi/Zod)
       ├──> Audit Logger
       │
       ▼
  Module Router
       │
       ▼
  Controller
       │
       ▼
  Service Layer
       │
       ├──> Business Logic
       ├──> AI Service Proxy (if applicable)
       ├──> Event Emitter
       │
       ▼
  Data Access Layer (Mongoose)
       │
       ▼
  MongoDB / Redis
```

### Event Flow

```
Service A
    │
    ├──> Emit Domain Event (via EventBus)
    │
    ▼
EventBus (RabbitMQ / Redis Pub-Sub)
    │
    ├──> Service B (subscribed handler)
    ├──> Notification Service
    ├──> Audit Service
    ├──> Analytics Pipeline
    └──> WebSocket Gateway (real-time push)
```

---

## Security Model

### Role Hierarchy

```
SuperAdmin (System-wide access)
    │
    ▼
Admin (Full HR system access)
    │
    ▼
HR (HR operations access)
    │
    ▼
Manager (Department-level access)
    │
    ▼
Employee (Self-service access)
```

### Permission Model

Permissions are defined at the resource-action level:
- **Resource**: employee, leave, attendance, payroll, recruitment, etc.
- **Action**: create, read, update, delete, approve, reject, export
- **Scope**: all, department, self

### Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT access tokens (15min) + refresh tokens (7d) |
| Password Policy | Min 12 chars, complexity required, 90-day rotation |
| MFA | TOTP (Google Authenticator) or SMS OTP |
| Session Management | Redis-backed, force-logout capability |
| API Security | Rate limiting (100 req/min), CORS, Helmet |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit |
| Audit Logging | All state-changing operations logged |
| IP Whitelisting | Admin endpoints restricted by IP |
| SQL Injection | Prevented via Mongoose parameterized queries |
| XSS Protection | Input sanitization, CSP headers |

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                   Feature Request                        │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              1. Spec Generation (AI + Human)             │
│  AI generates draft spec from feature description        │
│  Human refines and approves                             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              2. Spec Review & Approval                    │
│  Review against schema, completeness checklist           │
│  Product owner, architect, stakeholders sign off         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              3. API Contract Definition                   │
│  OpenAPI 3.0 spec written/updated                       │
│  Mock server generated for frontend development          │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              4. AI Code Generation                        │
│  AI generates: Models, Controllers, Routes, Services    │
│  UI Components, Tests                                   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              5. Human Code Review                         │
│  Review against spec, best practices, security           │
│  Approve / Request Changes / Reject                     │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              6. Automated Testing                         │
│  Unit tests, integration tests, e2e tests               │
│  AI-generated test cases run automatically              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              7. Merge to Main                             │
│  PR approved, squashed merge                            │
│  Tagged with spec version                                │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              8. Deploy to Staging                         │
│  Smoke tests, integration tests                         │
│  Performance benchmarks                                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              9. Deploy to Production                      │
│  Canary deployment, monitoring                           │
│  Rollback on alert                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Production Environment                     │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Frontend  │  │  Frontend  │  │  Frontend  │           │
│  │  Container │  │  Container │  │  Container │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │                    │
│        └───────────────┼───────────────┘                    │
│                        │                                    │
│                 ┌──────┴──────┐                             │
│                 │  Load       │                             │
│                 │  Balancer   │                             │
│                 └──────┬──────┘                             │
│                        │                                    │
│        ┌───────────────┼───────────────┐                    │
│        │               │               │                    │
│  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐           │
│  │  Backend   │  │  Backend   │  │  Backend   │           │
│  │  Container │  │  Container │  │  Container │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
│        │               │               │                    │
│        └───────────────┼───────────────┘                    │
│                        │                                    │
│                 ┌──────┴──────┐                             │
│                 │  Mongo      │                             │
│                 │  Replica    │                             │
│                 │  Set        │                             │
│                 └─────────────┘                             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Redis   │  │  Rabbit  │  │  S3      │  │  ES      │  │
│  │  Cluster │  │  MQ      │  │  MinIO   │  │  Cluster │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Observability

| System | Tool | Metrics |
|--------|------|---------|
| APM | Prometheus + Grafana | Request latency, error rates, throughput |
| Logging | ELK Stack (Elasticsearch, Logstash, Kibana) | Centralized logging |
| Tracing | Jaeger | Distributed request tracing |
| Alerting | AlertManager | PagerDuty integration |
| Uptime | StatusCake / UptimeRobot | External monitoring |
| Error Tracking | Sentry | Client & server error tracking |

---

## Scalability Strategy

- **Horizontal Scaling**: All services are stateless and can scale horizontally
- **Database Scaling**: MongoDB sharding for high-volume collections
- **Caching Layer**: Redis for session data, frequently accessed lookups
- **CDN**: Static assets served via CDN
- **Read Replicas**: MongoDB read replicas for reporting queries
- **Queue Processing**: BullMQ for background jobs (payroll, notifications)
- **Search Indexing**: Elasticsearch for full-text search capabilities

---

## Disaster Recovery

| Scenario | RPO | RTO | Strategy |
|----------|-----|-----|----------|
| Single instance failure | 0 | <1min | Auto-restart via K8s |
| Zone failure | 5min | 10min | Multi-AZ deployment |
| Data corruption | 24h | 4h | Point-in-time recovery |
| Full region failure | 1h | 4h | Active-passive DR region |
| Ransomware | 24h | 8h | Immutable backups |

---

## Versioning Strategy

- **API Versioning**: URL-based (`/api/v1/`, `/api/v2/`)
- **Spec Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Database Migrations**: Mongoose schema versioning with migration scripts
- **Release Cadence**: Bi-weekly releases on alternate Wednesdays
- **Breaking Changes**: Deprecated endpoints maintained for 2 minor versions
