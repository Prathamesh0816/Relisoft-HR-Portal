# Contractor Management Module Specification

## Overview

The Contractor Management module manages external workforce including vendors, contractors, and consultants. It handles onboarding, time tracking, billing, and contract management for non-employee workers.

**Scope**: Vendor registration, contractor onboarding, contract management, time tracking, billing, offboarding.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Vendor Management | Register and manage vendor companies | P0 |
| Contractor Onboarding | Onboard contractors with documentation | P0 |
| Contract Management | Manage contracts, extensions, renewals | P0 |
| Time Tracking | Track contractor hours and attendance | P1 |
| Billing & Invoicing | Generate invoices and track payments | P1 |
| Compliance Checks | Verify certifications, insurance, visas | P1 |
| Contractor Portal | Self-service for contractors | P1 |
| Offboarding | Automated offboarding on contract end | P1 |

---

## Data Model

### Vendor Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Vendor company name |
| `contactPerson` | String | No | Primary contact |
| `email` | String | Yes | Contact email |
| `phone` | String | No | Contact phone |
| `address` | String | No | Company address |
| `services` | Array | No | Services provided |
| `status` | Enum | Yes | Active, Inactive, Blacklisted |
| `contracts` | Array | No | Associated contracts |

### Contractor Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vendor` | ObjectId (Vendor) | No | Vendor company |
| `firstName` | String | Yes | First name |
| `lastName` | String | Yes | Last name |
| `email` | String | Yes | Email |
| `phone` | String | No | Phone |
| `role` | String | Yes | Role/title |
| `department` | String | Yes | Working department |
| `reportingManager` | ObjectId (Employee) | Yes | Manager |
| `contractStart` | Date | Yes | Contract start |
| `contractEnd` | Date | No | Contract end |
| `billingRate` | Number | No | Hourly/daily/monthly rate |
| `billingFrequency` | Enum | No | Hourly, Daily, Monthly, Fixed |
| `status` | Enum | Yes | Active, Inactive, Onboarding, Offboarded |
| `documents` | Array | No | Contract, NDA, insurance docs |
| `skills` | Array | No | Skills |

---

## API Endpoints

### `POST /api/contractors/vendors`
Register vendor.

### `GET /api/contractors/vendors`
List vendors.

### `POST /api/contractors`
Add contractor.

### `GET /api/contractors`
List contractors.

### `PUT /api/contractors/:id`
Update contractor.

### `POST /api/contractors/:id/time-logs`
Log contractor hours.

### `GET /api/contractors/:id/time-logs`
Get time logs.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `VendorList` | Vendor directory and management |
| `ContractorDirectory` | Searchable contractor list |
| `ContractorOnboardingForm` | Multi-step onboarding workflow |
| `TimeLogSheet` | Weekly time entry for contractors |
| `BillingDashboard` | Invoice generation and payment tracking |
| `ContractTimeline` | Visual contract lifecycle |
