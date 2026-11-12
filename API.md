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
| `GET` | `/api/v1/population/statistics` | `admin`, `village_officer` | Aggregate demographic statistics |
| `GET` | `/api/v1/population/requests` | `admin`, `village_officer` | List resident letter/administrative requests with status filter |
| `POST` | `/api/v1/population/requests` | Authenticated | Submit new administrative letter request (SKU, etc.) |
| `PATCH` | `/api/v1/population/requests/{id}/status` | `admin`, `village_officer` | Approve or reject resident administrative request |

### 2.4 Farmers & Farm Mapping (`/api/v1/farmers` & `/api/v1/farms`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/farmers` | Authenticated | List registered farmers |
| `POST` | `/api/v1/farmers` | `admin`, `village_officer`, `farmer_group_admin` | Register new farmer |
| `GET` | `/api/v1/farmers/groups` | Authenticated | List farmer groups |
| `GET` | `/api/v1/farms` | Authenticated | List farms with GeoJSON boundaries and verification filter |
| `POST` | `/api/v1/farms` | `admin`, `village_officer`, `farmer_group_admin` | Register/propose farm plot with coordinates, geodesic area calculation, and boundary overlap prevention |
| `POST` | `/api/v1/farms/validate-boundary` | Authenticated | Pre-check polygon geometry validity and real-time boundary overlap detection |
| `PATCH` | `/api/v1/farms/{id}/verification` | `admin`, `village_officer` | Approve (`verified`) or reject (`rejected`) proposed farm plot |
| `GET` | `/api/v1/farms/geojson/all` | Authenticated | GeoJSON FeatureCollection of farm pins and polygon boundaries with verification status |


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
| `GET` | `/api/v1/public/verify/image/{token}` | Public (No Auth) | Stream direct PNG image of QR code for packaging stickers and image tags |

### 2.7 Blockchain Anchoring & Verification (`/api/v1/blockchain`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/blockchain/batches/{id}/anchor` | `admin`, `village_officer`, `farmer_group_admin` | Anchor batch genesis or event hash to smart contract |
| `GET` | `/api/v1/blockchain/batches/{id}/transactions` | `admin`, `village_officer`, `farmer_group_admin`, `farmer` | List on-chain transaction history for batch |
| `GET` | `/api/v1/blockchain/batches/{id}/verify` | Public (No Auth) | Cryptographic verification comparing local DB hash with on-chain anchored hash |

### 2.8 Centralized Audit & Ecosystem Recap (`/api/v1/audit`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/audit/logs` | `admin`, `village_officer` | List audit log history with entity, action, and pagination filters |
| `GET` | `/api/v1/audit/ecosystem-summary` | `admin`, `village_officer`, `farmer_group_admin` | Fetch executive aggregate statistics across population, farmland, harvests, blockchain, and letters |

### 2.9 Decision Support System Dual-Mode SAW (`/api/v1/dss`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/dss/hitung-saw` | Public / Admin | Generic SAW mathematical calculation engine with automatic zero-division protection |
| `POST` | `/api/v1/dss/rekomendasi-wisata` | Public | Mode 1: Multi-criteria tourism & homestay recommendation ranking based on budget, distance, facilities, and heritage score |
| `POST` | `/api/v1/dss/prioritas-krisis` | `admin`, `village_officer` | Mode 2: Island crisis zone ranking for prioritizing RO desalination and solar deployments |
| `GET` | `/api/v1/dss/wisata/alternatives` | Public | Get authentic tourism alternative matrix dataset |
| `GET` | `/api/v1/dss/krisis/alternatives` | `admin`, `village_officer` | Get authentic village crisis zone alternative matrix dataset |

### 2.10 Koperasi Hatta & Circular Water Dispenser (`/api/v1/koperasi`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/koperasi/transaksi/setor-komoditas` | `admin`, `village_officer` | Record spice/fish commodity deposit with cash/water quota allocation and SHA-256 ledger receipt |
| `POST` | `/api/v1/koperasi/transaksi/setor-sampah` | `admin`, `village_officer` | Prof. Purwo plastic circular converter (1 kg plastic -> 10 L RO water + 10 points) |
| `POST` | `/api/v1/koperasi/tebus-air` | Public / Resident | Dispense clean RO drinking water, deducting citizen quota & triggering ESP32 solenoid valve pulse |
| `GET` | `/api/v1/koperasi/warga/{nik}/profil` | Public / Resident | Retrieve citizen cooperative balance, water quota, waste points, and persona details |
| `GET` | `/api/v1/koperasi/transaksi` | `admin`, `village_officer` | View complete cooperative transaction ledger with cryptographic receipt hashes |
| `GET` | `/api/v1/koperasi/rekapitulasi` | `admin`, `village_officer` | Executive summary of total commodities collected, plastic recycled, and water dispensed |

### 2.11 IoT Telemetry & Island Resiliency (`/api/v1/iot`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/iot/telemetri` | IoT Node / Admin | Ingest real-time telemetry packet (raw TDS ppm, filtered TDS ppm, tank level %, solar voltage/current/power, battery SoC) |
| `GET` | `/api/v1/iot/telemetri/terkini` | Public / Admin | Real-time statuses and alert indicators across all 4 island telemetry stations |
| `GET` | `/api/v1/iot/telemetri/riwayat` | Public / Admin | Time-series historical telemetry log stream |
| `GET` | `/api/v1/iot/resiliency-summary` | Public / Admin | Island readiness barometer, WHO water standard compliance, solar energy mix %, and diesel fuel savings |
| `POST` | `/api/v1/iot/simulate-pulse` | Public / Admin | Trigger simulated realistic ESP32 telemetry pulse across island network |

### 2.12 Smart Tourism, Eco-Stay & Tour Guides CMS (`/api/v1/tourism` & `/api/v1/penginapan`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/tourism/accommodations` & `/api/v1/penginapan` | Public | List accommodations with island, type, price, RO water, and solar backup filters |
| `POST` | `/api/v1/tourism/accommodations` | `admin`, `village_officer`, `operator_homestay` | Register new accommodation listing into eco-stay catalog |
| `PUT` | `/api/v1/tourism/accommodations/{id}` | `admin`, `village_officer`, `operator_homestay` | Update accommodation details, room tariffs/night, availability, or verify status |
| `DELETE` | `/api/v1/tourism/accommodations/{id}` | `admin`, `village_officer`, `operator_homestay` | Delete accommodation listing from catalog |
| `POST` | `/api/v1/tourism/bookings` & `/api/v1/pemesanan` | Public | Create guest booking with automated pricing and deterministic direct click-to-chat WhatsApp link |
| `GET` | `/api/v1/tourism/bookings` & `/api/v1/pemesanan` | Public / Operator | List incoming guest reservations with optional accommodation filter |
| `GET` | `/api/v1/tourism/bookings/{booking_code}` | Public | Lookup booking details and status by unique code |
| `GET` | `/api/v1/tourism/heritage-catalog` | Public | 177 Cagar Budaya catalog with historical narratives, photo galleries, and audio guide MP3 stream links |
| `GET` | `/api/v1/tourism/guides` | Public | List licensed Banda tour guides with island and verified filters |
| `POST` | `/api/v1/tourism/guides` | `admin`, `village_officer`, `smart_tourism_admin` | Register licensed tour guide profile with specialties, languages, and daily fee |
| `PUT` | `/api/v1/tourism/guides/{id}` | `admin`, `village_officer`, `smart_tourism_admin` | Update tour guide details, daily fee, or HPI verification status |
| `DELETE` | `/api/v1/tourism/guides/{id}` | `admin`, `village_officer`, `smart_tourism_admin` | Delete tour guide record |

### 2.13 7-Layer Spatial GIS (`/api/v1/gis` & `/api/v1/peta/geojson`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `GET` | `/api/v1/gis/layers` & `/api/v1/peta/geojson` | Public | Standard RFC 7946 GeoJSON FeatureCollection across 7 layers with layer_type, category, and island filters |
| `GET` | `/api/v1/gis/meta` & `/api/v1/peta/layers-meta` | Public | Layer metadata catalog detailing all 7 spatial layers, item counts, and active status |
| `GET` | `/api/v1/gis/cagar-budaya/{slug}` | Public | Retrieve heritage narrative and audio guide URL by slug |
| `POST` | `/api/v1/gis/features` | `admin`, `village_officer` | Register new spatial feature with coordinates and metadata |

### 2.14 Cryptographic NIK Hardening & OWASP Top 10 (`/api/v1/security` & `/api/v1/warga`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/warga/cari-nik` & `/api/v1/security/cari-nik` | Public (Rate-Limited) | Search citizen profile by 16-digit NIK using HMAC-SHA256 blind indexing ($O(1)$) with masked NIK and 20 req/min rate limit |
| `GET` | `/api/v1/audit-keamanan` & `/api/v1/security/audit-report` | Public / Admin | 4-pillar cryptographic security audit report (AES-256-GCM, HMAC Blind Index, Anti-Enumeration, Zero-PII Blockchain) |
| `POST` | `/api/v1/security/test-crypto-roundtrip` | Public / Admin | Interactive crypto sandbox verifying AES-256 encryption, HMAC blind index, and plaintext recovery |

### 2.15 Dynamic Field Surveys & PostGIS ETL Pipeline (`/api/v1/survei`)
| Method | Endpoint | Roles Allowed | Description |
|---|---|---|---|
| `POST` | `/api/v1/survei/mentah` | Public / Field Surveyor | Save dynamic field survey with flexible key-value attributes (NoSQL/MongoDB staging) |
| `GET` | `/api/v1/survei/mentah` | Public / Admin | List raw surveys with domain, status, island, and urgency filters |
| `GET` | `/api/v1/survei/mentah/{id}` | Public / Admin | Detail of specific raw survey document |
| `POST` | `/api/v1/survei/migrasi-etl` | `admin`, `village_officer` | Execute ETL pipeline validating Banda coordinates and promoting raw surveys to PostGIS 7-layer spatial features |
| `GET` | `/api/v1/survei/stats` | Public / Admin | Real-time statistics barometer on survey counts, pending migrations, and domain distributions |
| `POST` | `/api/v1/survei/seed-sample` | Public / Admin | Seed authentic Banda Neira field surveys across all 5 islands |

---

## 3. Query Parameters Standard
- Pagination: `?page=1&limit=20`
- Sorting: `?sort_by=created_at&sort_order=desc`
- Search: `?search=term` (searches Name, NIK, or Occupation)
- Population Occupation Filter: `?occupation=Petani+Rempah+Pala` or `?occupation=Nelayan+Tangkap+Tradisional`
