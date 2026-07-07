# Full & Final Settlement Module Specification

## Overview

The Full & Final (FnF) Settlement module handles the complete financial settlement process for separating employees. It computes all dues including salary, leave encashment, gratuity, notice period recovery, asset recovery charges, and generates the final settlement statement.

**Scope**: FnF calculation, gratuity computation, leave encashment, notice period buyout, asset recovery, final settlement letter, payment processing.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| FnF Initiation | Auto-trigger on separation approval | P0 |
| Dues Calculation | Compute all payable amounts | P0 |
| Recovery Calculation | Compute all recoverable amounts | P0 |
| Gratuity Computation | Calculate gratuity as per Payment of Gratuity Act | P0 |
| Leave Encashment | Calculate encashable leave balance | P0 |
| Notice Period Adjustment | Deduct/waive notice period amount | P0 |
| Asset Recovery | Include asset damage/loss recovery | P1 |
| Loan Recovery | Recover outstanding loans | P1 |
| FnF Statement | Detailed settlement statement PDF | P0 |
| Settlement Payment | Generate payout for settlement amount | P1 |
| Form 16 Generation | Generate final Form 16 for the year | P1 |

---

## Data Model

### FnF Settlement Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Separating employee |
| `separationId` | ObjectId (Separation) | Yes | Separation reference |
| `initiatedDate` | Date | Yes | Initiation date |
| `lastWorkingDate` | Date | Yes | Approved LWD |
| `status` | Enum | Yes | Draft, PendingApproval, Approved, Disbursed, Completed, Disputed |
| `earnings` | Object | Yes | All payable amounts |
| `earnings.salaryUntilLWD` | Number | Yes | Salary for days worked |
| `earnings.leaveEncashment` | Number | Yes | Unused leave payout |
| `earnings.gratuity` | Number | Yes | Gratuity amount |
| `earnings.bonus` | Number | No | Pro-rated bonus |
| `earnings.otherEarnings` | Number | No | Misc earnings |
| `totalEarnings` | Number | Yes | Sum of earnings |
| `deductions` | Object | Yes | All recoverable amounts |
| `deductions.noticePeriodBuyout` | Number | No | Notice period charge |
| `deductions.assetRecovery` | Number | No | Asset damage/loss |
| `deductions.loanRecovery` | Number | No | Pending loan recovery |
| `deductions.incomeTaxRecovery` | Number | No | TDS on settlement |
| `deductions.otherDeductions` | Number | No | Misc deductions |
| `totalDeductions` | Number | Yes | Sum of deductions |
| `netSettlementAmount` | Number | Yes | TotalEarnings - TotalDeductions |
| `gratuityDetails` | Object | No | Gratuity computation |
| `gratuityDetails.yearsOfService` | Number | Yes | Completed years |
| `gratuityDetails.lastSalary` | Number | Yes | Last drawn basic + DA |
| `gratuityDetails.computedAmount` | Number | Yes | 15/26 × years × last salary |
| `gratuityDetails.taxableAmount` | Number | Yes | Taxable portion |
| `leaveEncashmentDetails` | Object | No | Leave encashment details |
| `clearanceStatus` | Object | Yes | Department clearance status |
| `clearanceStatus.it` | Boolean | No | IT clearance |
| `clearanceStatus.admin` | Boolean | No | Admin clearance |
| `clearanceStatus.finance` | Boolean | No | Finance clearance |
| `clearanceStatus.hr` | Boolean | No | HR clearance |
| `settlementLetterUrl` | String | No | PDF settlement letter |
| `paymentReference` | String | No | Payment transaction ref |
| `disbursedAt` | Date | No | Disbursement date |
| `approvedBy` | ObjectId (Employee) | No | Approver |
| `preparedBy` | ObjectId (Employee) | Yes | Prepared by (HR) |

---

## API Endpoints

### `POST /api/v1/fnf/initiate/:separationId`
Initiate FnF for a separated employee.

### `GET /api/v1/fnf/:separationId`
Get FnF statement.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeId": { "name": "John Doe", "employeeId": "EMP-00001" },
    "separationId": "...",
    "lastWorkingDate": "2024-07-31",
    "status": "PendingApproval",
    "earnings": {
      "salaryUntilLWD": 45000,
      "leaveEncashment": {
        "days": 15,
        "ratePerDay": 4000,
        "amount": 60000
      },
      "gratuity": {
        "yearsOfService": 4.5,
        "lastBasicDa": 30000,
        "amount": 77942
      },
      "bonus": 25000,
      "otherEarnings": 0,
      "totalEarnings": 207942
    },
    "deductions": {
      "noticePeriodBuyout": 0,
      "assetRecovery": 5000,
      "loanRecovery": 0,
      "incomeTaxRecovery": 15000,
      "otherDeductions": 0,
      "totalDeductions": 20000
    },
    "netSettlementAmount": 187942,
    "clearanceStatus": {
      "it": true,
      "admin": false,
      "finance": true,
      "hr": true
    }
  }
}
```

### `PUT /api/v1/fnf/:id/approve`
Approve settlement.

### `PUT /api/v1/fnf/:id/disburse`
Mark as disbursed.

### `GET /api/v1/fnf/:id/statement`
Download settlement statement PDF.

### `GET /api/v1/fnf/pending`
List pending FnF settlements.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `FnFDashboard` | Pending settlements, overdue items |
| `FnFCalculator` | Detailed earnings/deductions breakdown |
| `SettlementStatement` | Generated statement PDF preview |
| `ClearanceStatusTracker` | Department-by-department clearance status |
| `GratuityCalculator` | Gratuity computation with rules explanation |
| `PaymentReleasePanel` | Approve and release settlement payment |

---

## Business Rules

1. **Gratuity Calculation**: (Last drawn Basic + DA) × 15/26 × Years of Service
   - Eligible after 5 continuous years of service
   - Years of service: completed years + (months/12); fractional year >6 months rounded up
   - Maximum gratuity exempt under Section 10(10): ₹20,00,000

2. **Leave Encashment**: Unused leave balance × (Monthly Gross / 30)
   - Only encashable leave types (configured in leave policy)
   - Maximum encashment as per company policy

3. **Notice Period Buyout**: (Monthly Gross / 30) × Unserved notice days
   - Applicable if employee does not serve full notice period
   - Can be waived by company

4. **Full clearance required before payment**: IT, Admin, Finance, HR all must clear
5. Settlement to be processed within 30 days of last working day as per law
6. Final Form 16 generated and provided along with settlement
7. TDS on settlement computed as per income tax slab rates

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Settlement Accuracy Check | Auditor | Cross-verify calculations against policies |
| Document Generator | Generator | Auto-generate settlement statement |
| Compliance Check | Checker | Verify statutory compliance of settlement |

---

## Permissions

| Role | Initiate | View | Approve | Disburse | Download Statement |
|------|----------|------|---------|----------|-------------------|
| SuperAdmin | Yes | All | Yes | Yes | All |
| Admin | Yes | All | Yes | Yes | All |
| HR (FnF) | Yes | All | Yes | No | All |
| HR (General) | No | Read | No | No | Read |
| Finance | View | View | Yes | Yes | View |
| Employee | No | Own | No | No | Own |
