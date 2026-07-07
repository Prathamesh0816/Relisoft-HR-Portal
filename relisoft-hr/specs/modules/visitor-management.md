# Visitor Management Module Specification

## Overview

The Visitor Management module handles visitor registration, gate pass generation, host approvals, and security check-in/check-out. It ensures compliance with security policies and provides a digital record of all visitors.

**Scope**: Pre-registration, gate pass generation, host approval, check-in/check-out, visitor history.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Visitor Pre-Registration | Register visitors before arrival | P0 |
| Host Approval | Notify host for approval | P0 |
| Gate Pass Generation | Digital/printable gate pass with QR code | P0 |
| Check-In/Check-Out | Self-service kiosk or security desk check-in | P0 |
| Visitor History | Track all visitor visits | P1 |
| Blacklist Management | Block unauthorized visitors | P1 |
| Pre-Approved Visitors | Regular visitors with auto-approval | P1 |
| Analytics | Visitor volume, peak times, host reports | P1 |

---

## Data Model

### Visitor Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `email` | String | Yes | Email |
| `phone` | String | No | Phone number |
| `company` | String | No | Company name |
| `idProof` | String | No | ID proof type |
| `idProofNumber` | String | No | ID number |
| `photo` | String | No | Visitor photo |
| `isBlacklisted` | Boolean | No | Blacklist flag |

### Visit Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `visitor` | ObjectId (Visitor) | Yes | Visitor reference |
| `host` | ObjectId (Employee) | Yes | Host employee |
| `purpose` | String | Yes | Visit purpose |
| `expectedDate` | Date | Yes | Expected visit date |
| `expectedTime` | String | Yes | Expected arrival time |
| `status` | Enum | Yes | Pending, Approved, CheckedIn, CheckedOut, Cancelled |
| `gatePassNumber` | String | No | Auto-generated gate pass |
| `qrCode` | String | No | QR code data |
| `checkedInAt` | Date | No | Check-in timestamp |
| `checkedOutAt` | Date | No | Check-out timestamp |
| `badgeNumber` | String | No | Temporary badge number |
| `notes` | String | No | Special instructions |
| `approvedBy` | ObjectId (Employee) | No | Approver |

---

## API Endpoints

### `POST /api/visitors/register`
Register visitor.

### `POST /api/visitors/visits`
Schedule visit.

### `GET /api/visitors/visits/pending`
Get pending approvals for host.

### `PUT /api/visitors/visits/:id/approve`
Approve/reject visit.

### `PUT /api/visitors/visits/:id/check-in`
Check-in visitor.

### `PUT /api/visitors/visits/:id/check-out`
Check-out visitor.

### `GET /api/visitors/history`
Visitor visit history.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `VisitorPreRegistration` | Form to register visitor details |
| `GatePassGenerator` | Digital gate pass with QR code |
| `HostApprovalPanel` | Approve/reject pending visits |
| `CheckInKiosk` | Self-service check-in interface |
| `VisitorHistoryTable` | Searchable visitor log |
| `SecurityDashboard` | Currently checked-in visitors, alerts |
