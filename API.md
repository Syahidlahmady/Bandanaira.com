# API Specification (API.md)

RESTful API specification for **Banda Digital Ecosystem**.

---

## 1. Conventions & Standards

- **Base URL:** `/api/v1`
- **Protocol:** HTTPS / JSON over HTTP
- **Authentication:** Bearer JWT Token in `Authorization: Bearer <access_token>`
- **Response Format:**
  - Standard JSON response format.
  - Consistent error structure with machine-readable error codes.

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "Resident record not found",
    "details": []
  }
}
```

---

## 2. Endpoints Overview

### 2.1 System & Health
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | No | System health check (API, Database connection status) |
| `GET` | `/api/v1/version` | No | Build & API version information |

### 2.2 Authentication (`/api/v1/auth`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue tokens |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh expired access token |
| `POST` | `/api/v1/auth/logout` | Authenticated | Invalidate current session/token |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current authenticated user profile & permissions |

### 2.3 Population Management (`/api/v1/population`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/population/residents` | `admin`, `village_officer` | List residents with pagination & filtering |
| `POST` | `/api/v1/population/residents` | `admin`, `village_officer` | Register new resident profile (synthetic data) |
| `GET` | `/api/v1/population/residents/{id}` | `admin`, `village_officer` | Get resident detail |
| `PUT` | `/api/v1/population/residents/{id}` | `admin`, `village_officer` | Update resident data |
| `POST` | `/api/v1/population/residents/{id}/verify` | `admin`, `village_officer` | Update verification status |
| `GET` | `/api/v1/population/statistics` | `admin`, `village_officer` | Aggregate demographic statistics |

### 2.4 Farmers & Farm Mapping (`/api/v1/farmers` & `/api/v1/farms`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/farmers` | `admin`, `village_officer`, `farmer_group_admin` | List registered farmers |
| `POST` | `/api/v1/farmers` | `admin`, `village_officer`, `farmer_group_admin` | Register new farmer |
| `GET` | `/api/v1/farmers/groups` | `admin`, `village_officer`, `farmer_group_admin` | List farmer groups |
| `GET` | `/api/v1/farms` | `admin`, `village_officer`, `farmer_group_admin` | List farms with GeoJSON boundaries |
| `POST` | `/api/v1/farms` | `admin`, `village_officer`, `farmer_group_admin` | Register farm plot with coordinates/polygons |

### 2.5 Harvests & Product Batches (`/api/v1/harvests` & `/api/v1/batches`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/harvests` | `admin`, `village_officer`, `farmer_group_admin`, `farmer` | List harvest records |
| `POST` | `/api/v1/harvests` | `admin`, `village_officer`, `farmer_group_admin`, `farmer` | Record a new harvest entry |
| `GET` | `/api/v1/batches` | `admin`, `village_officer`, `farmer_group_admin` | List product batches |
| `POST` | `/api/v1/batches` | `admin`, `village_officer`, `farmer_group_admin` | Create batch from harvest records |
| `POST` | `/api/v1/batches/{id}/events` | `admin`, `village_officer`, `farmer_group_admin` | Append batch lifecycle event (drying, packaging) |

### 2.6 Public QR Verification (`/api/v1/public/verify`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/public/verify/{token}` | Public (No Auth) | Fetch public product batch history, origin, and blockchain hash |

---

## 3. Query Parameters Standard
- Pagination: `?page=1&limit=20`
- Sorting: `?sort_by=created_at&sort_order=desc`
- Search: `?search=term`
