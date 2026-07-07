# Integration Module Specification

## Overview

The Integration module manages connections with external systems including ERP, Microsoft 365, banking systems, biometric devices, and other third-party services via standardized adapters.

**Scope**: ERP integration, M365/Google Workspace sync, banking file formats, biometric device integration, API gateway, webhooks.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| ERP Integration | Sync employee master with ERP (SAP, Oracle, Tally) | P1 |
| M365 Sync | Sync user accounts, calendar, Teams with Azure AD | P1 |
| Google Workspace Sync | Sync with Google Workspace directory | P2 |
| Banking Integration | Generate salary file formats (NEFT, ACH, SEPA) | P0 |
| Biometric Integration | Connect with biometric devices (ZKTeco, Mantra, etc.) | P0 |
| API Gateway | Expose REST APIs for third-party consumption | P0 |
| Webhook System | Outbound webhooks for events | P1 |
| Payroll Compliance | Auto-filing with government portals (PF, ESI, TDS) | P1 |
| Background Check API | Integrate with BGV vendors (Authbridge, FirstAdvantage) | P1 |

---

## Data Model

### Integration Configuration Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Integration name |
| `type` | Enum | Yes | ERP, M365, GoogleWorkspace, Banking, Biometric, BGV, GovernmentPortal, Other |
| `provider` | String | Yes | Provider name (SAP, Oracle, ZKTeco, etc.) |
| `config` | Object | Yes | Connection configuration (encrypted) |
| `isActive` | Boolean | Yes | Active flag |
| `lastSyncAt` | Date | No | Last successful sync |
| `syncFrequency` | Enum | Yes | Realtime, Hourly, Daily, Weekly, Manual |
| `errorCount` | Number | No | Consecutive error count |
| `status` | Enum | Yes | Connected, Disconnected, Error, PendingSetup |

### Integration Log Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `integrationId` | ObjectId (IntegrationConfig) | Yes | Integration |
| `direction` | Enum | Yes | Inbound, Outbound |
| `entityType` | String | Yes | Employee, Attendance, Leave, Payroll |
| `status` | Enum | Yes | Success, Partial, Failed |
| `recordsProcessed` | Number | Yes | Records processed |
| `recordsFailed` | Number | No | Records failed |
| `errorMessage` | String | No | Error details |
| `responseData` | Object | No | API response |
| `syncedAt` | Date | Yes | Sync timestamp |

---

## API Endpoints

### `POST /api/v1/integrations`
Configure integration.

### `GET /api/v1/integrations`
List configured integrations.

### `PUT /api/v1/integrations/:id`
Update configuration.

### `POST /api/v1/integrations/:id/sync`
Trigger manual sync.

### `GET /api/v1/integrations/:id/logs`
View sync logs.

### `POST /api/v1/integrations/webhooks`
Register webhook.

**Request Body**:
```json
{
  "name": "Employee Updates Webhook",
  "url": "https://erp.company.com/webhooks/employee-update",
  "events": ["employee.created", "employee.updated", "employee.deactivated"],
  "secret": "whsec_abc123def456",
  "retryPolicy": { "maxRetries": 3, "retryIntervalMinutes": 5 }
}
```

### `GET /api/v1/integrations/biometric/status`
Check biometric device connectivity.

---

## Integration Specifications

### Biometric Integration
- **Protocol**: TCP/IP, USB, RS232
- **Supported Devices**: ZKTeco, Mantra, Suprema, BioStar
- **Data**: Employee ID, timestamp, verification mode
- **Frequency**: Real-time (pull) or batch (every 5 min)
- **Error Handling**: Retry on connection failure; queue missed punches

### Banking Integration
- **Supported Formats**: NEFT (Yes Bank/ICICI/HDFC), ACH (US), SEPA (EU)
- **File Format**: CSV, XML, ISO 20022
- **Data**: Employee name, account number, IFSC, amount, bank code
- **Auto-reconciliation**: Match bank statement with payroll run

### M365 Integration
- **Sync**: Users, groups, calendar events, Teams membership
- **Provisioning**: Auto-create/disable M365 accounts based on employee status
- **Calendar**: Sync leave calendar as "Out of Office" events
- **Graph API**: Microsoft Graph v1.0

---

## Business Rules

1. All integration credentials stored encrypted (AES-256) in database
2. Integration failures auto-alerted to IT via notification
3. Banking files digitally signed before transmission
4. Biometric data cannot be used for any purpose other than attendance
5. Webhook delivery retried 3 times on failure; webhook disabled after 10 consecutive failures
6. M365 sync executes every 15 minutes for user changes
7. Integration logs retained for 90 days

---

## UI Components

| Component | Description |
|-----------|-------------|
| `IntegrationConfigPanel` | Configure connection parameters per integration |
| `SyncStatusDashboard` | Real-time integration health monitoring |
| `BankFileGenerator` | Preview and download bank transfer files |
| `BiometricDeviceManager` | Add, configure, test biometric devices |
| `WebhookManager` | Register and test webhooks |
| `IntegrationLogViewer` | Sync history with error details |
| `FieldMappingEditor` | Map HR fields to external system fields |

---

## Permissions

| Role | Configure | Sync | View Logs | Manage Webhooks |
|------|-----------|------|-----------|-----------------|
| SuperAdmin | Yes | Yes | Yes | Yes |
| Admin | Yes | Yes | Yes | Yes |
| IT Admin | Yes | Yes | Yes | Yes |
| HR | View | View | View | No |
| Others | No | No | No | No |
