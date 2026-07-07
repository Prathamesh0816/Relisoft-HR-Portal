# Travel & Expense Management Module Specification

## Overview

The Travel & Expense module manages employee travel requests, expense claims, approvals, and reimbursement processing. It covers domestic and international travel, expense categorization, policy compliance, and finance integration.

**Scope**: Travel requests (domestic/international), expense claims, approvals, reimbursement, travel policy, corporate card integration.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Travel Request | Submit travel request with itinerary and cost estimates | P0 |
| Travel Approval | Multi-level approval for travel requests | P0 |
| Expense Claims | Submit expenses with receipts and categorization | P0 |
| Expense Approval | Manager and finance approval workflow | P0 |
| Reimbursement | Process approved expenses for payout | P1 |
| Travel Policy | Configurable travel policies (class, budget, per diem) | P1 |
| Corporate Cards | Integration with corporate card transactions | P2 |
| Forex Management | Foreign currency advance requests | P2 |
| Mileage Claims | Auto-calculate mileage from distance | P2 |

---

## Data Model

### Travel Request Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Traveler |
| `purpose` | String | Yes | Travel purpose |
| `travelType` | Enum | Yes | Domestic, International |
| `fromLocation` | String | Yes | Origin |
| `toLocation` | String | Yes | Destination |
| `departureDate` | Date | Yes | Departure |
| `returnDate` | Date | Yes | Return |
| `estimatedCost` | Number | Yes | Estimated total cost |
| `flightRequired` | Boolean | No | Flight booking needed |
| `hotelRequired` | Boolean | No | Hotel booking needed |
| `conveyanceRequired` | Boolean | No | Local transport needed |
| `advanceAmount` | Number | No | Cash advance requested |
| `status` | Enum | Yes | Draft, Pending, Approved, Rejected, Cancelled, Completed |
| `approvalLog` | Array | No | Approval history |

### Expense Claim Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Claimant |
| `travelRequestId` | ObjectId (TravelRequest) | No | Linked travel |
| `title` | String | Yes | Claim title |
| `claimDate` | Date | Yes | Date of claim |
| `currency` | String | Yes | Currency code |
| `totalAmount` | Number | Yes | Total claim amount |
| `status` | Enum | Yes | Draft, Submitted, Approved, Rejected, Reimbursed, PartiallyApproved |
| `expenseItems` | Array | Yes | Line items |
| `expenseItems[].category` | Enum | Yes | Flight, Hotel, Taxi, Food, Fuel, Supplies, Mileage, Others |
| `expenseItems[].date` | Date | Yes | Expense date |
| `expenseItems[].description` | String | Yes | Description |
| `expenseItems[].amount` | Number | Yes | Amount |
| `expenseItems[].currency` | String | Yes | Currency |
| `expenseItems[].billableToProject` | String | No | Project code |
| `expenseItems[].receiptUrl` | String | No | Receipt image URL |
| `expenseItems[].approvedAmount` | Number | No | Approved amount |

---

## API Endpoints

### `POST /api/v1/travel/requests`
Create travel request.

### `GET /api/v1/travel/requests/my`
My travel requests.

### `PUT /api/v1/travel/requests/:id/approve`
Approve/reject travel.

### `POST /api/v1/expenses/claims`
Submit expense claim.

**Request Body**:
```json
{
  "travelRequestId": "664...",
  "title": "Bangalore client visit expenses",
  "currency": "INR",
  "expenseItems": [
    {
      "category": "Flight",
      "date": "2024-06-10",
      "description": "Bangalore to Mumbai round trip",
      "amount": 8500,
      "receiptUrl": "https://s3.amazonaws.com/receipts/abc123.jpg"
    },
    {
      "category": "Hotel",
      "date": "2024-06-10",
      "description": "Hotel stay 2 nights",
      "amount": 12000,
      "receiptUrl": "https://s3.amazonaws.com/receipts/def456.jpg"
    }
  ]
}
```

### `GET /api/v1/expenses/claims/pending`
Pending expense approvals.

### `PUT /api/v1/expenses/claims/:id/approve`
Approve/reject expense claim.

### `POST /api/v1/expenses/reimburse/:claimId`
Mark claim as reimbursed.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `TravelRequestForm` | Multi-step travel request with itinerary builder |
| `ExpenseClaimForm` | Receipt upload and expense categorization |
| `ExpenseApprovalQueue` | Manager/finance approval list |
| `TravelDashboard` | Upcoming travel, pending claims summary |
| `PolicyViolationAlert` | Warnings when exceeding travel policy limits |
| `MileageCalculator` | Map-based distance and mileage cost |

---

## Business Rules

1. International travel requires CEO approval + HR compliance check
2. Travel must be pre-approved before booking (post-travel approval for emergencies)
3. Expenses must be submitted within 15 days of return
4. Policy check: flight class (economy <4hrs, business >6hrs), hotel budget (₹5K/night domestic)
5. Receipts required for all expenses > ₹1,000
6. GST input credit claimed on eligible expense receipts
7. Advances must be settled within 30 days of travel completion
8. Department budget checked before travel approval

---

## Permissions

| Role | Travel | Expenses | Approval Travel | Approval Expense | Reimburse |
|------|--------|----------|----------------|-----------------|-----------|
| SuperAdmin | Full | Full | Yes | Yes | Yes |
| Admin | Full | Full | Yes | Yes | Yes |
| HR | View | View | No | No | No |
| Finance | View | View | No | Yes | Yes |
| Manager | Own + Team | Own + Team | Team | Team | No |
| Employee | Own | Own | No | No | No |
