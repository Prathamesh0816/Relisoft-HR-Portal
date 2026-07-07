# Notifications Module Specification

## Overview

The Notifications module provides a centralized notification service supporting email, SMS, WhatsApp, and in-app notifications. It handles template management, delivery tracking, and user notification preferences.

**Scope**: Notification channels, templates, delivery, preferences, history, real-time push.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Email Notifications | Transactional and bulk email delivery | P0 |
| SMS Notifications | SMS alerts via gateway | P1 |
| WhatsApp Notifications | WhatsApp business API integration | P1 |
| In-App Notifications | Real-time in-app alerts via Socket.io | P0 |
| Push Notifications | Mobile push notifications (FCM/APNs) | P2 |
| Notification Templates | Configurable templates per channel | P0 |
| User Preferences | Opt-in/opt-out per notification type | P0 |
| Delivery Tracking | Track send status, opens, clicks | P1 |
| Batch Notifications | Send to bulk recipients | P1 |
| Notification History | Searchable notification logs | P0 |

---

## Data Model

### Notification Template Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Template name |
| `code` | String | Yes | Unique code (LEAVE_APPROVED, RESET_PASSWORD, etc.) |
| `type` | Enum | Yes | Email, SMS, WhatsApp, InApp |
| `subject` | String | No | Email subject line |
| `content` | String | Yes | Template body with merge fields |
| `mergeFields` | Array | Yes | Expected merge fields |
| `channel` | Enum | Yes | Transactional, Promotional, Alert |

### Notification Queue Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateCode` | String | Yes | Template code |
| `channel` | Enum | Yes | Email, SMS, WhatsApp, InApp, Push |
| `recipientId` | ObjectId (Employee) | Yes | Target employee |
| `recipientAddress` | String | Yes | Email/phone/device token |
| `mergeData` | Object | Yes | Template merge values |
| `status` | Enum | Yes | Queued, Sent, Delivered, Failed, Opened, Clicked |
| `sentAt` | Date | No | Send timestamp |
| `deliveredAt` | Date | No | Delivery timestamp |
| `failedReason` | String | No | Failure reason |
| `retryCount` | Number | No | Retry attempts |
| `relatedEntityType` | String | No | Related entity |
| `relatedEntityId` | ObjectId | No | Entity reference |

### Notification Preference Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee |
| `preferences` | Map | Yes | Per-notification-type channel opt-in |
| `emailEnabled` | Boolean | Yes | Global email opt-in |
| `smsEnabled` | Boolean | Yes | Global SMS opt-in |
| `whatsappEnabled` | Boolean | Yes | Global WhatsApp opt-in |
| `pushEnabled` | Boolean | Yes | Global push opt-in |

---

## Notification Types

| Code | Description | Default Channels |
|------|-------------|-----------------|
| LEAVE_APPLIED | Leave application submitted | Email, InApp |
| LEAVE_APPROVED | Leave approved | Email, SMS, InApp |
| LEAVE_REJECTED | Leave rejected | Email, InApp |
| LEAVE_CANCELLED | Leave cancelled | Email, InApp |
| ATTENDANCE_MISSING | Missing punch detected | Email, InApp, Push |
| PAYSLIP_AVAILABLE | Payslip generated | Email, InApp |
| PAYSLIP_FAILED | Payslip generation failed | Email, InApp |
| TRAVEL_APPROVED | Travel request approved | Email, InApp |
| EXPENSE_REIMBURSED | Expense reimbursed | Email, SMS, InApp |
| TICKET_ASSIGNED | Helpdesk ticket assigned | Email, InApp |
| TICKET_RESOLVED | Ticket resolved | Email, InApp |
| ONBOARDING_TASK | New onboarding task assigned | Email, SMS |
| SEPARATION_APPROVED | Separation approved | Email, InApp |
| ASSET_RECOVERY | Asset recovery pending | Email, InApp |
| CERTIFICATION_EXPIRY | Certification expiring | Email, InApp |
| HOLIDAY_REMINDER | Upcoming holiday | InApp |
| BIRTHDAY_WISH | Employee birthday | Email, InApp |
| WORK_ANNIVERSARY | Work anniversary | Email, InApp |
| PASSWORD_EXPIRY | Password expiring soon | Email, SMS |
| COMPLIANCE_DUE | Compliance deadline approaching | Email, InApp |

---

## API Endpoints

### `POST /api/v1/notifications/send`
Send notification (system internal).

### `GET /api/v1/notifications/my`
Get my in-app notifications.

### `PUT /api/v1/notifications/my/:id/read`
Mark notification as read.

### `PUT /api/v1/notifications/my/read-all`
Mark all as read.

### `GET /api/v1/notifications/preferences`
Get my notification preferences.

### `PUT /api/v1/notifications/preferences`
Update preferences.

### `POST /api/v1/notifications/templates`
Create template (Admin).

### `GET /api/v1/notifications/logs`
Notification delivery logs (Admin).

---

## UI Components

| Component | Description |
|-----------|-------------|
| `NotificationBell` | Top bar bell icon with unread count |
| `NotificationDropdown` | Recent notifications dropdown |
| `NotificationCenter` | Full notification history page |
| `PreferencePanel` | Per-type channel toggle switches |
| `TemplateEditor` | Rich text template with merge field picker |
| `NotificationDashboard` | Delivery stats, failure rates |

---

## Business Rules

1. Transactional notifications cannot be opted out (password reset, compliance alerts)
2. Notification retry: 3 attempts with exponential backoff (5min, 15min, 1hr)
3. Email notifications sent via dedicated transactional email service
4. Bulk notifications rate-limited to 100/sec
5. In-app notifications stored for 90 days; auto-purged after
6. SMS only for critical alerts (approvals, security, compliance)
7. WhatsApp for non-critical but important notifications (leave approval)
8. Real-time delivery via WebSocket for in-app notifications

---

## Permissions

| Role | Send | Read | Manage Templates | View Logs | Configure |
|------|------|------|-----------------|-----------|-----------|
| SuperAdmin | Yes | All | Yes | Yes | Yes |
| Admin | Yes | All | Yes | Yes | Yes |
| HR | Module-scoped | All | Yes | Yes | Yes |
| Manager | Module-scoped (team) | Own | No | No | No |
| Employee | No | Own | No | No | Own Prefs |
