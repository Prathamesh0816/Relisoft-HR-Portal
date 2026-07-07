# Security Module Specification

## Overview

The Security module manages authentication, authorization, role-based access control, multi-factor authentication, session management, and audit logging across the entire system.

**Scope**: User management, RBAC, MFA, session management, audit logs, IP whitelisting, security policies.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| User Management | Create, disable, enable system users | P0 |
| Role Management | Define roles and permissions | P0 |
| Permission Assignment | Granular resource-action-scope permissions | P0 |
| JWT Authentication | Access + refresh token based auth | P0 |
| MFA | TOTP/SMS-based two-factor authentication | P0 |
| Session Management | Active sessions, force logout | P1 |
| Audit Logging | Immutable log of all state-changing operations | P0 |
| IP Whitelisting | Restrict access by IP address | P1 |
| Password Policy | Enforce complexity, expiry, history | P0 |
| Security Dashboard | Login attempts, active sessions, audit trails | P1 |

---

## Data Model

### User Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Linked employee |
| `username` | String | Yes | Login username |
| `email` | String | Yes | Login email |
| `passwordHash` | String | Yes | bcrypt hash |
| `roles` | Array of ObjectId (Role) | Yes | Assigned roles |
| `isActive` | Boolean | Yes | Account active |
| `isLocked` | Boolean | No | Account locked |
| `lockedUntil` | Date | No | Lock expiry |
| `mfaEnabled` | Boolean | No | MFA enabled |
| `mfaSecret` | String | No | TOTP secret (encrypted) |
| `mfaMethod` | Enum | No | TOTP, SMS |
| `passwordChangedAt` | Date | No | Last password change |
| `lastLoginAt` | Date | No | Last login time |
| `failedLoginAttempts` | Number | No | Failed attempts count |
| `refreshTokens` | Array | No | Active refresh tokens |
| `ipWhitelist` | Array | No | Allowed IPs |

### Role Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Role name |
| `description` | String | No | Role description |
| `permissions` | Array | Yes | Permission entries |
| `permissions[].resource` | String | Yes | Resource name |
| `permissions[].actions` | Array | Yes | create, read, update, delete, approve, export |
| `permissions[].scope` | Enum | Yes | All, Department, Team, Self |
| `isSystem` | Boolean | Yes | System role (non-deletable) |

### Audit Log Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `actorId` | ObjectId (User) | Yes | Who performed action |
| `actorName` | String | Yes | Actor display name |
| `action` | String | Yes | Action performed |
| `resource` | String | Yes | Resource type |
| `resourceId` | ObjectId | No | Resource instance ID |
| `module` | String | Yes | Module name |
| `changes` | Object | No | Before/after diff |
| `ipAddress` | String | Yes | Request IP |
| `userAgent` | String | No | Browser/device info |
| `sessionId` | String | No | Session identifier |
| `status` | Enum | Yes | Success, Failure, Unauthorized |
| `metadata` | Object | No | Additional context |
| `timestamp` | Date | Auto | Event time |

---

## API Endpoints

### `POST /api/v1/auth/login`
Authenticate user.

**Request Body**:
```json
{
  "email": "john.doe@relisofttechnologies.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 900,
    "mfaRequired": false,
    "user": {
      "id": "664...",
      "email": "john.doe@relisofttechnologies.com",
      "name": "John Doe",
      "roles": ["Employee"]
    }
  }
}
```

### `POST /api/v1/auth/mfa/verify`
Verify MFA code.

### `POST /api/v1/auth/refresh`
Refresh access token.

### `POST /api/v1/auth/logout`
Invalidate refresh token.

### `GET /api/v1/auth/sessions`
Get active sessions.

### `DELETE /api/v1/auth/sessions/:id`
Force logout session.

### `GET /api/v1/security/audit-logs`
Query audit logs with filters.

**Query Parameters**: actorId, resource, action, module, fromDate, toDate, page, limit

### `GET /api/v1/security/roles`
List roles.

### `POST /api/v1/security/roles`
Create role.

### `PUT /api/v1/security/roles/:id/permissions`
Update role permissions.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `LoginPage` | Email/password login with MFA challenge |
| `UserManagementTable` | User accounts with enable/disable |
| `RoleEditor` | Permission matrix grid (resources × actions) |
| `MFASetupModal` | QR code scanning for TOTP setup |
| `AuditLogViewer` | Searchable, filterable audit trail |
| `SessionManager` | Active sessions with force logout |
| `SecurityDashboard` | Login attempts, active users, security alerts |
| `PasswordChangeForm` | Password change with policy enforcement |

---

## Business Rules

1. Account locked after 5 failed login attempts; locked for 30 minutes
2. Password must be minimum 12 characters with uppercase, lowercase, number, special character
3. Password expires every 90 days; cannot reuse last 5 passwords
4. MFA mandatory for SuperAdmin, Admin roles; optional for others
5. JWT access token expires in 15 minutes; refresh token in 7 days
6. Audit logs are immutable (append-only); retention period 7 years
7. Session limit: max 5 concurrent sessions per user
8. IP whitelist enforced for admin/SuperAdmin endpoints
9. Permission changes logged with before/after comparison
10. Inactive user accounts auto-disabled after 90 days

---

## Permissions

| Resource | SuperAdmin | Admin | HR | Manager | Employee |
|----------|------------|-------|----|---------|----------|
| Users | Full | CRUD | Read | Read Self | Read Self |
| Roles | Full | Read | Read | No | No |
| Permissions | Full | Read | No | No | No |
| Audit Logs | Full | Read | Module-scoped | No | No |
| Sessions | Full | Own + Force Others | Own | Own | Own |
| Security Config | Full | Read | No | No | No |
