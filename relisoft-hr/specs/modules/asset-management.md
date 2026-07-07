# Asset Management Module Specification

## Overview

The Asset Management module handles the complete lifecycle of company assets allocated to employees including laptops, phones, peripherals, and accessories. It tracks issuance, return, recovery, and disposal.

**Scope**: Asset catalog, allocation, return, recovery, maintenance, depreciation.

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Asset Catalog | Define asset types, models, specifications | P0 |
| Asset Allocation | Issue assets to employees with acknowledgment | P0 |
| Asset Return | Process asset return with condition check | P0 |
| Asset Recovery | Track recovery from separated employees | P0 |
| Maintenance Tracking | Schedule and log maintenance activities | P1 |
| Depreciation | Track asset value depreciation | P2 |
| Inventory | Stock view, asset availability | P1 |
| QR/Barcode Labels | Unique asset identification | P2 |

---

## Data Model

### Asset Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assetTag` | String | Yes | Unique asset tag (AST-XXXXX) |
| `type` | Enum | Yes | Laptop, Desktop, Monitor, Phone, Tablet, Accessory, Others |
| `category` | String | Yes | e.g., "Dell Latitude 5440" |
| `brand` | String | Yes | Brand name |
| `model` | String | Yes | Model number |
| `serialNumber` | String | Yes | Manufacturer serial |
| `specifications` | Object | No | RAM, storage, processor, etc. |
| `purchaseDate` | Date | Yes | Purchase date |
| `purchaseCost` | Number | Yes | Purchase cost |
| `warrantyExpiry` | Date | No | Warranty end |
| `status` | Enum | Yes | Available, Allocated, UnderMaintenance, Disposed, Lost |
| `currentAllocation` | ObjectId (Allocation) | No | Current allocation ref |
| `location` | String | No | Physical storage location |
| `notes` | String | No | Additional notes |

### Asset Allocation Collection

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assetId` | ObjectId (Asset) | Yes | Asset |
| `employeeId` | ObjectId (Employee) | Yes | Allocated to |
| `allocationDate` | Date | Yes | Issue date |
| `expectedReturnDate` | Date | No | Expected return |
| `returnDate` | Date | No | Actual return |
| `conditionAtIssuance` | String | No | Condition notes |
| `conditionAtReturn` | String | No | Return condition |
| `damageCharges` | Number | No | Recovery amount |
| `acknowledgmentSigned` | Boolean | No | Signed acknowledgment |
| `status` | Enum | Yes | Allocated, Returned, Recovered, Damaged |

---

## API Endpoints

### `GET /api/v1/assets`
Asset inventory list.

### `POST /api/v1/assets/allocate`
Allocate asset to employee.

**Request Body**:
```json
{
  "assetId": "664...",
  "employeeId": "664...",
  "allocationDate": "2024-06-01",
  "conditionAtIssuance": "Brand new, sealed box"
}
```

### `PUT /api/v1/assets/:id/return`
Return asset.

### `GET /api/v1/assets/my`
Get my allocated assets.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "assetTag": "AST-00001",
      "type": "Laptop",
      "category": "Dell Latitude 5440",
      "serialNumber": "DL12345678",
      "specifications": { "ram": "16GB", "storage": "512GB SSD", "processor": "i7-1365U" },
      "allocationDate": "2023-12-01",
      "conditionAtIssuance": "Excellent"
    }
  ]
}
```

### `GET /api/v1/assets/recovery-pending`
Assets pending recovery from separated employees.

---

## UI Components

| Component | Description |
|-----------|-------------|
| `AssetInventoryList` | Table with filters by type, status, employee |
| `AssetDetailView` | Full asset details with allocation history |
| `AllocationForm` | Issue asset to employee with acknowledgment |
| `RecoveryDashboard` | Pending recoveries with separation linkage |
| `QRCodeLabel` | Generate printable QR labels |

---

## Business Rules

1. Each asset allocated to only one employee at a time
2. Asset cannot be allocated if status is UnderMaintenance or Disposed
3. Recovery automatically triggered when employee separation is initiated
4. Damage charges deducted from FnF settlement if applicable
5. Asset must be returned within 7 days of employee's last working day
6. Lost assets — full cost recovered from employee or insurance claim

---

## Permissions

| Role | Catalog | Allocate | Return | Recovery | Reports |
|------|---------|----------|--------|----------|---------|
| SuperAdmin | Full | Full | Full | Full | All |
| Admin | Full | Full | Full | Full | All |
| Admin (IT) | Full | Full | Full | Yes | Yes |
| HR | View | No | Yes | View | Yes |
| Employee | View Own | No | Request | No | Own |
