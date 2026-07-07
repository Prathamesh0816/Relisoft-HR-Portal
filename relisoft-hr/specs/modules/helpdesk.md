# Helpdesk Module Specification

## Overview

The Helpdesk module manages HR, IT, and Admin support tickets. It provides ticketing with priority-based routing, assignment, SLAs, and resolution tracking. It integrates with Onboarding, Separation, and Asset management for automated ticket creation.

**Scope**: Ticket creation, categorization, assignment, SLA tracking, resolution, knowledge base.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Ticket Creation | Submit tickets via portal, email, chatbot | P0 |
| Categories | HR, IT, Admin, Facilities, Payroll categories | P0 |
| Priority & SLA | Priority-based SLA with escalation | P0 |
| Assignment | Auto/manual assignment to support teams | P0 |
| Ticket Status | Open, InProgress, WaitingOnRequestor, Resolved, Closed | P0 |
| Knowledge Base | FAQ and solution articles | P1 |
| Feedback & Rating | Rate ticket resolution | P1 |
| Auto-Ticketing | Auto-create tickets from events (new hire, separation) | P1 |

---

## Data Model

### Ticket Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ticketId` | String | Yes | Auto-generated (TK-XXXXX) |
| `subject` | String | Yes | Ticket subject |
| `description` | String | Yes | Detailed description |
| `category` | Enum | Yes | HR, IT, Admin, Facilities, Payroll, Travel, Others |
| `subCategory` | String | No | Sub-category |
| `priority` | Enum | Yes | Low, Medium, High, Critical |
| `status` | Enum | Yes | Open, InProgress, WaitingOnRequestor, Resolved, Closed, Reopened |
| `requestorId` | ObjectId (Employee) | Yes | Ticket creator |
| `assignedTo` | ObjectId (Employee) | No | Assigned agent |
| `assignedGroup` | Enum | No | HR, IT, Admin, Facilities |
| `relatedEntity` | Object | No | Related entity reference |
| `relatedEntity.type` | Enum | No | Leave, Attendance, Asset, Onboarding, Separation |
| `relatedEntity.id` | ObjectId | No | Entity ID |
| `slaDeadline` | DateTime | No | SLA resolution deadline |
| `slaBreached` | Boolean | No | SLA breach flag |
| `resolution` | String | No | Resolution notes |
| `attachments` | Array | No | File attachments |
| `internalNotes` | Array | No | Internal agent notes |
| `timeSpentMinutes` | Number | No | Total time spent |
| `requestorRating` | Number | No | 1-5 satisfaction rating |
| `requestorFeedback` | String | No | Feedback comments |
| `createdAt` | Date | Auto | Timestamp |
| `resolvedAt` | Date | No | Resolution time |
| `closedAt` | Date | No | Closure time |

---

## API Endpoints

### `POST /api/v1/helpdesk/tickets`
Create ticket.

**Request Body**:
```json
{
  "subject": "Laptop not booting",
  "description": "My laptop is showing blue screen on startup since this morning.",
  "category": "IT",
  "subCategory": "Hardware Issue",
  "priority": "High",
  "attachments": ["https://s3.amazonaws.com/uploads/error.jpeg"]
}
```

### `GET /api/v1/helpdesk/tickets`
List tickets with filters.

### `GET /api/v1/helpdesk/tickets/:id`
Get ticket details with conversation.

### `PUT /api/v1/helpdesk/tickets/:id/assign`
Assign ticket to agent.

### `PUT /api/v1/helpdesk/tickets/:id/status`
Update ticket status.

### `POST /api/v1/helpdesk/tickets/:id/notes`
Add internal note.

### `PUT /api/v1/helpdesk/tickets/:id/resolve`
Resolve ticket with resolution notes.

**Request Body**:
```json
{
  "resolution": "Performed system restore to previous working state. Laptop is operational.",
  "timeSpentMinutes": 45
}
```

### `POST /api/v1/helpdesk/tickets/:id/feedback`
Submit feedback.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `TicketCreateForm` | Category selection, description, file upload |
| `TicketListView` | Filterable/sortable ticket table |
| `TicketDetailView` | Full ticket with conversation thread |
| `AgentAssignmentPanel` | Queue view for support agents |
| `SLAIndicator` | Visual SLA timer and alerts |
| `KnowledgeBaseViewer` | Search and browse solutions |
| `HelpdeskDashboard` | Ticket volume, SLA compliance, agent performance |
| `QuickTicketWidget` | ESS sidebar widget to create quick tickets |

---

## Business Rules

1. SLA: Critical=4hrs, High=8hrs, Medium=24hrs, Low=72hrs
2. Auto-escalation: Escalate to group lead if SLA at 75%; escalate to department head if breached
3. Critical tickets auto-assigned to senior agent; 24/7 critical support
4. Related tickets from same employee grouped; duplicate detection
5. Reopen allowed within 7 days of resolution; older tickets create new ticket
6. Auto-ticket for: new hire IT setup, separation asset return, leave >15 consecutive days
7. Agent cannot close ticket without resolution notes

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Auto-Categorization | Classifier | Auto-detect category from description |
| Smart Assignment | Router | Route to best agent based on skills and load |
| Solution Suggestion | Recommender | Suggest knowledge base articles for similar issues |
| Sentiment Analysis | NLP | Detect requestor urgency and sentiment |
| Auto-Reply | Chatbot | Answer common questions instantly |
| Priority Prediction | Predictor | Suggest priority based on content and user role |

---

## Permissions

| Role | Create | View | Assign | Resolve | Close | Knowledge Base |
|------|--------|------|--------|---------|-------|----------------|
| SuperAdmin | Yes | All | Yes | Yes | Yes | Full |
| Admin | Yes | All | Yes | Yes | Yes | Full |
| IT Admin | Yes | All IT | IT tickets | IT tickets | Yes | Full |
| HR Admin | Yes | All HR | HR tickets | HR tickets | Yes | Full |
| Manager | Yes | Own + Team | No | No | No | Read |
| Employee | Yes | Own | No | No | No | Read |

