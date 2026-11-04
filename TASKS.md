# Development Backlog & Progress (TASKS.md)

Project status and step-by-step development tracker for **Banda Digital Ecosystem**.

---

## Roadmap Overview

- [x] **Phase 0: Project Inception & Requirements Discovery**
- [x] **Phase 1: Project Foundation & Skeleton Setup**
- [x] **Phase 2: Authentication & Authorization (RBAC)**
- [x] **Phase 3: Population Management Module**
- [x] **Phase 4: Farmer & Farm Mapping Module (PostGIS + Leaflet)**
- [ ] **Phase 5: Harvest & Traceability Subsystem**
- [ ] **Phase 6: Blockchain Integration & Verification Layer**
- [ ] **Phase 7: Offline Support & PWA (IndexedDB Sync Queue)**
- [ ] **Phase 8: End-to-End Testing & Field Demonstration Readiness**

---

## Detailed Task Checklist

### Phase 1: Project Foundation & Skeleton Setup
- [x] 1.1 Documentation decomposition (`AGENTS.md`, `SRS.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md`, `TASKS.md`, `CHANGELOG.md`, `.env.example`, `README.md`).
- [x] 1.2 Multi-container environment via `docker-compose.yml` (PostgreSQL 16 with PostGIS 3.4, Backend FastAPI, Frontend React).
- [x] 1.3 Backend structure initialization (Python 3.12+, FastAPI, SQLAlchemy async/sync, Pydantic v2, Alembic).
- [x] 1.4 Frontend structure initialization (Vite, React 18, TypeScript, React Router, TanStack Query).
- [x] 1.5 Database configuration and automated connection health check (`/api/v1/health`).
- [x] 1.6 Basic automated tests (FastAPI TestClient / pytest for health check).

### Phase 2: Authentication & Authorization (RBAC)
- [x] 2.1 Database schema for `users`, `roles`, and `user_roles` with Alembic migration `001_initial_users_and_roles`.
- [x] 2.2 Password hashing (bcrypt) and JWT token service (`access_token`, `refresh_token`).
- [x] 2.3 Login endpoint (`/api/v1/auth/login`), profile endpoint (`/api/v1/auth/me`), and token refresh (`/api/v1/auth/refresh`).
- [x] 2.4 FastAPI dependency injection for role-based permissions (`admin`, `village_officer`, `farmer_group_admin`, `farmer`, `smart_tourism_admin`).
- [x] 2.5 Seed script for default roles and admin account.
- [x] 2.6 Frontend Auth service and login interface.

### Phase 3: Population Management
- [x] 3.1 `residents`, `administrative_requests`, and `audit_logs` schema with Alembic migration `002_population_and_audit_tables`.
- [x] 3.2 CRUD endpoints for resident records with Pydantic schemas (`/api/v1/population/residents`).
- [x] 3.3 Verification workflow (`pending` -> `verified` / `rejected`).
- [x] 3.4 Audit log generation on resident mutations (`CREATE_RESIDENT`, `UPDATE_RESIDENT`, `VERIFY_RESIDENT`).
- [x] 3.5 Demographic summary statistics endpoint (`/api/v1/population/statistics`).
- [x] 3.6 Frontend resident management interface and statistics cards.

### Phase 4: Farmer & Farm Mapping (PostGIS)
- [x] 4.1 Schema for `farmers`, `farmer_groups`, and `farms` with PostGIS geometry/coordinate support and Alembic migration `003_farmers_and_farms_tables`.
- [x] 4.2 Farmer registration API (`/api/v1/farmers`) and group management (`/api/v1/farmers/groups`).
- [x] 4.3 Farm plot registration API (`/api/v1/farms`) and GeoJSON FeatureCollection endpoint (`/api/v1/farms/geojson/all`).
- [x] 4.4 Frontend interactive map using Leaflet, OpenStreetMap tiles, and commodity status indicators.

### Phase 5: Harvest & Traceability Subsystem
- [x] 5.1 `harvests`, `product_batches`, `batch_harvests`, and `batch_events` schema with migration `004_harvest_and_traceability_tables`.
- [x] 5.2 Harvest entry endpoint and batch creation endpoint.
- [x] 5.3 Batch event logging with deterministic canonical SHA-256 event hashing.
- [x] 5.4 Unique QR Code generation with public verification token.
- [x] 5.5 Public QR verification endpoint and frontend responsive product timeline page.

### Phase 6: Blockchain Integration
- [ ] 6.1 Solidity smart contract (`SpiceRegistry.sol`) for batch hash anchoring and verification.
- [ ] 6.2 Local EVM development environment integration.
- [ ] 6.3 Web3 client service in FastAPI to submit batch hashes and read transaction receipts.
- [ ] 6.4 Transaction status handling: `Pending`, `Submitted`, `Confirmed`, `Failed`.
- [ ] 6.5 Hash integrity verification logic comparing DB hash against on-chain hash.

### Phase 7: Offline PWA & Sync Queue
- [ ] 7.1 Progressive Web App manifest and Service Worker caching.
- [ ] 7.2 IndexedDB storage client for offline harvest and resident entries.
- [ ] 7.3 Background sync queue manager with retry & conflict handling.
- [ ] 7.4 UI indicators: `Online`, `Offline`, `Syncing (N pending)`, `Sync Error`.

### Phase 8: Testing & Acceptance
- [ ] 8.1 Comprehensive backend test suite (unit + integration).
- [ ] 8.2 Frontend component tests and end-to-end user journey tests.
- [ ] 8.3 Demonstration data seed script with synthetic Banda Neira profiles.
- [ ] 8.4 User Guide and operator manual for village officers.
