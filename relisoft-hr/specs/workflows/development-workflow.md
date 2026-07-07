# Development Workflow Specification

## Overview

This document defines the complete Spec-Driven Development (SDD) workflow for ReliSoft HR. Every feature, enhancement, or bug fix follows this workflow from ideation through production deployment.

**Core Principle**: The specification is the single source of truth. Code is generated from and validated against specs.

---

## Workflow Stages

```
FEATURE REQUEST
      │
      ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1: SPEC GENERATION                                            │
│  ─────────────────────────                                            │
│  1.1 Feature Request Submission                                      │
│  1.2 AI Spec Engine generates draft spec                             │
│  1.3 Human refines spec                                              │
│  1.4 Spec completeness check                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2: SPEC REVIEW & APPROVAL                                     │
│  ────────────────────────────────────                                 │
│  2.1 Spec review by peers                                            │
│  2.2 Stakeholder sign-off                                            │
│  2.3 Architecture review (if applicable)                             │
│  2.4 SPEC APPROVED → spec tagged with version                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 3: API CONTRACT DEFINITION                                    │
│  ────────────────────────────────────                                 │
│  3.1 OpenAPI spec written/updated from spec                          │
│  3.2 Request/response schemas defined                                │
│  3.3 Mock server generated                                           │
│  3.4 API contract reviewed                                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 4: AI CODE GENERATION                                         │
│  ────────────────────────────                                         │
│  4.1 AI generates: Model → Service → Controller → Routes             │
│  4.2 AI generates UI components                                      │
│  4.3 AI generates unit/integration tests                             │
│  4.4 AI generates module documentation                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 5: HUMAN CODE REVIEW                                          │
│  ─────────────────────────                                             │
│  5.1 AI Code Review Agent pre-review                                  │
│  5.2 Human code review                                                │
│  5.3 Spec compliance verification                                     │
│  5.4 Security review                                                  │
│  5.5 Approve / Request Changes / Reject                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 6: MERGE & INTEGRATION TEST                                   │
│  ────────────────────────────────────                                 │
│  6.1 Merge to development branch                                     │
│  6.2 Integration tests run                                           │
│  6.3 Spec updated if changes made during implementation               │
│  6.4 Tag spec version to code commit                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 7: QA & STAGING DEPLOYMENT                                    │
│  ────────────────────────────────────                                 │
│  7.1 Deploy to staging environment                                   │
│  7.2 QA team verifies against spec                                   │
│  7.3 Performance benchmarks                                          │
│  7.4 UAT with stakeholders                                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 8: PRODUCTION DEPLOYMENT                                      │
│  ─────────────────────────────                                         │
│  8.1 Change request / release notes                                  │
│  8.2 Approval gates (Engineering + Product)                          │
│  8.3 Canary deployment (10% → 50% → 100%)                            │
│  8.4 Monitoring period (30 minutes post-deploy)                      │
│  8.5 Rollback on alert threshold breach                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Stage 1: Spec Generation

### 1.1 Feature Request

Feature requests can come from:
- Product team (Jira epic/story)
- Customer feedback (CRM ticket)
- Bug report (GitHub issue)
- Compliance/legal requirement
- Internal improvement (tech debt, performance)

**Required Information**:
```yaml
request:
  title: "Employee Self-Service Profile Editing"
  description: "Employees should be able to update their personal information..."
  requester: "Product Team"
  priority: "High"          # Critical, High, Medium, Low
  module: "employee-management"
  related_specs: []
  acceptance_criteria:
    - "Employee can edit phone, address, emergency contacts"
    - "Changes require HR verification before taking effect"
    - "Audit log maintained for all changes"
```

### 1.2 AI Spec Draft Generation

The Spec Agent generates an initial draft using the feature description and related specs as context.

**Command**:
```
ai spec-generate --feature "ESS Profile Editing" --module employee-management
```

**Generated Draft** includes:
- Overview and scope
- Feature list
- Data model changes (if any)
- API endpoint contracts (initial draft)
- UI component descriptions
- Business rules
- AI integration points
- Permissions matrix

### 1.3 Human Refinement

Developer/Architect refines the AI-generated draft:
- Clarifies ambiguous requirements
- Adds missing edge cases
- Aligns with existing system conventions
- Adds technical implementation notes
- Removes hallucinated features

### 1.4 Completeness Checklist

Before proceeding to review, the spec must pass this checklist:

- [ ] Overview clearly defines scope and boundaries
- [ ] All features have descriptions and priority
- [ ] Data model changes documented (if applicable)
- [ ] API endpoints listed with request/response structure
- [ ] Business rules explicitly stated
- [ ] UI components described with behavior
- [ ] AI integration points identified (or explicitly N/A)
- [ ] Permission matrix defined
- [ ] Edge cases and error scenarios documented
- [ ] Dependencies on other modules identified
- [ ] Performance implications noted

---

## Stage 2: Spec Review & Approval

### 2.1 Reviewers

| Spec Type | Primary Reviewer | Secondary Reviewer | Required Sign-off |
|-----------|----------------|-------------------|-------------------|
| New Module | Tech Lead + Product Owner | Architect | Product + Engineering |
| Feature Addition | Senior Developer | Product Owner | Product + Engineering |
| API Change | API Architect | Tech Lead | Engineering |
| UI Change | Frontend Lead | UX Designer | Design + Engineering |
| Data Model Change | Data Architect | Tech Lead | Engineering + Data |
| Bug Fix | Peer Developer | Tech Lead | Engineering |
| Compliance | Legal/Compliance | Security Lead | Legal + Security |

### 2.2 Review Checklist

- [ ] Spec follows the standard template
- [ ] All acceptance criteria testable
- [ ] Data model changes backward compatible (or migration plan exists)
- [ ] API changes backward compatible (or deprecation strategy documented)
- [ ] Business rules complete and unambiguous
- [ ] Error handling defined
- [ ] Performance impact assessed
- [ ] Security implications reviewed
- [ ] No conflicting changes with other in-progress specs
- [ ] Spec version matches the release version

### 2.3 Approval Gates

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Product  │────▶│ Architect│────▶│ Security │────▶│ Legal    │
│ Owner    │     │          │     │ Lead     │     │ (if req) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
       │              │                │                │
       └──────────────┴────────────────┴────────────────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │  SPEC APPROVED   │
                     │  Tag: v1.2.3     │
                     └──────────────────┘
```

### 2.4 Spec Statuses

| Status | Description |
|--------|-------------|
| Draft | Being written, not yet ready for review |
| In Review | Review in progress |
| Changes Requested | Review feedback needs to be addressed |
| Approved | Spec approved, ready for implementation |
| In Implementation | Code generation in progress |
| Implemented | Code completed, spec updated if needed |
| Deprecated | Spec replaced by newer version |

---

## Stage 3: API Contract Definition

### 3.1 OpenAPI Specification

The API contract is defined in `specs/api/openapi.yaml`. Every endpoint added or modified here must match the spec.

**Process**:
1. Update `openapi.yaml` with new/modified endpoints
2. Define request schemas using `$ref` to components
3. Define response schemas
4. Add security requirements
5. Generate mock server for frontend

### 3.2 Mock Server

```
npx prism mock specs/api/openapi.yaml --port 4010
```

Frontend development proceeds against the mock server while backend is being built.

### 3.3 API Contract Validation

- `spectral lint specs/api/openapi.yaml` — API style guide compliance
- `openapi-diff` — Compare with previous version for breaking changes
- Schema validation — auto-generated TypeScript types match models

---

## Stage 4: AI Code Generation

### 4.1 Generation Commands

```bash
# Generate backend
ai code-generate --spec specs/modules/employee-management.md --target backend
# Generates: models, controllers, services, routes, validation, middleware

# Generate frontend
ai code-generate --spec specs/modules/employee-management.md --target frontend
# Generates: pages, components, hooks, store slice, API client

# Generate tests
ai code-generate --spec specs/modules/employee-management.md --target tests
# Generates: unit tests, integration tests, mocks
```

### 4.2 Generated Output Structure

```
modules/employee-management/
├── server/
│   ├── models/Employee.ts          # Mongoose schema
│   ├── controllers/employeeController.ts
│   ├── services/employeeService.ts
│   ├── routes/employeeRoutes.ts
│   ├── validation/employeeValidation.ts
│   └── middleware/employeeMiddleware.ts
├── client/
│   ├── components/
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeCard.tsx
│   │   └── EmployeeForm.tsx
│   ├── pages/
│   │   ├── EmployeeListPage.tsx
│   │   └── EmployeeProfilePage.tsx
│   ├── hooks/useEmployees.ts
│   ├── store/employeeSlice.ts
│   └── api/employeeApi.ts
├── tests/
│   ├── unit/
│   │   ├── employeeService.test.ts
│   │   └── employeeController.test.ts
│   └── integration/
│       └── employeeApi.test.ts
├── ai/
│   └── integration.ts               # AI service hooks
└── index.ts                         # Module bootstrap
```

### 4.3 Code Quality Gates (AI Pre-review)

Before human review, the AI Code Review Agent checks:

- **Spec Compliance**: All spec endpoints implemented, data model matches
- **Style Guide**: Linting, naming conventions, imports order
- **TypeScript**: Strict type checking passes
- **Test Coverage**: >80% coverage for new code
- **Security**: No hardcoded secrets, SQL injection vectors, XSS vulnerabilities
- **Best Practices**: Error handling, logging, async/await usage

---

## Stage 5: Human Code Review

### 5.1 Review Process

```
┌──────────────┐
│  AI Pre-     │
│  Review Pass │──── AI feedback attached to PR
└──────────────┘
       │
       ▼
┌──────────────┐
│  Peer Review │──── PR assigned to reviewer
└──────────────┘
       │
       ▼
┌──────────────┐
│  Author      │──── Address review comments
│  Updates     │
└──────────────┘
       │
       ▼
┌──────────────┐
│  Final       │──── Approve / Request Changes
│  Review      │
└──────────────┘
```

### 5.2 Human Review Checklist

**Functionality**:
- [ ] All spec features implemented correctly
- [ ] All API endpoints match contract
- [ ] Business rules correctly applied
- [ ] Edge cases handled (null, empty, invalid input)
- [ ] Error responses meaningful and consistent

**Code Quality**:
- [ ] Follows existing code patterns and conventions
- [ ] No unnecessary complexity or duplication
- [ ] Proper separation of concerns (controller/service/model)
- [ ] Meaningful variable/function names
- [ ] Comments explain WHY not WHAT (where needed)

**Testing**:
- [ ] Unit tests cover business logic
- [ ] Integration tests cover API endpoints
- [ ] Edge cases and error scenarios tested
- [ ] Tests are meaningful (not just coverage)

**Security**:
- [ ] Authentication enforced on protected endpoints
- [ ] Authorization checks per permission spec
- [ ] Input validation on all user inputs
- [ ] No sensitive data in logs or error messages
- [ ] Rate limiting considered for public endpoints

**Performance**:
- [ ] Database queries optimized (indexes, projections)
- [ ] N+1 query problem avoided
- [ ] Pagination for list endpoints
- [ ] File uploads size-limited and compressed

### 5.3 Review Outcomes

| Outcome | Action |
|---------|--------|
| Approved | Merge to development branch |
| Changes Requested | Author addresses feedback, re-requests review |
| Reject with Reason | Spec or approach fundamentally flawed; return to Stage 1/2 |

### 5.4 PR Template

```markdown
## Description
[Brief description of changes]

## Related Spec
- Spec: `specs/modules/employee-management.md` v1.2.3

## Changes
- [List of changes made]

## AI Generated Code
- [ ] Code was AI-generated (marked with header comment)
- [ ] Code was human-written
- [ ] Code was modified from AI generation

## Test Coverage
- Unit tests: [N] tests, [X]% coverage
- Integration tests: [N] tests
- E2E tests: [N] tests (if applicable)

## Breaking Changes
- [ ] No breaking changes
- [ ] Breaking changes (describe migration path)

## Deployment Notes
- [ ] Database migrations required
- [ ] Environment variables added
- [ ] Third-party API changes

## Screenshots
[If UI changes]

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed code
- [ ] Tests pass locally
- [ ] Documentation updated (if applicable)
- [ ] Security implications reviewed
```

---

## Stage 6: Merge & Integration

### 6.1 Branch Strategy

```
main (production)
  └── staging (pre-production)
       └── develop (integration)
            ├── feature/emp-mgmt-ess (feature branches)
            ├── bugfix/leave-calculation (bugfix branches)
            └── spec/v1.2.3 (spec version tags)
```

### 6.2 Merge Requirements

- PR approved by minimum 1 reviewer
- All CI checks pass (lint, typecheck, test, build)
- No merge conflicts
- Spec tag matches code version
- AI review passed (warnings acknowledged)

### 6.3 Spec Version Tagging

Every merge to develop must tag the relevant spec version:
```
git tag spec/employee-management/v1.2.3 <commit-hash>
```

This enables traceability from code back to spec.

---

## Stage 7: QA & Staging

### 7.1 QA Verification

QA team verifies against the approved spec:

- [ ] All features in spec work as described
- [ ] Business rules produce correct outcomes
- [ ] Error handling works for invalid inputs
- [ ] Edge cases handled correctly
- [ ] UI matches spec descriptions
- [ ] Permissions enforced correctly
- [ ] Performance within acceptable thresholds
- [ ] Mobile responsiveness (if applicable)

### 7.2 Performance Benchmarks

| Metric | Threshold | Action if exceeded |
|--------|-----------|-------------------|
| API response time (p95) | <500ms | Optimize query/cache |
| Page load time | <3s | Code split/lazy load |
| Database query time | <100ms | Add index/optimize |
| Memory per request | <50MB | Profile memory usage |
| Concurrent users | 1000 | Load test required |

### 7.3 UAT Sign-off

Stakeholders (Product Owner, business users) verify functionality in staging environment and provide sign-off.

---

## Stage 8: Production Deployment

### 8.1 Deployment Gate Checklist

- [ ] Spec approved and implemented
- [ ] All tests passing
- [ ] QA verified against spec
- [ ] UAT signed off
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Release notes prepared
- [ ] Change management approved (if applicable)

### 8.2 Canary Deployment

```
Phase 1: 10% of users for 15 minutes ──> Monitor errors, latency
Phase 2: 50% of users for 30 minutes ──> Monitor all metrics
Phase 3: 100% of users ──> Full rollout
```

### 8.3 Rollback Criteria

Auto-rollback if any of these thresholds are breached:
- Error rate increase > 1% (compared to previous 1 hour)
- p99 response time > 2s
- 5xx error rate > 0.5%
- CPU/memory usage > 85%

### 8.4 Post-Deploy Monitoring

| Duration | Focus Areas |
|----------|-------------|
| First 30 min | Error rates, latency, crash reports |
| First 2 hours | Feature usage, error logs |
| First 24 hours | Business metrics, user feedback |
| First week | Long-term stability, performance trends |

---

## Spec Update Lifecycle

Specs are living documents that evolve alongside the code:

```
SPEC CREATED (v1.0.0)
      │
      ▼
SPEC APPROVED (v1.0.0)
      │
      ▼
CODE IMPLEMENTED
      │
      ├──> Implementation reveals new requirements
      │         │
      │         ▼
      │    SPEC UPDATED (v1.1.0)
      │         │
      │         ▼
      │    CODE UPDATED
      │
      ├──> Bug found in production
      │         │
      │         ▼
      │    SPEC UPDATED with fix (v1.1.1)
      │
      └──> New feature request
                │
                ▼
           NEW SPEC CYCLE (v2.0.0)
```

---

## Tool Integrations

| Tool | Purpose | Integration |
|------|---------|-------------|
| Jira | Feature tracking | Spec linked to Jira issue via `spec-{id}` |
| GitHub | Code repository | PRs linked to spec version tags |
| GitHub Actions | CI/CD | Automated build, test, deploy |
| Prism | Mock server | Auto-generated from OpenAPI spec |
| Spectral | API linting | OpenAPI style guide enforcement |
| SonarQube | Code quality | Static analysis on all merged code |
| Prometheus | Monitoring | Metrics collected during canary deploy |
| Grafana | Dashboards | Real-time deployment monitoring |
| PagerDuty | Alerts | Auto-rollback alerts to on-call engineer |

---

## Governance & Compliance

### Spec Change Management

- **Minor changes** (typos, clarifications, non-functional): Can be updated without re-review
- **Major changes** (scope change, data model change, breaking API): Requires full re-review
- **Emergency fix** (production bug): Spec updated post-fix with "emergency" flag

### Audit Trail

Every spec has a change history:
```yaml
version: 1.2.3
changelog:
  - version: "1.2.3"
    date: "2024-06-15"
    author: "John Doe"
    changes: "Added emergency contact limit validation rule"
    reason: "Implementation revealed edge case during review"
    review_required: false
  - version: "1.2.0"
    date: "2024-06-01"
    author: "Jane Smith"
    changes: "Added bulk import feature"
    reason: "Feature request HR-2024-042"
    review_required: true
    reviewers: ["Tech Lead", "Product Owner", "Security"]
```

### Metrics & KPIs

| Metric | Target | How Measured |
|--------|--------|-------------|
| Spec-to-merge cycle time | <5 days | Jira → GitHub timing |
| AI code acceptance rate | >70% | % of AI-gen code accepted without changes |
| Defect escape rate | <5% | Bugs found in staging vs production |
| Spec completeness score | >90% | Automated spec quality checks |
| Review turnaround time | <24 hours | PR open to first review time |
| Deployment frequency | Bi-weekly | Releases per quarter |
| Rollback rate | <2% | Rollbacks per deployment |
