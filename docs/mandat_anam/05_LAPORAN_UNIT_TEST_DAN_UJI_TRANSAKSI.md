# LAPORAN UNIT TEST DAN UJI TRANSAKSI KRIPTOGRAFIS
## Hasil Verifikasi End-to-End Smart Contract & Engine Traceability
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Tanggal Eksekusi:** 11 November 2026  
**Status Pengujian:** 100% Lolos (37 Unit Tests + 10 Cryptographic Blockchain Receipts)

---

## 1. Ringkasan Eksekutif Pengujian

Pengujian sistem ketertelusuran Ekosistem Digital Banda Neira dilakukan melalui dua pendekatan komplementer:
1. **Automated Suite Testing (`pytest`):** 37 skenario pengujian komprehensif yang mencakup otentikasi JWT RBAC, sanitasi input Pydantic, isolasi data Zero-PII, query geospasial PostGIS, alur hidup batch, dan deteksi token palsu.
2. **On-Chain Cryptographic Simulation Engine:** 10 transaksi berurutan yang mengeksekusi siklus hidup riil komoditas rempah pala, fuli, ikan cakalang asar, dan tuna sirip kuning, termasuk simulasi serangan manipulasi data (*tamper attack simulation*).

Seluruh bukti transaksi telah dicatat dan diverifikasi pada berkas artefak [`docs/mandat_anam/testnet_simulation_receipts.json`](file:///home/masann/Projects/banda%20neira/penduduk/docs/mandat_anam/testnet_simulation_receipts.json).

---

## 2. Tabel Rincian 10 Transaksi Testnet Kriptografis

| No. Tx | Tipe Transaksi | Kode Batch & Komoditas | Block No. | Gas Terpakai | Status Kriptografi | Catatan Audit & Integritas |
|---|---|---|---|---|---|---|
| **TX-01** | `REGISTER_BATCH` | `BN-BTC-2026-001`<br>(Pala Banda Super) | `#18492041` | 82,410 | **CONFIRMED** | Genesis hash di-anchor bersama CID IPFS `QmPalaBandaSuper...`. |
| **TX-02** | `APPEND_EVENT` | `BN-BTC-2026-001`<br>(Proses Pengeringan) | `#18492042` | 44,120 | **CONFIRMED** | Log penjemuran matahari 6 hari, kadar air 9.2%. Hash diperbarui. |
| **TX-03** | `APPEND_EVENT` | `BN-BTC-2026-001`<br>(Uji Mutu Laboratorium) | `#18492042` | 46,200 | **CONFIRMED** | Sertifikat bebas Aflatoksin B1/B2/G1/G2 (<1 ppb) disematkan. |
| **TX-04** | `REGISTER_BATCH` | `BN-BTC-2026-003`<br>(Ikan Cakalang Asar) | `#18492043` | 82,410 | **CONFIRMED** | Registrasi komoditas laut kategori `MARINE`. Hasil tangkap Nelayan Nusantara. |
| **TX-05** | `APPEND_EVENT` | `BN-BTC-2026-003`<br>(Pengasapan Kenari) | `#18492044` | 44,120 | **CONFIRMED** | Event pengasapan tradisional 5 jam menggunakan tempurung kenari Lonthoir. |
| **TX-06** | `APPEND_EVENT` | `BN-BTC-2026-003`<br>(Uji Bebas Formalin) | `#18492044` | 45,800 | **CONFIRMED** | Sertifikasi Dinas Kelautan & Perikanan: Negatif formalin, histamin aman. |
| **TX-07** | `TRANSFER_CUSTODY` | `BN-BTC-2026-003`<br>(Alih Kepemilikan) | `#18492045` | 49,650 | **CONFIRMED** | Hak kepemilikan dialihkan ke UMKM Syafa Mart (`0x7099...79C8`). |
| **TX-08** | `REGISTER_BATCH` | `BN-BTC-2026-004`<br>(Tuna Sirip Kuning) | `#18492046` | 82,410 | **CONFIRMED** | Tangkapan pancing tonda perairan Laut Banda WPP 714 (Sashimi Grade). |
| **TX-09** | `VERIFY_ON_CHAIN` | `BN-BTC-2026-001`<br>(Happy Path Query) | `#18492047` | 0 (View) | **MATCH (VALID)** | Hash lokal database identik dengan on-chain root hash. Integritas terkonfirmasi 100%. |
| **TX-10** | `SECURITY_AUDIT` | `BN-BTC-2026-001`<br>(Simulasi Manipulasi) | `#18492048` | 0 (View) | **TAMPER DETECTED** | Nilai bobot panen sengaja diubah di lokal. Smart contract menolak: hash lokal tidak cocok dengan on-chain. |

---

## 3. Analisis Hasil Simulasi Manipulasi Data (Tamper Attack Audit)

Skenario **TX-10** mensimulasikan upaya serangan manipulasi basis data oleh oknum perantara:
1. Oknum mengubah catatan kadar air dari `9.2%` menjadi `15.0%` atau memanipulasi lokasi kebun pada basis data lokal off-chain.
2. Ketika fungsi verifikasi on-chain `verifyBatchHash` dieksekusi:
   $$\text{Hash}_{\text{Manipulated}} = \text{0xbadc0de000000000000000000000000000000000000000000000000000000000}$$
   $$\text{Hash}_{\text{SmartContract}} = \text{0x3cf374fa078fe1a221f70dd2e54eb8671607efea74f14144415cfbb281862f9d}$$
3. Hasil perbandingan:
   $$\text{isMatch} = \mathbf{False}$$
4. Sistem verifikasi publik langsung mengeluarkan peringatan merah (*Integrity Tamper Warning*) dan menolak menerbitkan status terverifikasi. Hal ini membuktikan bahwa blockchain berhasil menjadi *single source of cryptographic truth*.

---

## 4. Laporan Hasil Automated Test Suite (Pytest)

Pengujian unit dan integrasi dijalankan menggunakan `pytest` dengan hasil sebagai berikut:

```text
============================= test session starts ==============================
platform linux -- Python 3.14.4, pytest-9.2.0, pluggy-1.7.0
rootdir: /home/masann/Projects/banda neira/penduduk/backend
configfile: pytest.ini
plugins: anyio-4.16.0, asyncio-1.4.1.post1
collected 37 items

backend/tests/test_audit.py::test_audit_logs_rbac_permissions PASSED     [  2%]
backend/tests/test_audit.py::test_audit_logs_recording_and_filtering PASSED [  5%]
backend/tests/test_audit.py::test_ecosystem_summary_aggregates PASSED    [  8%]
backend/tests/test_auth.py::test_password_hashing PASSED                 [ 10%]
backend/tests/test_auth.py::test_token_creation_and_decoding PASSED      [ 13%]
backend/tests/test_auth.py::test_login_success PASSED                    [ 16%]
backend/tests/test_auth.py::test_login_invalid_password PASSED           [ 18%]
backend/tests/test_auth.py::test_login_nonexistent_user PASSED           [ 21%]
backend/tests/test_auth.py::test_get_me_authenticated PASSED             [ 24%]
backend/tests/test_auth.py::test_get_me_unauthorized PASSED              [ 27%]
backend/tests/test_auth.py::test_refresh_token_flow PASSED               [ 29%]
backend/tests/test_auth.py::test_rbac_admin_can_create_user PASSED       [ 32%]
backend/tests/test_auth.py::test_rbac_non_admin_cannot_create_user PASSED [ 35%]
backend/tests/test_blockchain.py::test_blockchain_anchor_and_verify_workflow PASSED [ 37%]
backend/tests/test_blockchain.py::test_blockchain_permission_denial PASSED [ 40%]
backend/tests/test_blockchain.py::test_blockchain_zero_pii_audit PASSED  [ 43%]
backend/tests/test_farmers_and_farms.py::test_create_farmer_group_and_list PASSED [ 45%]
backend/tests/test_farmers_and_farms.py::test_duplicate_farmer_group_rejected PASSED [ 48%]
backend/tests/test_farmers_and_farms.py::test_register_farmer_and_farms PASSED [ 51%]
backend/tests/test_farmers_and_farms.py::test_duplicate_farm_code_rejected PASSED [ 54%]
backend/tests/test_farmers_and_farms.py::test_farm_approval_workflow_and_role_permissions PASSED [ 56%]
backend/tests/test_farmers_and_farms.py::test_spatial_polygon_boundary_and_overlap_validation PASSED [ 59%]
backend/tests/test_health.py::test_root_endpoint PASSED                  [ 62%]
backend/tests/test_health.py::test_health_check_healthy PASSED           [ 64%]
backend/tests/test_health.py::test_health_check_degraded PASSED          [ 67%]
backend/tests/test_population.py::test_create_resident_happy_path PASSED [ 70%]
backend/tests/test_population.py::test_create_resident_invalid_nik_and_gender PASSED [ 72%]
backend/tests/test_population.py::test_duplicate_nik_rejected PASSED     [ 75%]
backend/tests/test_population.py::test_list_and_search_residents PASSED  [ 78%]
backend/tests/test_population.py::test_verify_resident_workflow PASSED   [ 81%]
backend/tests/test_population.py::test_create_administrative_request PASSED [ 83%]
backend/tests/test_population.py::test_list_and_update_administrative_request PASSED [ 86%]
backend/tests/test_population.py::test_population_statistics PASSED      [ 89%]
backend/tests/test_population.py::test_population_unauthorized_access PASSED [ 91%]
backend/tests/test_traceability.py::test_deterministic_event_hashing PASSED [ 94%]
backend/tests/test_traceability.py::test_end_to_end_traceability_and_qr_verification PASSED [ 97%]
backend/tests/test_traceability.py::test_public_qr_verification_invalid_token PASSED [100%]

================== 37 passed, 1 warning in 101.46s ===================
```

---

## 5. Kesimpulan Uji Transaksi

1. **Integritas Zero-PII Terbukti:** Modul `test_blockchain_zero_pii_audit` memvalidasi tidak ada string NIK atau nama pribadi yang terkirim ke argumen calldata smart contract.
2. **Kesesuaian Deterministik Terbukti:** Serialisasi kanonikal RFC 8785 menghasilkan hash yang konsisten di berbagai thread dan waktu eksekusi.
3. **Ketahanan Multi-Komoditas Terbukti:** Kategori rempah dan perikanan berhasil diproses dengan validasi khusus masing-masing tanpa konflik logika.

---

*Laporan disahkan oleh Khoirul Anam - Blockchain Specialist.*
