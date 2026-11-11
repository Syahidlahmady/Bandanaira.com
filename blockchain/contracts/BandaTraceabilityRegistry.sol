// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BandaTraceabilityRegistry
 * @author Khoirul Anam (Blockchain & Traceability Specialist - Banda Digital Ecosystem)
 * @notice On-chain immutable registry for Banda Islands Agro-Maritime Supply Chain:
 *         Nutmeg/Pala & Fisheries/Ikan products with IPFS decentralized metadata anchoring.
 *
 * MANDATORY PRIVACY & SECURITY RULES:
 * 1. Zero Personally Identifiable Information (PII) on-chain.
 * 2. Deterministic canonical cryptographic hashes (SHA-256) for audit trails.
 * 3. Decentralized IPFS CID pointers for verifiable credentials, laboratory tests, and packaging certs.
 * 4. Role-based access control protecting critical lifecycle transitions.
 */
contract BandaTraceabilityRegistry {
    address public contractOwner;

    enum CommodityCategory {
        SPICE,    // Pala (Nutmeg), Fuli (Mace), Cengkeh (Clove)
        MARINE    // Ikan Cakalang, Tuna Sirip Kuning, Ikan Asar Tradisional
    }

    struct BatchRecord {
        bytes32 batchId;
        string batchCode;
        CommodityCategory category;
        string commodityName;
        string originLocation;
        string ipfsMetadataCid;
        address currentOwner;
        bytes32 latestHash;
        uint256 timestamp;
        uint256 eventCount;
        bool exists;
    }

    struct BatchEventRecord {
        bytes32 eventHash;
        string eventType;
        string location;
        string ipfsProofCid;
        uint256 timestamp;
        address recordedBy;
    }

    // Role management
    mapping(address => bool) public authorizedProducers;   // Farmers / Fishermen cooperatives
    mapping(address => bool) public authorizedInspectors;   // Village quality verifiers / Dinas
    mapping(address => bool) public authorizedProcessors;   // MSME / Pengolah Fuli & Ikan Asar

    // Batch storage mappings
    mapping(bytes32 => BatchRecord) public batches;
    mapping(bytes32 => BatchEventRecord[]) public batchEvents;

    // Total counter
    uint256 public totalBatchesCount;
    bytes32[] public registeredBatchIds;

    // Events
    event BatchRegistered(
        bytes32 indexed batchId,
        string batchCode,
        CommodityCategory indexed category,
        string commodityName,
        string ipfsMetadataCid,
        bytes32 indexed rootHash,
        uint256 timestamp
    );

    event BatchEventAppended(
        bytes32 indexed batchId,
        bytes32 indexed eventHash,
        string eventType,
        string ipfsProofCid,
        uint256 indexed sequence,
        uint256 timestamp
    );

    event OwnershipTransferred(
        bytes32 indexed batchId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event IpfsMetadataUpdated(
        bytes32 indexed batchId,
        string previousCid,
        string newCid,
        uint256 timestamp
    );

    event RoleGranted(string roleName, address indexed account);
    event RoleRevoked(string roleName, address indexed account);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "BandaRegistry: Only contract owner authorized");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == contractOwner ||
            authorizedProducers[msg.sender] ||
            authorizedInspectors[msg.sender] ||
            authorizedProcessors[msg.sender],
            "BandaRegistry: Unauthorized caller"
        );
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        authorizedInspectors[msg.sender] = true;
        authorizedProducers[msg.sender] = true;
        authorizedProcessors[msg.sender] = true;
    }

    // Role administration
    function grantProducerRole(address account) external onlyOwner {
        authorizedProducers[account] = true;
        emit RoleGranted("PRODUCER", account);
    }

    function grantInspectorRole(address account) external onlyOwner {
        authorizedInspectors[account] = true;
        emit RoleGranted("INSPECTOR", account);
    }

    function grantProcessorRole(address account) external onlyOwner {
        authorizedProcessors[account] = true;
        emit RoleGranted("PROCESSOR", account);
    }

    /**
     * @notice Register a newly created harvest/catch product batch with genesis event hash and IPFS CID.
     * @param batchCode Public batch identifier (e.g. "BN-BTC-2026-001" or "BN-FISH-2026-003")
     * @param category CommodityCategory (0 = SPICE, 1 = MARINE)
     * @param commodityName Name of commodity (e.g. "Pala Banda Grade A Super" or "Ikan Asar Cakalang Lonthoir")
     * @param originLocation Origin village or sea zone (e.g. "Lonthoir, Banda Besar" or "Laut Banda Zona 4")
     * @param ipfsMetadataCid IPFS CID pointing to decentralized verifiable credentials and laboratory test report
     * @param rootHash Canonical SHA-256 genesis event hash formatted as bytes32
     */
    function registerBatch(
        string memory batchCode,
        CommodityCategory category,
        string memory commodityName,
        string memory originLocation,
        string memory ipfsMetadataCid,
        bytes32 rootHash
    ) external onlyAuthorized returns (bytes32 batchId) {
        batchId = keccak256(abi.encodePacked(batchCode));
        require(!batches[batchId].exists, "BandaRegistry: Batch already registered");

        batches[batchId] = BatchRecord({
            batchId: batchId,
            batchCode: batchCode,
            category: category,
            commodityName: commodityName,
            originLocation: originLocation,
            ipfsMetadataCid: ipfsMetadataCid,
            currentOwner: msg.sender,
            latestHash: rootHash,
            timestamp: block.timestamp,
            eventCount: 1,
            exists: true
        });

        batchEvents[batchId].push(BatchEventRecord({
            eventHash: rootHash,
            eventType: category == CommodityCategory.SPICE ? "harvest_aggregated" : "catch_landing",
            location: originLocation,
            ipfsProofCid: ipfsMetadataCid,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        registeredBatchIds.push(batchId);
        totalBatchesCount += 1;

        emit BatchRegistered(
            batchId,
            batchCode,
            category,
            commodityName,
            ipfsMetadataCid,
            rootHash,
            block.timestamp
        );
    }

    /**
     * @notice Append a lifecycle event (drying, smoking, laboratory testing, packaging, distribution).
     */
    function appendBatchEvent(
        bytes32 batchId,
        bytes32 eventHash,
        string memory eventType,
        string memory location,
        string memory ipfsProofCid
    ) external onlyAuthorized returns (uint256 sequence) {
        require(batches[batchId].exists, "BandaRegistry: Batch not found");

        batches[batchId].latestHash = eventHash;
        batches[batchId].eventCount += 1;

        batchEvents[batchId].push(BatchEventRecord({
            eventHash: eventHash,
            eventType: eventType,
            location: location,
            ipfsProofCid: ipfsProofCid,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        sequence = batches[batchId].eventCount;
        emit BatchEventAppended(
            batchId,
            eventHash,
            eventType,
            ipfsProofCid,
            sequence,
            block.timestamp
        );
    }

    /**
     * @notice Transfer physical & custodial ownership of a batch to downstream processors/merchants.
     */
    function transferBatchOwnership(
        bytes32 batchId,
        address newOwner
    ) external {
        require(batches[batchId].exists, "BandaRegistry: Batch not found");
        require(
            msg.sender == batches[batchId].currentOwner || msg.sender == contractOwner,
            "BandaRegistry: Only current owner can transfer batch"
        );
        require(newOwner != address(0), "BandaRegistry: Invalid new owner address");

        address prevOwner = batches[batchId].currentOwner;
        batches[batchId].currentOwner = newOwner;

        emit OwnershipTransferred(batchId, prevOwner, newOwner, block.timestamp);
    }

    /**
     * @notice Update decentralized IPFS metadata CID (e.g. after adding Halal or PIRT certificate).
     */
    function updateIpfsMetadata(
        bytes32 batchId,
        string memory newIpfsCid
    ) external onlyAuthorized {
        require(batches[batchId].exists, "BandaRegistry: Batch not found");
        string memory oldCid = batches[batchId].ipfsMetadataCid;
        batches[batchId].ipfsMetadataCid = newIpfsCid;

        emit IpfsMetadataUpdated(batchId, oldCid, newIpfsCid, block.timestamp);
    }

    /**
     * @notice Verify whether a local off-chain database hash matches the anchored on-chain root hash.
     */
    function verifyBatchHash(
        bytes32 batchId,
        bytes32 expectedHash
    ) external view returns (
        bool isMatch,
        bytes32 onChainHash,
        uint256 eventCount,
        string memory ipfsMetadataCid
    ) {
        require(batches[batchId].exists, "BandaRegistry: Batch not found");
        onChainHash = batches[batchId].latestHash;
        isMatch = (onChainHash == expectedHash);
        eventCount = batches[batchId].eventCount;
        ipfsMetadataCid = batches[batchId].ipfsMetadataCid;
    }

    /**
     * @notice Get comprehensive batch details.
     */
    function getBatch(
        bytes32 batchId
    ) external view returns (
        string memory batchCode,
        CommodityCategory category,
        string memory commodityName,
        string memory originLocation,
        string memory ipfsMetadataCid,
        address currentOwner,
        bytes32 latestHash,
        uint256 timestamp,
        uint256 eventCount,
        bool exists
    ) {
        BatchRecord memory b = batches[batchId];
        return (
            b.batchCode,
            b.category,
            b.commodityName,
            b.originLocation,
            b.ipfsMetadataCid,
            b.currentOwner,
            b.latestHash,
            b.timestamp,
            b.eventCount,
            b.exists
        );
    }

    /**
     * @notice Get the total count of sequential lifecycle events for a batch.
     */
    function getBatchEventsCount(bytes32 batchId) external view returns (uint256) {
        return batchEvents[batchId].length;
    }

    /**
     * @notice Get individual event details by sequential index.
     */
    function getBatchEvent(
        bytes32 batchId,
        uint256 index
    ) external view returns (
        bytes32 eventHash,
        string memory eventType,
        string memory location,
        string memory ipfsProofCid,
        uint256 timestamp,
        address recordedBy
    ) {
        require(index < batchEvents[batchId].length, "BandaRegistry: Index out of bounds");
        BatchEventRecord memory e = batchEvents[batchId][index];
        return (
            e.eventHash,
            e.eventType,
            e.location,
            e.ipfsProofCid,
            e.timestamp,
            e.recordedBy
        );
    }
}
