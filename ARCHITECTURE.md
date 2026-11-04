# System Architecture & Technical Guidelines (ARCHITECTURE.md)

Technical Architecture and Engineering Principles for **Banda Digital Ecosystem**.

---

## 1. Architectural Principles

1. **Modular Monolith:**
   - Single unified backend API service hosting all functional modules (`population`, `farmers`, `harvests`, `traceability`, `blockchain`).
   - Single primary PostgreSQL database with PostGIS spatial extension.
   - Microservices are strictly out of scope for the MVP to prevent operational complexity.

2. **Decoupled Blockchain Subsystem:**
   - The primary source of operational truth is the PostgreSQL database.
   - Blockchain acts strictly as an **integrity verification & immutable audit layer**.
   - The blockchain client (`Web3.py`) is encapsulated in a dedicated service module. Failures or delays in blockchain transactions must never block or crash core application operations (use async task queues / transaction status polling).

3. **Privacy by Design:**
   - Personally Identifiable Information (PII) is kept isolated in the PostgreSQL database under RBAC protection.
   - Zero PII is committed to the blockchain. Only cryptographic hashes (e.g. SHA-256 of canonicalized event records), batch identifiers, and public verification tokens are anchored on-chain.

4. **Offline-First Resilience:**
   - Due to potential network intermittency in island regions, critical field inputs (harvest logging, farm surveys) are buffered locally using IndexedDB in a Progressive Web App (PWA) client.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                Frontend Client                                  |
|  React 18 + Vite + TypeScript + TanStack Query + Leaflet (OSM) + IndexedDB PWA  |
+---------------------------------------------------------------------------------+
                                      |
                        HTTPS / JSON REST API / JWT
                                      v
+---------------------------------------------------------------------------------+
|                               Backend Service                                   |
|                        Python 3.12+ / FastAPI / Pydantic                        |
|                                                                                 |
|  [ Auth & RBAC ]  [ Population ]  [ Farmers & Farms ]  [ Harvests & Batches ]   |
|         |               |                 |                    |                |
|  [ Audit Trail ]  [ QR Verification Engine ]  [ Blockchain Sync Adapter ]       |
+---------------------------------------------------------------------------------+
              |                                            |
         SQLAlchemy 2.0 (Async)                         Web3.py
              v                                            v
+-----------------------------+           +---------------------------------------+
|    PostgreSQL + PostGIS     |           |        Local EVM Smart Contract       |
|  - Users & Roles            |           |  - BatchRegistry.sol                  |
|  - Residents & Audit        |           |  - Anchor hashes                      |
|  - Farmers, Farms, Crops    |           |  - Verification events                |
|  - Batches & Trace Events   |           +---------------------------------------+
+-----------------------------+
```

---

## 3. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript | Fast build times, robust typing, ecosystem maturity |
| **State & Data Fetching** | TanStack Query (React Query) | Server-state caching, automatic retry, optimistic updates |
| **Offline Storage** | IndexedDB (via `idb`) + Service Worker | Offline record queueing for field officers & farmers |
| **Maps** | Leaflet + React-Leaflet + OSM | Lightweight GIS visualization without expensive proprietary map APIs |
| **Backend** | FastAPI (Python 3.12+) | High performance, native OpenAPI doc generation, asynchronous support |
| **Data Validation** | Pydantic v2 | Strict request/response parsing and serialization |
| **ORM & Migrations** | SQLAlchemy 2.0 + Alembic | Mature DB mapping and reliable schema migrations |
| **Database** | PostgreSQL 16 + PostGIS 3.4 | Standard enterprise relational DB with native geospatial geometry types |
| **Blockchain** | Solidity 0.8+, Web3.py, Hardhat/Anvil | Standard EVM compatibility; local testnet eliminates gas cost during dev |
| **Containerization** | Docker & Docker Compose | Uniform local development and reproducible deployments |

---

## 4. Repository & Directory Structure

```
.
├── AGENTS.md                  # Mandatory AI Agent instructions
├── README.md                  # Project overview & quickstart
├── SRS.md                     # Software Requirements Specification
├── ARCHITECTURE.md            # Technical Architecture (this document)
├── DATABASE.md                # Schema documentation & entities
├── API.md                     # API endpoints & contracts
├── TASKS.md                   # Roadmap & implementation checklist
├── CHANGELOG.md               # Version history
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── core/              # Config, security, permissions, errors
│   │   ├── database/          # Database engine, session, base model
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication & user management
│   │   │   ├── population/    # Resident management & verification
│   │   │   ├── farmers/       # Farmer & farmer group management
│   │   │   ├── farms/         # Farm mapping & PostGIS geometries
│   │   │   ├── harvests/      # Harvest records
│   │   │   ├── traceability/  # Batch processing, events, packaging
│   │   │   ├── blockchain/    # Web3 contract integration & hashing
│   │   │   ├── qr/            # QR Code generation & public verification
│   │   │   └── audit/         # Audit trail logging
│   │   └── common/            # Shared utilities & pagination schemas
│   ├── migrations/            # Alembic migration scripts
│   ├── tests/                 # Automated pytest test suites
│   ├── pyproject.toml         # Python dependencies and tool configs
│   └── Dockerfile             # Backend container image definition
│
├── frontend/
│   ├── src/
│   │   ├── app/               # App router, providers
│   │   ├── components/        # Reusable UI widgets
│   │   ├── layouts/           # Page layouts (Dashboard, Public)
│   │   ├── modules/           # Feature UI modules
│   │   ├── services/          # Axios / Fetch API clients
│   │   ├── hooks/             # Custom React & TanStack Query hooks
│   │   ├── offline/           # IndexedDB sync queue & service workers
│   │   └── utils/             # Helper utilities
│   ├── public/                # Static assets, icons, manifest
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── Dockerfile             # Frontend container image definition
│
├── blockchain/
│   ├── contracts/             # Solidity smart contracts
│   │   └── SpiceRegistry.sol
│   ├── scripts/               # Deployment and test scripts
│   └── hardhat.config.js      # Hardhat configuration
│
└── infrastructure/
    └── docker/
        └── docker-compose.yml # Multi-container orchestration (DB, API, Web)
```

---

## 5. Security Architecture

1. **Authentication:**
   - Password hashed with Argon2id / bcrypt.
   - Stateless JWT tokens (Access Token short-lived: 15-30m; Refresh Token stored securely: 7d).
2. **Authorization (RBAC):**
   - Hierarchical or role-permission matrix evaluated on every backend endpoint via FastAPI dependencies.
   - Roles: `admin`, `village_officer`, `farmer_group_admin`, `farmer`, `smart_tourism_admin`, `public`.
3. **Data Protection:**
   - Strict CORS configuration.
   - SQL Injection prevention through SQLAlchemy parameterized statements.
   - Input sanitization and validation via Pydantic schemas.
   - Rate limiting on public QR verification and login endpoints.
