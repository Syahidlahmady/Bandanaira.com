# KAMUS DATA DAN MODEL DATA KETERTELUSURAN
## Data Dictionary, Database Schemas, Pydantic Models & IPFS JSON Spec
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Sistem:** Ekosistem Digital Banda Neira  
**Standar Kepatuhan:** GS1 EPCIS 2.0 & W3C Verifiable Credentials

---

## 1. Skema Basis Data Relasional (PostgreSQL 15)

### 1.1. Tabel `harvests` (Pencatatan Panen & Tangkapan Nelayan)
Menyimpan data harian hasil panen kebun rempah atau pendaratan ikan tangkapan.

| Kolom | Tipe Data | Constraint | Deskripsi Fungsional |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Pengidentifikasi unik catatan panen. |
| `farmer_id` | `UUID` | `NOT NULL, REFERENCES residents(id)` | Relasi ke data kependudukan petani/nelayan. |
| `farm_id` | `UUID` | `NULLABLE, REFERENCES farms(id)` | Relasi ke poligon petak kebun (null untuk komoditas laut). |
| `commodity_type` | `VARCHAR(50)` | `NOT NULL` | Jenis komoditas: `pala`, `fuli`, `cengkeh`, `ikan_cakalang`, `tuna`. |
| `harvest_date` | `DATE` | `NOT NULL` | Tanggal pemetikan atau tanggal pendaratan ikan. |
| `quantity_kg` | `NUMERIC(10, 2)` | `NOT NULL, CHECK (quantity_kg > 0)` | Bobot komoditas yang dipanen dalam satuan kilogram. |
| `quality_grade` | `VARCHAR(50)` | `NOT NULL` | Mutu awal: `super_a`, `grade_b`, `sashimi_grade`, dll. |
| `moisture_content_pct` | `NUMERIC(5, 2)` | `NULLABLE, CHECK (moisture_content_pct BETWEEN 0 AND 100)` | Kadar air biji pala/cengkeh (null untuk ikan). |
| `notes` | `TEXT` | `NULLABLE` | Catatan lapangan (suhu palka, alat petik, cuaca). |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu sistem saat catatan disimpan. |

---

### 1.2. Tabel `product_batches` (Entitas Utama Batch Komoditas)
Menyimpan agregasi beberapa panen menjadi satu unit peredaran bertoken QR.

| Kolom | Tipe Data | Constraint | Deskripsi Fungsional |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Pengidentifikasi unik batch. |
| `batch_code` | `VARCHAR(64)` | `UNIQUE, NOT NULL` | Kode batch alfanumerik (misal: `BN-BTC-2026-001`). |
| `commodity_name` | `VARCHAR(100)` | `NOT NULL` | Nama komersial (misal: "Pala Banda Grade A Super"). |
| `category` | `VARCHAR(20)` | `NOT NULL, CHECK (category IN ('SPICE', 'MARINE'))` | Kategori komoditas: rempah atau perikanan. |
| `total_weight_kg` | `NUMERIC(10, 2)` | `NOT NULL, CHECK (total_weight_kg > 0)` | Total berat komoditas dalam batch. |
| `origin_village` | `VARCHAR(100)` | `NOT NULL` | Nama desa asal (misal: "Desa Lonthoir, Banda Besar"). |
| `status` | `VARCHAR(30)` | `DEFAULT 'draft'` | Siklus status: `draft`, `inspected`, `anchored`, `verified`. |
| `verification_token` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Token penelusuran publik untuk QR code. |
| `ipfs_metadata_cid` | `VARCHAR(128)` | `NULLABLE` | CID IPFS sertifikat laboratorium atau dokumen batch. |
| `latest_hash` | `VARCHAR(66)` | `NULLABLE` | SHA-256 digest 32-byte terkini berformat hex `0x...`. |
| `blockchain_tx_hash` | `VARCHAR(66)` | `NULLABLE` | Hash transaksi anchoring pada smart contract EVM. |
| `block_number` | `BIGINT` | `NULLABLE` | Tinggi blok saat transaksi dikonfirmasi di blockchain. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu pembuatan batch. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu pembaruan status batch. |

---

### 1.3. Tabel `batch_events` (Rantai Peristiwa Kritis / CTE)
Menyimpan setiap aksi pengolahan, pengeringan, pengasapan, inspeksi lab, atau alih kepemilikan.

| Kolom | Tipe Data | Constraint | Deskripsi Fungsional |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | ID unik peristiwa. |
| `batch_id` | `UUID` | `NOT NULL, REFERENCES product_batches(id)` | Relasi ke batch pemilik peristiwa. |
| `event_type` | `VARCHAR(50)` | `NOT NULL` | Kode peristiwa: `HARVESTED`, `DRIED`, `SMOKED`, `LAB_TESTED`. |
| `description` | `TEXT` | `NOT NULL` | Deskripsi detail proses operasional yang dilakukan. |
| `location` | `VARCHAR(150)` | `NOT NULL` | Lokasi fisik pelaksanaan kegiatan. |
| `event_hash` | `VARCHAR(66)` | `NOT NULL` | SHA-256 hash representasi data kanonikal peristiwa ini. |
| `cumulative_hash` | `VARCHAR(66)` | `NOT NULL` | Hash berantai gabungan dengan peristiwa sebelumnya. |
| `ipfs_cid` | `VARCHAR(128)` | `NULLABLE` | Bukti digital peristiwa (foto para-para/rumah asap/PDF). |
| `extra_metadata` | `JSONB` | `DEFAULT '{}'` | Metadata spesifik (kadar aflatoksin, suhu palka, durasi asap). |
| `actor_address` | `VARCHAR(42)` | `NULLABLE` | Alamat dompet digital penanggung jawab transaksi. |
| `timestamp` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Waktu terjadinya peristiwa. |

---

## 2. Skema Validasi Pydantic (Backend Data Contracts)

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from enum import Enum

class CommodityCategoryEnum(str, Enum):
    SPICE = "SPICE"
    MARINE = "MARINE"

class BatchCreateRequest(BaseModel):
    batch_code: str = Field(..., min_length=5, max_length=64, example="BN-BTC-2026-001")
    commodity_name: str = Field(..., min_length=3, max_length=100)
    category: CommodityCategoryEnum
    total_weight_kg: float = Field(..., gt=0)
    origin_village: str = Field(..., min_length=3)
    harvest_ids: List[str] = Field(..., min_items=1)

class BatchEventCreateRequest(BaseModel):
    event_type: str = Field(..., min_length=3, max_length=50, example="LAB_TESTED")
    description: str = Field(..., min_length=5)
    location: str = Field(..., min_length=3)
    ipfs_cid: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class PublicBatchVerificationResponse(BaseModel):
    batch_code: str
    commodity_name: str
    origin_village: str
    category: str
    status: str
    is_authentic: bool
    producer_display: str
    ipfs_metadata_cid: Optional[str]
    blockchain_proof: Dict[str, Any]
    events_timeline: List[Dict[str, Any]]
```

---

## 3. Spesifikasi Dokumen Metadata Terdesentralisasi IPFS (W3C / GS1 EPCIS)

Setiap batch yang di-anchor ke blockchain memiliki berkas metadata JSON lengkap yang diunggah ke IPFS dan diakses menggunakan CID.

**Contoh Metadata IPFS (`QmPalaBandaSuperGradeALonthoir2026CertCid`):**
```json
{
  "$schema": "https://ref.gs1.org/standards/epcis/2.0.0/epcis-schema.json",
  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": "2026-11-10T11:15:00Z",
  "epcisHeader": {
    "standardBusinessDocumentHeader": {
      "standard": "GS1 EPCIS / W3C Verifiable Credential",
      "version": "2.0",
      "sender": "did:pkh:eip155:11155111:0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "documentIdentification": {
        "instanceIdentifier": "BN-BTC-2026-001",
        "type": "GeographicIndicationCertificate"
      }
    }
  },
  "epcisBody": {
    "batchInformation": {
      "batchCode": "BN-BTC-2026-001",
      "commodityCategory": "SPICE",
      "productName": "Pala Banda Grade A Super",
      "botanicalName": "Myristica fragrans",
      "origin": {
        "island": "Banda Besar",
        "village": "Desa Lonthoir",
        "regency": "Maluku Tengah",
        "cadastralParcelVerified": true
      },
      "qualityAttributes": {
        "moistureContentPct": 9.2,
        "aflatoxinTotalPpb": 0.4,
        "essentialOilYieldPct": 11.8,
        "chemicalAdditives": "NONE_100_PERCENT_ORGANIC",
        "giCertificationStatus": "OFFICIALLY_CERTIFIED_BANDA_NUTMEG"
      },
      "blockchainProof": {
        "network": "Ethereum Sepolia Testnet",
        "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "blockHeight": 18492041,
        "canonicalSha256": "0x3cf374fa078fe1a221f70dd2e54eb8671607efea74f14144415cfbb281862f9d"
      }
    }
  }
}
```

---

*Disetujui untuk rujukan model data arsitektur - Khoirul Anam.*
