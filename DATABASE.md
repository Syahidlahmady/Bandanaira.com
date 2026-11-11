# Database Schema & Entity Design (DATABASE.md)

Documentation of data models, relationships, and constraints for **Banda Digital Ecosystem**.

---

## 1. Design Principles & Guidelines

1. **Primary Keys:** Standard UUIDv4 for all primary entities to avoid sequential enumeration attacks.
2. **Timestamps:** Every table must include `created_at` (TIMESTAMPTZ default `now()`) and `updated_at` (TIMESTAMPTZ default `now()`).
3. **Soft Deletes:** Critical business entities use `is_active` or `deleted_at` to preserve auditability.
4. **Foreign Keys:** Explicit foreign keys with appropriate `ON DELETE RESTRICT` or `ON DELETE CASCADE` actions.
5. **Spatial Data:** Farm boundaries and points use PostGIS geometry types (e.g. `GEOMETRY(Polygon, 4326)` or `GEOMETRY(Point, 4326)`).
6. **No PII on Chain:** Sensitive resident information is kept exclusively inside the relational DB.

---

## 2. Entity Groups & Tables

### 2.1 Authentication & Authorization
- **`users`**
  - `id`: UUID (PK)
  - `email`: VARCHAR(255) (UNIQUE, NOT NULL)
  - `username`: VARCHAR(100) (UNIQUE, NOT NULL)
  - `password_hash`: VARCHAR(255) (NOT NULL)
  - `full_name`: VARCHAR(255) (NOT NULL)
  - `is_active`: BOOLEAN (DEFAULT TRUE)
  - `is_superuser`: BOOLEAN (DEFAULT FALSE)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`roles`**
  - `id`: UUID (PK)
  - `name`: VARCHAR(50) (UNIQUE, NOT NULL) - e.g. `admin`, `village_officer`, `farmer`, `farmer_group_admin`
  - `description`: TEXT
- **`user_roles`**
  - `user_id`: UUID (FK -> users.id)
  - `role_id`: UUID (FK -> roles.id)
  - Primary Key: (`user_id`, `role_id`)

### 2.2 Population Module
- **`residents`**
  - `id`: UUID (PK)
  - `nik`: VARCHAR(16) (UNIQUE, NOT NULL) - *Synthetic for development*
  - `full_name`: VARCHAR(255) (NOT NULL)
  - `gender`: VARCHAR(10) (NOT NULL)
  - `birth_place`: VARCHAR(100)
  - `birth_date`: DATE
  - `address`: TEXT
  - `rt`: VARCHAR(5)
  - `rw`: VARCHAR(5)
  - `village`: VARCHAR(100) (DEFAULT 'Banda Neira')
  - `religion`: VARCHAR(50)
  - `marital_status`: VARCHAR(50)
  - `occupation`: VARCHAR(100)
  - `phone_number`: VARCHAR(20)
  - `verification_status`: VARCHAR(20) (DEFAULT 'pending') - `pending`, `verified`, `rejected`
  - `verified_by`: UUID (FK -> users.id, NULLABLE)
  - `verified_at`: TIMESTAMPTZ (NULLABLE)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`administrative_requests`**
  - `id`: UUID (PK)
  - `resident_id`: UUID (FK -> residents.id)
  - `request_type`: VARCHAR(100) (e.g. 'Surat Keterangan Usaha Rempah', 'Surat Domisili')
  - `status`: VARCHAR(50) (DEFAULT 'submitted') - `submitted`, `in_review`, `approved`, `rejected`
  - `notes`: TEXT
  - `created_at`, `updated_at`: TIMESTAMPTZ

### 2.3 Farmers & Farms Module
- **`farmer_groups`**
  - `id`: UUID (PK)
  - `name`: VARCHAR(255) (NOT NULL)
  - `leader_name`: VARCHAR(255)
  - `village`: VARCHAR(100) (DEFAULT 'Banda Neira')
  - `contact_number`: VARCHAR(20)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`farmers`**
  - `id`: UUID (PK)
  - `user_id`: UUID (FK -> users.id, NULLABLE)
  - `resident_id`: UUID (FK -> residents.id, NULLABLE)
  - `farmer_code`: VARCHAR(50) (UNIQUE, NOT NULL) - e.g. `BN-FRM-001`
  - `farmer_group_id`: UUID (FK -> farmer_groups.id, NULLABLE)
  - `name`: VARCHAR(255) (NOT NULL)
  - `phone`: VARCHAR(20)
  - `status`: VARCHAR(20) (DEFAULT 'active')
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`farms`**
  - `id`: UUID (PK)
  - `farmer_id`: UUID (FK -> farmers.id, NOT NULL)
  - `farm_code`: VARCHAR(50) (UNIQUE, NOT NULL) - e.g. `BN-FARM-001`
  - `name`: VARCHAR(255) (NOT NULL)
  - `location_description`: TEXT
  - `coordinates`: GEOMETRY(Point, 4326) (NULLABLE)
  - `polygon_boundary`: GEOMETRY(Polygon, 4326) (NULLABLE)
  - `area_sqm`: NUMERIC(12, 2)
  - `primary_commodity`: VARCHAR(100) - e.g. 'Pala' (Nutmeg), 'Cengkih' (Clove)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`harvests`**
  - `id`: UUID (PK)
  - `farm_id`: UUID (FK -> farms.id, NOT NULL)
  - `farmer_id`: UUID (FK -> farmers.id, NOT NULL)
  - `harvest_code`: VARCHAR(50) (UNIQUE, NOT NULL) - e.g. `BN-HRV-2026-0001`
  - `commodity`: VARCHAR(100) (NOT NULL)
  - `harvest_date`: DATE (NOT NULL)
  - `quantity_kg`: NUMERIC(10, 2) (NOT NULL)
  - `quality_grade`: VARCHAR(20) - e.g. 'Grade A', 'Grade B'
  - `notes`: TEXT
  - `created_at`, `updated_at`: TIMESTAMPTZ

### 2.4 Traceability & Batches Module
- **`product_batches`**
  - `id`: UUID (PK)
  - `batch_code`: VARCHAR(50) (UNIQUE, NOT NULL) - e.g. `BN-BTC-2026-0001`
  - `commodity`: VARCHAR(100) (NOT NULL)
  - `total_quantity_kg`: NUMERIC(10, 2) (NOT NULL)
  - `production_date`: DATE (NOT NULL)
  - `public_verification_token`: VARCHAR(64) (UNIQUE, NOT NULL) - *used in QR URL*
  - `status`: VARCHAR(50) (DEFAULT 'created') - `created`, `processing`, `packaged`, `distributed`
  - `blockchain_status`: VARCHAR(50) (DEFAULT 'pending') - `pending`, `submitted`, `confirmed`, `failed`
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`batch_harvests`** (Many-to-many junction table between harvests and product_batches)
  - `batch_id`: UUID (FK -> product_batches.id)
  - `harvest_id`: UUID (FK -> harvests.id)
  - `allocated_quantity_kg`: NUMERIC(10, 2) NOT NULL
  - Primary Key: (`batch_id`, `harvest_id`)
- **`batch_events`**
  - `id`: UUID (PK)
  - `batch_id`: UUID (FK -> product_batches.id, NOT NULL)
  - `event_type`: VARCHAR(50) (NOT NULL) - `harvest_aggregated`, `fermentation`, `drying`, `sorting`, `packaging`, `transfer`
  - `event_timestamp`: TIMESTAMPTZ (NOT NULL)
  - `recorded_by_user_id`: UUID (FK -> users.id, NOT NULL)
  - `location`: VARCHAR(255)
  - `description`: TEXT
  - `metadata_json`: JSONB
  - `event_hash`: VARCHAR(64) (NOT NULL) - *SHA-256 of canonical event representation*
  - `previous_event_hash`: VARCHAR(64) (NULLABLE)
  - `created_at`: TIMESTAMPTZ

### 2.5 Blockchain & Audit Logging
- **`blockchain_transactions`**
  - `id`: UUID (PK)
  - `batch_id`: UUID (FK -> product_batches.id, NOT NULL)
  - `event_id`: UUID (FK -> batch_events.id, NULLABLE)
  - `transaction_hash`: VARCHAR(66) (NULLABLE)
  - `block_number`: BIGINT (NULLABLE)
  - `contract_address`: VARCHAR(42) (NOT NULL)
  - `data_hash`: VARCHAR(66) (NOT NULL)
  - `status`: VARCHAR(30) (DEFAULT 'pending') - `pending`, `submitted`, `confirmed`, `failed`
  - `submitted_at`: TIMESTAMPTZ (NULLABLE)
  - `confirmed_at`: TIMESTAMPTZ (NULLABLE)
  - `error_message`: TEXT (NULLABLE)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`audit_logs`**
  - `id`: UUID (PK)
  - `user_id`: UUID (FK -> users.id, NULLABLE)
  - `action`: VARCHAR(100) (NOT NULL) - e.g. `CREATE_RESIDENT`, `VERIFY_RESIDENT`, `CREATE_BATCH`
  - `entity_name`: VARCHAR(100) (NOT NULL)
  - `entity_id`: UUID (NOT NULL)
  - `changes_json`: JSONB (NULLABLE)
  - `ip_address`: VARCHAR(45) (NULLABLE)
  - `created_at`: TIMESTAMPTZ (DEFAULT now())

### 2.6 Koperasi Hatta & Dispenser Air (Phase 18)
- **`coop_accounts`**
  - `id`: UUID (PK)
  - `nik`: VARCHAR(16) (UNIQUE, NOT NULL)
  - `balance_rp`: NUMERIC(12, 2) (DEFAULT 0)
  - `water_quota_liters`: NUMERIC(10, 2) (DEFAULT 0)
  - `waste_points`: INT (DEFAULT 0)
  - `total_commodities_kg`: NUMERIC(10, 2) (DEFAULT 0)
  - `total_plastic_kg`: NUMERIC(10, 2) (DEFAULT 0)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`coop_transactions`**
  - `id`: UUID (PK)
  - `account_id`: UUID (FK -> coop_accounts.id)
  - `transaction_type`: VARCHAR(50) NOT NULL (`DEPOSIT_COMMODITY`, `DEPOSIT_WASTE`, `REDEEM_WATER`)
  - `commodity_type`: VARCHAR(50) (NULLABLE)
  - `weight_kg`: NUMERIC(10, 2) (DEFAULT 0)
  - `amount_rp`: NUMERIC(12, 2) (DEFAULT 0)
  - `water_liters`: NUMERIC(10, 2) (DEFAULT 0)
  - `points_awarded`: INT (DEFAULT 0)
  - `blockchain_hash`: VARCHAR(64) (Deterministic SHA-256 receipt hash)
  - `created_at`: TIMESTAMPTZ

### 2.7 IoT Telemetry & Island Resiliency (Phase 19)
- **`iot_telemetry_logs`**
  - `id`: UUID (PK)
  - `station_code`: VARCHAR(50) (NOT NULL, INDEXED)
  - `station_name`: VARCHAR(100) (NOT NULL)
  - `island_name`: VARCHAR(50) (NOT NULL)
  - `raw_water_tds_ppm`: FLOAT (NOT NULL)
  - `filtered_water_tds_ppm`: FLOAT (NOT NULL)
  - `clean_tank_level_pct`: FLOAT (NOT NULL)
  - `daily_dispensed_liters`: FLOAT (NOT NULL)
  - `valve_status`: VARCHAR(20) (DEFAULT 'OPEN')
  - `active_power_source`: VARCHAR(40) NOT NULL (`SOLAR_GRAVITY_MIX`, `DIESEL_GRID`)
  - `solar_voltage_v`: FLOAT (DEFAULT 0)
  - `solar_current_a`: FLOAT (DEFAULT 0)
  - `solar_power_watts`: FLOAT (DEFAULT 0)
  - `battery_soc_pct`: FLOAT (DEFAULT 0)
  - `diesel_saved_liters_est`: FLOAT (DEFAULT 0)
  - `alert_flags`: JSON (NULLABLE)
  - `created_at`: TIMESTAMPTZ

### 2.8 Smart Tourism & Eco-Stay (Phase 20)
- **`accommodations`**
  - `id`: UUID (PK)
  - `name`: VARCHAR(150) (NOT NULL)
  - `type`: VARCHAR(50) (DEFAULT 'HOMESTAY')
  - `island_name`: VARCHAR(100) (NOT NULL)
  - `price_per_night_rp`: NUMERIC(12, 2) (NOT NULL)
  - `rooms_available`: INT (DEFAULT 5)
  - `has_clean_ro_water`: BOOLEAN (DEFAULT TRUE)
  - `has_solar_backup`: BOOLEAN (DEFAULT TRUE)
  - `eco_stay_badge`: BOOLEAN (DEFAULT TRUE)
  - `contact_whatsapp`: VARCHAR(20) (NOT NULL)
  - `created_at`, `updated_at`: TIMESTAMPTZ
- **`bookings`**
  - `id`: UUID (PK)
  - `booking_code`: VARCHAR(30) (UNIQUE, INDEXED)
  - `accommodation_id`: UUID (FK -> accommodations.id)
  - `guest_name`: VARCHAR(150) (NOT NULL)
  - `guest_whatsapp`: VARCHAR(20) (NOT NULL)
  - `check_in`: DATE, `check_out`: DATE
  - `total_nights`: INT, `rooms_count`: INT
  - `total_price_rp`: NUMERIC(12, 2)
  - `status`: VARCHAR(30) (DEFAULT 'PENDING')
  - `wa_link`: TEXT (Direct click-to-chat WhatsApp confirmation URL)
  - `created_at`, `updated_at`: TIMESTAMPTZ

### 2.9 7-Layer Spatial GIS (Phase 21)
- **`spatial_features`**
  - `id`: UUID (PK)
  - `name`: VARCHAR(150) (INDEXED, NOT NULL)
  - `layer_type`: VARCHAR(50) (INDEXED, NOT NULL) - `LAYER_TOURISM_4A`, `LAYER_HERITAGE`, `LAYER_ACCOMMODATION`, `LAYER_KOPERASI_UMKM`, `LAYER_PUBLIC_SAFETY`, `LAYER_WATER_INFRA`, `LAYER_ENERGY_WASTE`
  - `category`: VARCHAR(30) (DEFAULT 'publik') - `publik` or `resiliensi`
  - `island_name`: VARCHAR(50) (INDEXED, NOT NULL)
  - `latitude`: FLOAT, `longitude`: FLOAT
  - `geometry_geojson`: JSON (GeoJSON Point/Polygon geometry)
  - `properties_meta`: JSON (Dynamic properties, TDS, solar mix, historical narrative)
  - `description`: TEXT
  - `is_active`: BOOLEAN (DEFAULT TRUE)
  - `created_at`, `updated_at`: TIMESTAMPTZ

### 2.10 Cryptographic NIK Hardening (Phase 22)
- Added to **`residents`**:
  - `nik_encrypted`: TEXT (AES-256-GCM symmetric encryption with 12-byte random IV)
  - `nik_blind_index`: VARCHAR(64) (HMAC-SHA256 one-way deterministic hash with server secret salt for $O(1)$ search)

### 2.11 Dynamic Field Surveys & NoSQL/PostGIS ETL Pipeline (Phase 23)
- **`raw_surveys`**
  - `id`: UUID (PK)
  - `survey_code`: VARCHAR(30) (UNIQUE, INDEXED)
  - `collector_name`: VARCHAR(120) (NOT NULL)
  - `problem_domain`: VARCHAR(40) (INDEXED) - `AIR_DAN_SAMPAH`, `ENERGI`, `EKONOMI`, `WISATA`, `BUDAYA`
  - `island_name`: VARCHAR(50) (INDEXED, NOT NULL)
  - `village_name`: VARCHAR(100), `rt_rw`: VARCHAR(30)
  - `latitude`: FLOAT, `longitude`: FLOAT
  - `title`: VARCHAR(200) (NOT NULL)
  - `urgency_level`: VARCHAR(20) (DEFAULT 'SEDANG')
  - `flexible_attributes`: JSON (Dynamic NoSQL Key-Value pairs without schema restrictions)
  - `photo_evidence_url`: VARCHAR(255)
  - `notes`: TEXT
  - `etl_status`: VARCHAR(30) (DEFAULT 'PENDING') - `PENDING`, `MIGRATED_TO_POSTGRES`, `REJECTED`
  - `migrated_feature_id`: UUID (FK -> spatial_features.id, SET NULL)
  - `created_at`, `updated_at`: TIMESTAMPTZ

---

## 3. Database Migration Policy
1. Every schema change must be created via Alembic migrations.
2. Inspect generated migration files before applying with `alembic upgrade head`.
3. Never drop tables or columns directly in live environments.
4. All 11 migrations are tracked deterministically in `backend/migrations/versions/`.
