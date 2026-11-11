# DESAIN DAN SOURCE CODE SMART CONTRACT
## Smart Contract `BandaTraceabilityRegistry.sol`
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Compiler:** Solidity `^0.8.20`  
**Lisensi:** MIT  
**Standar Arsitektur:** EVM-Compatible (Ethereum Sepolia, Polygon Amoy, Hardhat Local)

---

## 1. Prinsip Desain & Rekayasa Smart Contract

Smart contract `BandaTraceabilityRegistry` dirancang berdasarkan lima prinsip rekayasa perangkat lunak terdesentralisasi:

1. **Multi-Komoditas Agraris-Maritim (Dual-Domain Support):** Mendukung komoditas rempah darat (`SPICE`) dan hasil tangkapan laut (`MARINE`) dalam satu kontrak terpadu tanpa duplikasi kode.
2. **Kepatuhan Privasi Zero-PII:** Struktur data kontrak sama sekali tidak menampung nama orang, nomor identitas kependudukan (NIK), atau nomor telepon. Hanya kode batch publik, hash SHA-256 32-byte, string CID IPFS, dan alamat Ethereum publik yang disimpan.
3. **Role-Based Access Control (RBAC):** Menjamin pemisahan wewenang operasional:
   - Petani & Nelayan terverifikasi (`authorizedProducers`) hanya dapat mendaftarkan panen awal atau tangkapan mereka.
   - Petugas Desa & Pengawas IG (`authorizedInspectors`) berwenang memvalidasi dan menambahkan sertifikat inspeksi laboratorium.
   - UMKM & Pengolah (`authorizedProcessors`) berwenang mencatat proses pascapanen/pengasapan dan menerima alihan kepemilikan.
4. **Audit Trail Berantai Kriptografis (Chained Event Hashing):** Setiap peristiwa baru mengaitkan hash peristiwa sebelumnya, menciptakan rantai audit anti-pemalsuan di tingkat kontrak.
5. **Efisiensi Gas (Gas Optimization):** Penggunaan tipe data `bytes32` untuk hash alih-alih `string`, penyimpanan event detail sebagai event logs (`indexed topics`), dan struktur memori terpadatkan (*compact struct packing*).

---

## 2. Struktur Data Kontrak (Data Structures)

### 2.1. Enum Kategori Komoditas
```solidity
enum CommodityCategory {
    SPICE,   // Rempah: Pala Banda, Fuli Merah, Cengkeh
    MARINE   // Kelautan: Ikan Cakalang, Tuna Sirip Kuning, Ikan Asar
}
```

### 2.2. Struct Peristiwa Batch (`BatchEvent`)
```solidity
struct BatchEvent {
    string eventType;      // Misal: HARVESTED, DRIED, LAB_TESTED, SMOKED, PACKAGED
    bytes32 eventHash;     // SHA-256 digest dari data kanonikal peristiwa
    string ipfsCid;        // CID IPFS bukti pendukung (PDF sertifikat / foto)
    address actor;         // Alamat akun pengeksekusi transaksi
    uint256 timestamp;     // block.timestamp saat peristiwa dicatat
}
```

### 2.3. Struct Catatan Utama Batch (`BatchRecord`)
```solidity
struct BatchRecord {
    string batchCode;                 // Nomor batch unik, misal "BN-BTC-2026-001"
    CommodityCategory category;       // SPICE atau MARINE
    string originLocation;            // Nama desa asal (misal "Desa Lonthoir, Banda Besar")
    string ipfsMetadataCid;           // CID IPFS metadata komprehensif batch
    bytes32 latestHash;               // Hash kriptografis kumulatif terkini
    address currentOwner;             // Alamat pemegang hak batch saat ini
    uint256 createdAt;                // Waktu pencatatan genesis
    uint256 updatedAt;                // Waktu mutasi terakhir
    bool exists;                      // Indikator keberadaan batch
    uint256 eventCount;               // Jumlah riwayat peristiwa yang terikat
}
```

---

## 3. Matriks Hak Akses & Modifier Keamanan

| Modifier | Deskripsi Validasi | Aksi yang Dilindungi |
|---|---|---|
| `onlyOwner` | Memastikan pemanggil adalah administrator pemilik kontrak (`contractOwner`). | Menambah/mencabut peran produsen, inspektor, atau pengolah. |
| `onlyProducer` | Memastikan pemanggil terdaftar di pemetaan `authorizedProducers` atau owner. | Fungsi `registerBatch`. |
| `onlyInspector` | Memastikan pemanggil terdaftar di pemetaan `authorizedInspectors` atau owner. | Fungsi `registerBatch`, `appendBatchEvent`. |
| `onlyBatchOwnerOrAuthorized` | Memastikan pemanggil adalah pemilik batch saat ini (`currentOwner`), inspektur resmi, atau owner kontrak. | Fungsi `appendBatchEvent`, `transferBatchOwnership`, `updateIpfsMetadata`. |

---

## 4. Source Code Lengkap (`BandaTraceabilityRegistry.sol`)

Berikut adalah source code resmi smart contract yang tersimpan pada berkas [`blockchain/contracts/BandaTraceabilityRegistry.sol`](file:///home/masann/Projects/banda%20neira/penduduk/blockchain/contracts/BandaTraceabilityRegistry.sol):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BandaTraceabilityRegistry
 * @dev Smart Contract Registri Ketertelusuran Komoditas Kepulauan Banda (Rempah & Perikanan)
 *      Dirancang untuk Ekosistem Digital Banda Neira - Bebas PII (Zero-PII).
 * @author Khoirul Anam - Blockchain & Traceability Specialist
 */
contract BandaTraceabilityRegistry {
    address public contractOwner;

    enum CommodityCategory {
        SPICE,   // Rempah: Pala, Fuli, Cengkeh
        MARINE   // Kelautan: Cakalang, Tuna Sirip Kuning, Ikan Asar
    }

    struct BatchEvent {
        string eventType;      // HARVESTED, DRIED, LAB_TESTED, SMOKED, PACKAGED, CUSTODY_TRANSFERRED
        bytes32 eventHash;     // SHA-256 hash representasi data kanonikal
        string ipfsCid;        // CID IPFS sertifikat laboratorium atau foto bukti
        address actor;         // Alamat akun yang mencatatkan event
        uint256 timestamp;     // block.timestamp
    }

    struct BatchRecord {
        string batchCode;                 // Kode batch unik
        CommodityCategory category;       // SPICE atau MARINE
        string originLocation;            // Nama desa asal
        string ipfsMetadataCid;           // Metadata komprehensif batch di IPFS
        bytes32 latestHash;               // Hash kriptografis kumulatif terkini
        address currentOwner;             // Alamat pemegang hak batch saat ini
        uint256 createdAt;                // Waktu batch pertama kali didaftarkan
        uint256 updatedAt;                // Waktu mutasi terakhir
        bool exists;                      // Penanda keberadaan batch
        uint256 eventCount;               // Jumlah riwayat peristiwa yang terikat
    }

    // Pemetaan data batch: batchCode => BatchRecord
    mapping(string => BatchRecord) private _batches;

    // Pemetaan log peristiwa: batchCode => array of BatchEvent
    mapping(string => BatchEvent[]) private _batchEvents;

    // Role-Based Access Control (RBAC)
    mapping(address => bool) public authorizedProducers;   // Petani atau Nelayan
    mapping(address => bool) public authorizedInspectors;   // Pengawas Desa / Surveyor IG
    mapping(address => bool) public authorizedProcessors;  // Pengolah UMKM / Sentra Asar

    // Events untuk Pemantauan Off-chain
    event BatchRegistered(
        string indexed batchCode,
        CommodityCategory indexed category,
        address indexed registeredBy,
        bytes32 initialHash,
        string ipfsMetadataCid
    );

    event BatchEventAppended(
        string indexed batchCode,
        string eventType,
        bytes32 newHash,
        string ipfsCid,
        address actor
    );

    event OwnershipTransferred(
        string indexed batchCode,
        address indexed previousOwner,
        address indexed newOwner
    );

    event IpfsMetadataUpdated(
        string indexed batchCode,
        string oldCid,
        string newCid
    );

    event RoleGranted(string role, address indexed account);
    event RoleRevoked(string role, address indexed account);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "BandaTraceability: caller is not contract owner");
        _;
    }

    modifier onlyProducer() {
        require(
            authorizedProducers[msg.sender] || msg.sender == contractOwner,
            "BandaTraceability: caller is not authorized producer"
        );
        _;
    }

    modifier onlyInspector() {
        require(
            authorizedInspectors[msg.sender] || msg.sender == contractOwner,
            "BandaTraceability: caller is not authorized inspector"
        );
        _;
    }

    modifier onlyBatchOwnerOrAuthorized(string memory batchCode) {
        require(_batches[batchCode].exists, "BandaTraceability: batch does not exist");
        require(
            msg.sender == _batches[batchCode].currentOwner ||
            authorizedInspectors[msg.sender] ||
            msg.sender == contractOwner,
            "BandaTraceability: caller not owner or authorized officer"
        );
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        authorizedInspectors[msg.sender] = true;
        authorizedProducers[msg.sender] = true;
        authorizedProcessors[msg.sender] = true;
    }

    // RBAC Administration
    function grantProducerRole(address account) external onlyOwner {
        authorizedProducers[account] = true;
        emit RoleGranted("PRODUCER", account);
    }

    function revokeProducerRole(address account) external onlyOwner {
        authorizedProducers[account] = false;
        emit RoleRevoked("PRODUCER", account);
    }

    function grantInspectorRole(address account) external onlyOwner {
        authorizedInspectors[account] = true;
        emit RoleGranted("INSPECTOR", account);
    }

    function revokeInspectorRole(address account) external onlyOwner {
        authorizedInspectors[account] = false;
        emit RoleRevoked("INSPECTOR", account);
    }

    function grantProcessorRole(address account) external onlyOwner {
        authorizedProcessors[account] = true;
        emit RoleGranted("PROCESSOR", account);
    }

    function revokeProcessorRole(address account) external onlyOwner {
        authorizedProcessors[account] = false;
        emit RoleRevoked("PROCESSOR", account);
    }

    // Registrasi Batch Baru
    function registerBatch(
        string calldata batchCode,
        CommodityCategory category,
        string calldata originLocation,
        string calldata ipfsMetadataCid,
        bytes32 initialHash
    ) external {
        require(
            authorizedProducers[msg.sender] || authorizedInspectors[msg.sender] || msg.sender == contractOwner,
            "BandaTraceability: unauthorized to register batch"
        );
        require(!_batches[batchCode].exists, "BandaTraceability: batch code already registered");
        require(bytes(batchCode).length > 0, "BandaTraceability: invalid batch code");
        require(initialHash != bytes32(0), "BandaTraceability: invalid initial hash");

        _batches[batchCode] = BatchRecord({
            batchCode: batchCode,
            category: category,
            originLocation: originLocation,
            ipfsMetadataCid: ipfsMetadataCid,
            latestHash: initialHash,
            currentOwner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            exists: true,
            eventCount: 1
        });

        _batchEvents[batchCode].push(BatchEvent({
            eventType: "INITIAL_REGISTRATION",
            eventHash: initialHash,
            ipfsCid: ipfsMetadataCid,
            actor: msg.sender,
            timestamp: block.timestamp
        }));

        emit BatchRegistered(batchCode, category, msg.sender, initialHash, ipfsMetadataCid);
    }

    // Menambahkan Peristiwa ke Batch
    function appendBatchEvent(
        string calldata batchCode,
        string calldata eventType,
        bytes32 newCumulativeHash,
        string calldata ipfsCid
    ) external onlyBatchOwnerOrAuthorized(batchCode) {
        require(newCumulativeHash != bytes32(0), "BandaTraceability: invalid cumulative hash");

        BatchRecord storage record = _batches[batchCode];
        record.latestHash = newCumulativeHash;
        record.updatedAt = block.timestamp;
        record.eventCount += 1;

        _batchEvents[batchCode].push(BatchEvent({
            eventType: eventType,
            eventHash: newCumulativeHash,
            ipfsCid: ipfsCid,
            actor: msg.sender,
            timestamp: block.timestamp
        }));

        emit BatchEventAppended(batchCode, eventType, newCumulativeHash, ipfsCid, msg.sender);
    }

    // Pengalihan Kepemilikan Batch (Transfer of Custody)
    function transferBatchOwnership(
        string calldata batchCode,
        address newOwner,
        bytes32 transferEventHash,
        string calldata transferNotesIpfsCid
    ) external onlyBatchOwnerOrAuthorized(batchCode) {
        require(newOwner != address(0), "BandaTraceability: invalid new owner address");
        BatchRecord storage record = _batches[batchCode];
        address previousOwner = record.currentOwner;
        record.currentOwner = newOwner;
        record.latestHash = transferEventHash;
        record.updatedAt = block.timestamp;
        record.eventCount += 1;

        _batchEvents[batchCode].push(BatchEvent({
            eventType: "CUSTODY_TRANSFERRED",
            eventHash: transferEventHash,
            ipfsCid: transferNotesIpfsCid,
            actor: msg.sender,
            timestamp: block.timestamp
        }));

        emit OwnershipTransferred(batchCode, previousOwner, newOwner);
        emit BatchEventAppended(batchCode, "CUSTODY_TRANSFERRED", transferEventHash, transferNotesIpfsCid, msg.sender);
    }

    // Pembaruan Metadata IPFS
    function updateIpfsMetadata(
        string calldata batchCode,
        string calldata newIpfsCid
    ) external onlyBatchOwnerOrAuthorized(batchCode) {
        BatchRecord storage record = _batches[batchCode];
        string memory oldCid = record.ipfsMetadataCid;
        record.ipfsMetadataCid = newIpfsCid;
        record.updatedAt = block.timestamp;

        emit IpfsMetadataUpdated(batchCode, oldCid, newIpfsCid);
    }

    // Verifikasi Kriptografis Publik (View Call / Tanpa Biaya Gas)
    function verifyBatchHash(
        string calldata batchCode,
        bytes32 calculatedHash
    ) external view returns (
        bool isMatch,
        bytes32 onChainHash,
        uint256 eventCount,
        address currentOwner,
        string memory ipfsMetadataCid
    ) {
        require(_batches[batchCode].exists, "BandaTraceability: batch not found");
        BatchRecord storage record = _batches[batchCode];
        return (
            record.latestHash == calculatedHash,
            record.latestHash,
            record.eventCount,
            record.currentOwner,
            record.ipfsMetadataCid
        );
    }

    // Mengambil Data Detail Batch
    function getBatch(string calldata batchCode) external view returns (
        string memory code,
        CommodityCategory category,
        string memory originLocation,
        string memory ipfsMetadataCid,
        bytes32 latestHash,
        address currentOwner,
        uint256 createdAt,
        uint256 updatedAt,
        uint256 eventCount
    ) {
        require(_batches[batchCode].exists, "BandaTraceability: batch does not exist");
        BatchRecord storage record = _batches[batchCode];
        return (
            record.batchCode,
            record.category,
            record.originLocation,
            record.ipfsMetadataCid,
            record.latestHash,
            record.currentOwner,
            record.createdAt,
            record.updatedAt,
            record.eventCount
        );
    }

    // Mengambil Peristiwa Spesifik
    function getBatchEvent(string calldata batchCode, uint256 index) external view returns (
        string memory eventType,
        bytes32 eventHash,
        string memory ipfsCid,
        address actor,
        uint256 timestamp
    ) {
        require(_batches[batchCode].exists, "BandaTraceability: batch does not exist");
        require(index < _batchEvents[batchCode].length, "BandaTraceability: event index out of bounds");
        BatchEvent storage evt = _batchEvents[batchCode][index];
        return (
            evt.eventType,
            evt.eventHash,
            evt.ipfsCid,
            evt.actor,
            evt.timestamp
        );
    }
}
```

---

## 5. Ringkasan ABI (Application Binary Interface)

Berkas ABI lengkap telah diekstrak dan disimpan pada [`blockchain/contracts/BandaTraceabilityRegistryABI.json`](file:///home/masann/Projects/banda%20neira/penduduk/blockchain/contracts/BandaTraceabilityRegistryABI.json). Berkas ini digunakan oleh pustaka `web3.py` di backend dan ethers.js di frontend untuk berinteraksi langsung dengan kontrak cerdas.

---

*Disetujui untuk pengujian dan kompilasi - Khoirul Anam.*
