# Payroll Module Specification

## Overview

The Payroll module handles monthly payroll processing including salary structure definition, attendance integration, earnings/deductions computation, statutory compliance (PF, ESI, PT, TDS), pay slip generation, and bank file export for salary disbursement.

**Scope**: Salary structure, monthly payroll processing, arrears, full & final settlement, statutory filings, payslips, bank file generation.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Salary Structure | Define pay heads, bands, grade-wise templates | P0 |
| Monthly Payroll | Process monthly payroll with attendance integration | P0 |
| Earnings & Deductions | Configurable earnings (basic, HRA, allowances) and deductions (PF, ESI, PT, TDS, loan) | P0 |
| Statutory Compliance | PF, ESI, Professional Tax, TDS computation | P0 |
| Pay Slip Generation | Auto-generate PDF pay slips | P0 |
| Bank File Export | Generate salary bank transfer file (NEFT/ACH format) | P1 |
| Arrears | Compute and process salary arrears | P1 |
| Reimbursements | Tax-optimized reimbursement claims | P1 |
| Loan Management | Employee loan/garnishment deduction tracking | P2 |
| Form 16 Generation | Annual tax form generation | P1 |
| Payroll Reports | Department-wise cost, headcount, variance reports | P1 |
| Lock Period | Configurable payroll lock/unlock periods | P1 |

---

## Data Model

### Pay Head Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Pay head name (Basic, HRA, PF, etc.) |
| `code` | String | Yes | Unique code |
| `type` | Enum | Yes | Earning, Deduction |
| `category` | Enum | Yes | Fixed, Variable, Reimbursement, Statutory |
| `isStatutory` | Boolean | No | PF, ESI, PT, TDS |
| `computationType` | Enum | Yes | Percentage, Fixed, Formula |
| `computationValue` | Mixed | Yes | Value or percentage |
| `percentageOf` | Array | No | Base pay heads for percentage calc |
| `maxLimit` | Number | No | Maximum cap |
| `isTaxable` | Boolean | No | Taxable component |
| `isVisibleOnPayslip` | Boolean | Yes | Show on payslip |
| `effectiveDate` | Date | Yes | Effective from date |

### Salary Structure Collection (per employee)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee reference |
| `effectiveFrom` | Date | Yes | Structure effective date |
| `effectiveTo` | Date | No | End date (null = current) |
| `gradeId` | ObjectId (Grade) | Yes | Grade at time of structure |
| `totalCTC` | Number | Yes | Annual CTC |
| `components` | Array | Yes | Individual pay head values |
| `components[].payHeadId` | ObjectId (PayHead) | Yes | Pay head reference |
| `components[].amount` | Number | Yes | Monthly amount |
| `components[].computedValue` | Number | No | Computed amount after rules |
| `isActive` | Boolean | Yes | Active status |
| `approvedBy` | ObjectId (Employee) | No | Approver |
| `createdAt` | Date | Auto | Timestamp |

### Payroll Run Collection (monthly batch)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `month` | Number | Yes | Month (1-12) |
| `year` | Number | Yes | Year |
| `runName` | String | Yes | e.g., "Monthly Run - June 2024" |
| `status` | Enum | Yes | Draft, Processing, Completed, Locked, Failed |
| `totalEmployees` | Number | Yes | Count of employees |
| `totalEarnings` | Number | Yes | Total gross earnings |
| `totalDeductions` | Number | Yes | Total deductions |
| `totalNetPay` | Number | Yes | Total net payout |
| `processingStartedAt` | Date | No | Processing start |
| `processingCompletedAt` | Date | No | Processing end |
| `lockedAt` | Date | No | Lock timestamp |
| `lockedBy` | ObjectId (User) | No | Who locked |
| `createdBy` | ObjectId (User) | Yes | Creator |

### Employee Payslip Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `employeeId` | ObjectId (Employee) | Yes | Employee reference |
| `payrollRunId` | ObjectId (PayrollRun) | Yes | Monthly run reference |
| `salaryStructureId` | ObjectId (SalaryStructure) | Yes | Structure used |
| `month` | Number | Yes | Month |
| `year` | Number | Yes | Year |
| `attendanceSummary` | Object | Yes | Days worked, paid days, LOP days |
| `earnings` | Array | Yes | Earnings components |
| `earnings[].payHeadCode` | String | Yes | Code |
| `earnings[].amount` | Number | Yes | Amount |
| `deductions` | Array | Yes | Deductions components |
| `deductions[].payHeadCode` | String | Yes | Code |
| `deductions[].amount` | Number | Yes | Amount |
| `grossEarnings` | Number | Yes | Sum of earnings |
| `grossDeductions` | Number | Yes | Sum of deductions |
| `netPay` | Number | Yes | Net payable |
| `totalDaysInMonth` | Number | Yes | Calendar days |
| `paidDays` | Number | Yes | Days paid |
| `lopDays` | Number | No | Loss of pay days |
| `arrears` | Number | No | Arrear amount |
| `payslipUrl` | String | No | Generated PDF URL |
| `isFinalSettlement` | Boolean | No | FnF settlement flag |
| `status` | Enum | Yes | Generated, Sent, Downloaded |
| `generatedAt` | Date | Auto | Generation timestamp |

### Statutory Filing Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | Enum | Yes | PF, ESI, PT, TDS |
| `period` | String | Yes | Period (MM-YYYY) |
| `totalAmount` | Number | Yes | Total remittance |
| `employeeCount` | Number | Yes | Covered employees |
| `returnFiled` | Boolean | No | Return filed |
| `returnDate` | Date | No | Filing date |
| `acknowledgmentNo` | String | No | Govt acknowledgment |
| `challanDetails` | Object | No | Payment challan |
| `status` | Enum | Yes | Pending, Filed, Verified, Error |
| `remarks` | String | No | Notes |

---

## API Endpoints

### `POST /api/v1/payroll/structures`
Create salary structure for employee.

**Request Body**:
```json
{
  "employeeId": "664a1b2c3d4e5f6a7b8c9d0e",
  "effectiveFrom": "2024-04-01",
  "totalCTC": 1800000,
  "components": [
    { "payHeadId": "payhead_basic", "amount": 60000 },
    { "payHeadId": "payhead_hra", "amount": 30000 },
    { "payHeadId": "payhead_conveyance", "amount": 2400 },
    { "payHeadId": "payhead_medical", "amount": 1250 },
    { "payHeadId": "payhead_special", "amount": 26350 },
    { "payHeadId": "payhead_pf", "amount": 7200 },
    { "payHeadId": "payhead_esi", "amount": 0 },
    { "payHeadId": "payhead_pt", "amount": 200 },
    { "payHeadId": "payhead_tds", "amount": 15000 }
  ]
}
```

### `POST /api/v1/payroll/process`
Initiate monthly payroll processing.

**Request Body**:
```json
{
  "month": 6,
  "year": 2024,
  "employeeIds": ["664a1b2c3d4e5f6a7b8c9d0e", "..."],
  "runName": "Monthly Run - June 2024",
  "includeArrears": false,
  "includeFinalSettlements": false
}
```

### `GET /api/v1/payroll/payslips/:employeeId?month=6&year=2024`
Get employee payslip.

**Response**:
```json
{
  "success": true,
  "data": {
    "employeeName": "John Doe",
    "employeeId": "EMP-00001",
    "department": "Engineering",
    "designation": "Senior Software Engineer",
    "month": "June",
    "year": 2024,
    "panNumber": "ABCDE1234F",
    "uanNumber": "101234567890",
    "totalDaysInMonth": 30,
    "paidDays": 28,
    "lopDays": 2,
    "earnings": [
      { "payHead": "Basic", "amount": 60000 },
      { "payHead": "House Rent Allowance", "amount": 30000 },
      { "payHead": "Conveyance Allowance", "amount": 2400 },
      { "payHead": "Medical Allowance", "amount": 1250 },
      { "payHead": "Special Allowance", "amount": 26350 }
    ],
    "deductions": [
      { "payHead": "Provident Fund", "amount": 7200 },
      { "payHead": "Professional Tax", "amount": 200 },
      { "payHead": "TDS", "amount": 15000 }
    ],
    "grossEarnings": 120000,
    "grossDeductions": 22400,
    "netPay": 97600,
    "netPayInWords": "Ninety Seven Thousand Six Hundred Only"
  }
}
```

### `POST /api/v1/payroll/generate-bank-file`
Generate bank file for salary transfer.

### `GET /api/v1/payroll/reports/statutory/:type?month=6&year=2024`
Generate statutory report (PF/ESI/PT).

---

## UI Components

| Component | Description |
|-----------|-------------|
| `SalaryStructureDesigner` | Visual builder for pay heads and formulas |
| `PayrollDashboard` | Monthly payroll summary with totals and variances |
| `PayrollProcessingPanel` | Initiate and monitor payroll run |
| `PayslipViewer` | HTML/PDF payslip display with download |
| `PayslipEmailSender` | Bulk email payslips to employees |
| `StatutoryFilingPanel` | Generate and file statutory returns |
| `BankFilePreview` | Review bank transfer file before download |
| `SalaryRevisionForm` | Process salary revision with approval |
| `PayrollLockUI` | Lock/unlock periods with confirmation |
| `Form16Generator` | Generate Form 16 for tax filing |

---

## Business Rules

1. **Attendance Integration**: Paid days = total days - LOP days - unpaid leave days; LOP days calculated as per leave balance
2. **Loss of Pay**: Deduction = (Monthly gross / Calendar days) × LOP days; rounding to nearest rupee
3. **PF Calculation**: 12% of basic+DA; max ₹15,000 (statutory limit) or actual; employer contribution split (3.67% PF + 8.33% EPS)
4. **ESI Calculation**: 0.75% employee + 3.25% employer; applicable if gross ≤ ₹21,000/month
5. **Professional Tax**: State-wise slab rates; auto-computed based work location
6. **TDS**: As per IT section 192; computed based on submitted investment declarations
7. **Payroll Lock**: Once locked, payroll cannot be modified; unlock requires super-admin approval
8. **Arrear Computation**: Arrears for previous months computed at current month rates; separate pay head
9. **New Joiners**: Salary prorated from joining date; month-end joiners get paid in next cycle
10. **Separated Employees**: Final settlement processed separately including gratuity, leave encashment
11. **Minimum Wage Compliance**: System checks gross pay >= minimum wage for location/role
12. **Payslip Generation**: Generated on payroll lock; available on ESS portal and email

---

## AI Integration

| Feature | AI Service | Description |
|---------|------------|-------------|
| Salary Benchmarking | Analyst | Compare salary structures against industry benchmarks |
| Tax Optimization | Advisor | Suggest optimal compensation structure for tax efficiency |
| Anomaly Detection | Auditor | Flag unusual payroll patterns, duplicate payments |
| Compliance Alert | Checker | Auto-alert for missed statutory deadlines |
| Payroll Cost Forecast | Predictor | Predict future payroll costs based on hiring plans |
| Chatbot | Assistant | Answer salary queries, payslip access via chat |

---

## Permissions

| Role | View Payslip | Run Payroll | Edit Structure | Lock Payroll | Statutory Filing | Reports |
|------|-------------|-------------|----------------|--------------|------------------|---------|
| SuperAdmin | All | Yes | Yes | Yes | Yes | All |
| Admin | All | Yes | Yes | Yes | Yes | All |
| HR | All | Yes | Yes | No | Yes | All |
| Manager | Team Only | No | No | No | No | Team |
| Employee | Self Only | No | No | No | No | Self |
