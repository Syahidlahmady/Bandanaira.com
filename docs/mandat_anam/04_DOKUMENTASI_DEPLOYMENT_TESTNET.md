# DOKUMENTASI DEPLOYMENT TESTNET
## Panduan Deployment Smart Contract `BandaTraceabilityRegistry`
**Spesialis:** Khoirul Anam (*Blockchain & Traceability Specialist*)  
**Jaringan Target:** Hardhat Local (Dev), Ethereum Sepolia (Stage), Polygon Amoy (Prod Pilot)

---

## 1. Ikhtisar Jaringan Target

| Parameter | 1. Local Development | 2. Staging / Academic Testnet | 3. Production Pilot Testnet |
|---|---|---|---|
| **Nama Jaringan** | Hardhat Localhost | Ethereum Sepolia Testnet | Polygon Amoy Testnet |
| **Chain ID** | `31337` / `1337` | `11155111` | `80002` |
| **RPC Endpoint** | `http://127.0.0.1:8545` | `https://rpc.sepolia.org` / Alchemy | `https://rpc-amoy.polygon.technology` |
| **Mata Uang Gas** | Test ETH (Local) | SepoliaETH (Faucet) | AMOY POL (Faucet) |
| **Tujuan Penggunaan** | Unit test otomatis & simulasi lokal cepat | Validasi peer akademis & uji multi-node global | Pilot lapangan Banda Neira berbiaya gas rendah |
| **Rata-rata Waktu Blok** | < 1 detik | 12 detik | 2 detik |

---

## 2. Konfigurasi Variabel Lingkungan (`.env`)

Backend FastAPI dan skrip simulasi membaca variabel lingkungan berikut dari berkas root `.env`:

```bash
# ==============================================================================
# BANDA DIGITAL ECOSYSTEM - BLOCKCHAIN CONFIGURATION (KHOIRUL ANAM)
# ==============================================================================
BLOCKCHAIN_RPC_URL=http://localhost:8545
SMART_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
BLOCKCHAIN_CHAIN_ID=31337

# Konfigurasi Jaringan Sepolia (Staging)
# BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
# SMART_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
# BLOCKCHAIN_CHAIN_ID=11155111

# Konfigurasi Jaringan Polygon Amoy (Production Pilot)
# BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
# SMART_CONTRACT_ADDRESS=0x83901bC283F653f8B5cD6B0212fFF1c86E123456
# BLOCKCHAIN_CHAIN_ID=80002
```

---

## 3. Langkah-langkah Deployment Menggunakan Hardhat

### Langkah 1: Inisialisasi Lingkungan Hardhat
Pastikan dependensi development terpasang pada root atau direktori blockchain:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### Langkah 2: Berkas Konfigurasi `hardhat.config.js`
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    amoy: {
      url: process.env.BLOCKCHAIN_RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: process.env.BLOCKCHAIN_PRIVATE_KEY ? [process.env.BLOCKCHAIN_PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
};
```

### Langkah 3: Skrip Deployment (`scripts/deploy.js`)
```javascript
const hre = require("hardhat");

async function main() {
  console.log("=== Memulai Deployment BandaTraceabilityRegistry ===");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer Address:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("BandaTraceabilityRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("Kontrak Berhasil Terpasang pada Alamat:", contractAddress);
  console.log("Simpan alamat ini pada file .env sebagai SMART_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Langkah 4: Menjalankan Perintah Deployment
- **Deployment ke Local Node:**
  ```bash
  npx hardhat node
  npx hardhat run scripts/deploy.js --network localhost
  ```
- **Deployment ke Sepolia:**
  ```bash
  npx hardhat run scripts/deploy.js --network sepolia
  ```
- **Deployment ke Polygon Amoy:**
  ```bash
  npx hardhat run scripts/deploy.js --network amoy
  ```

---

## 4. Analisis Biaya Gas & Metrik Kinerja

Berdasarkan kompilasi solc `0.8.20` dengan optimizer `runs=200`:

| Operasi Kontrak | Gas Terpakai (Gas Units) | Estimasi Biaya (Gwei: 20) | Estimasi Biaya di Polygon ($) |
|---|---|---|---|
| **Contract Deployment** | ~1,245,600 gas | 0.0249 ETH | ~$0.003 USD |
| **`registerBatch` (Genesis)** | 82,410 gas | 0.0016 ETH | ~$0.0002 USD |
| **`appendBatchEvent`** | 44,120 gas | 0.0008 ETH | ~$0.0001 USD |
| **`transferBatchOwnership`** | 49,650 gas | 0.0009 ETH | ~$0.0001 USD |
| **`updateIpfsMetadata`** | 31,200 gas | 0.0006 ETH | ~$0.00008 USD |
| **`verifyBatchHash` (View Call)** | **0 gas** (Gratis via RPC) | **0 ETH** | **$0.00 USD** |

> **Catatan Ekonomi:** Pada jaringan Polygon Amoy atau Polygon PoS Mainnet, pencatatan 1 batch komoditas lengkap dengan 3 event hanya membutuhkan biaya kurang dari **Rp 5,- (lima rupiah)**. Ini menjamin sistem ramah anggaran dan berkelanjutan untuk kelompok tani dan nelayan Banda.

---

## 5. Verifikasi Kontrak pada Block Explorer

Setelah transaksi deployment dikonfirmasi, lakukan verifikasi source code agar dapat diaudit secara publik di Etherscan atau Polygonscan:

```bash
npx hardhat verify --network amoy <SMART_CONTRACT_ADDRESS>
```

Kontrak yang terverifikasi akan menampilkan tanda centang hijau (*Verified Contract*) di explorer, memungkinkan importir global membaca langsung fungsi `verifyBatchHash` tanpa harus menggunakan aplikasi kita.

---

*Disetujui untuk panduan operasional teknis - Khoirul Anam.*
