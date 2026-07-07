# Workflow Engine Module Specification

## Overview

The Workflow Engine provides configurable multi-level approval workflows across all HR modules. It supports sequential and parallel approvals, conditional routing, delegation, escalation, and SLA enforcement.

**Scope**: Workflow definition, approval chains, conditional routing, delegation, escalation, workflow dashboard.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Workflow Templates | Pre-defined workflow templates (leave, expense, travel, etc.) | P0 |
| Multi-Level Approval | Configurable approval levels (1 to N) | P0 |
| Sequential/Parallel | Sequential or parallel approval flows | P0 |
| Conditional Routing | Route based on amount, department, grade, location | P0 |
| Delegation | Approver can delegate to another user | P1 |
| Escalation | Auto-escalate if approval pending beyond SLA | P0 |
| Approval Dashboard | Pending/approved/rejected approvals view | P0 |
| Notifications | Email/in-app notification on each approval action | P0 |

---

## Data Model

### Workflow Definition Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Workflow name (e.g., "Leave Approval - Standard") |
| `module` | Enum | Yes | Leave, Expense, Travel, Purchase, Onboarding, Separation, Helpdesk |
| `entityType` | String | Yes | Entity this workflow applies to |
| `isActive` | Boolean | Yes | Active flag |
| `levels` | Array | Yes | Approval levels |
| `levels[].levelNumber` | Number | Yes | Sequence (1, 2, 3...) |
| `levels[].approverType` | Enum | Yes | Manager, HOD, HR, Finance, CEO, Custom |
| `levels[].approverId` | ObjectId (Employee) | No | Fixed approver (for Custom type) |
| `levels[].approverRole` | ObjectId (Role) | No | Role-based approver |
| `levels[].approvalType` | Enum | Yes | AnyOne, All, Majority |
| `levels[].slaHours` | Number | No | SLA in hours |
| `levels[].escalationTo` | ObjectId (Employee) | No | Escalation target |
| `conditions` | Array | No | Conditions for routing |
| `conditions[].field` | String | Yes | Field to evaluate |
| `conditions[].operator` | Enum | Yes | Equals, GreaterThan, LessThan, Contains, Between |
| `conditions[].value` | Mixed | Yes | Value to compare |
| `conditions[].targetLevel` | Number | Yes | Route to level |

### Workflow Instance Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workflowDefinitionId` | ObjectId (WorkflowDef) | Yes | Workflow template |
| `entityType` | String | Yes | Entity type |
| `entityId` | ObjectId | Yes | Entity instance (leave/expense/ticket ID) |
| `initiatorId` | ObjectId (Employee) | Yes | Who initiated |
| `currentLevel` | Number | Yes | Current approval level |
| `totalLevels` | Number | Yes | Total levels configured |
| `approvals` | Array | Yes | Approval records |
| `approvals[].level` | Number | Yes | Level number |
| `approvals[].approverId` | ObjectId (Employee) | Yes | Approver |
| `approvals[].action` | Enum | Yes | Pending, Approved, Rejected, Skipped, Delegated |
| `approvals[].remarks` | String | No | Comments |
| `approvals[].actionedAt` | Date | No | Action timestamp |
| `status` | Enum | Yes | InProgress, Approved, Rejected, Withdrawn |
| `delegatedTo` | ObjectId | No | Delegated approver |
| `escalatedAt` | Date | No | Escalation timestamp |

---

## API Endpoints

### `POST /api/v1/workflows/definitions`
Create workflow definition.

### `GET /api/v1/workflows/definitions?module=Leave`
Get workflows by module.

### `POST /api/v1/workflows/definitions/:id/test`
Test workflow routing with sample data.

### `GET /api/v1/workflows/pending`
Get pending approvals for current user.

### `POST /api/v1/workflows/:instanceId/approve`
Approve at current level.

### `POST /api/v1/workflows/:instanceId/reject`
Reject.

### `POST /api/v1/workflows/:instanceId/delegate`
Delegate approval.

**Request Body**:
```json
{
  "delegateTo": "664a1b2c3d4e5f6a7b8c9d11",
  "reason": "On leave from June 10-15"
}
```

### `GET /api/v1/workflows/dashboard`
Approval statistics and load.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `WorkflowDesigner` | Visual drag-and-drop workflow builder |
| `ApprovalDashboard` | Unified pending approvals across modules |
| `ApprovalDetailPanel` | Entity details with approve/reject actions |
| `DelegationModal` | Set delegation period and target |
| `WorkflowTestConsole` | Simulate workflow routing |
| `EscalationDashboard` | Overdue approvals and escalation status |

---

## Business Rules

1. If any level rejects, entire workflow is rejected; entity status set appropriately
2. Delegation only valid for maximum 30 consecutive days
3. Escalation triggers if approval pending beyond SLA; escalation sends to defined higher authority
4. Workflow history immutable; all actions logged with timestamp and IP
5. Conditional routing evaluated at each level; conditions use entity field values
6. Self-approval not allowed — initiator cannot be approver at any level

---

## Permissions

| Role | Design Workflows | Approve | Delegate | View Reports |
|------|-----------------|---------|----------|--------------|
| SuperAdmin | Full | All | All | All |
| Admin | Full | All | All | All |
| HR | Module-specific | As defined | Self | All |
| Manager | No | As defined | Self | Own |
| Employee | No | No | Self | No |
