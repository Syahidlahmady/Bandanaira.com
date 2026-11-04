// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SpiceRegistry
 * @notice On-chain immutable registry for Banda Neira spice batches and event integrity hashes.
 * 
 * MANDATORY PRIVACY RULE:
 * Absolutely NO Personally Identifiable Information (PII) is stored on-chain.
 * Only deterministic cryptographic hashes (SHA-256 / Keccak-256) and public batch codes are anchored.
 */
contract SpiceRegistry {
    address public owner;

    struct BatchRecord {
        bytes32 batchId;
        string batchCode;
        bytes32 latestHash;
        uint256 timestamp;
        uint256 eventCount;
        bool exists;
    }

    struct BatchEventRecord {
        bytes32 eventHash;
        string eventType;
        uint256 timestamp;
        address recordedBy;
    }

    // Mapping from batchId (keccak256 of batchCode) to BatchRecord
    mapping(bytes32 => BatchRecord) public batches;
    
    // Mapping from batchId to array of sequential events
    mapping(bytes32 => BatchEventRecord[]) public batchEvents;

    // Events
    event BatchRegistered(
        bytes32 indexed batchId,
        string batchCode,
        bytes32 indexed rootHash,
        uint256 timestamp
    );

    event BatchEventAppended(
        bytes32 indexed batchId,
        bytes32 indexed eventHash,
        string eventType,
        uint256 indexed sequence,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "SpiceRegistry: Only owner authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a newly created spice product batch with its genesis event hash.
     * @param batchCode The public batch identifier (e.g. "BN-BTC-2026-0001")
     * @param rootHash The SHA-256 hash of the initial genesis aggregation event (formatted as bytes32)
     */
    function registerBatch(
        string memory batchCode,
        bytes32 rootHash
    ) external returns (bytes32 batchId) {
        batchId = keccak256(abi.encodePacked(batchCode));
        require(!batches[batchId].exists, "SpiceRegistry: Batch already registered");

        batches[batchId] = BatchRecord({
            batchId: batchId,
            batchCode: batchCode,
            latestHash: rootHash,
            timestamp: block.timestamp,
            eventCount: 1,
            exists: true
        });

        batchEvents[batchId].push(BatchEventRecord({
            eventHash: rootHash,
            eventType: "harvest_aggregated",
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        emit BatchRegistered(batchId, batchCode, rootHash, block.timestamp);
    }

    /**
     * @notice Append a lifecycle event (drying, sorting, packaging, distribution) to the hash chain.
     * @param batchId The bytes32 identifier of the batch
     * @param eventHash The SHA-256 hash of the new event (formatted as bytes32)
     * @param eventType Type of event (e.g. "drying", "packaging")
     */
    function appendBatchEvent(
        bytes32 batchId,
        bytes32 eventHash,
        string memory eventType
    ) external returns (uint256 sequence) {
        require(batches[batchId].exists, "SpiceRegistry: Batch not found");

        batches[batchId].latestHash = eventHash;
        batches[batchId].eventCount += 1;

        batchEvents[batchId].push(BatchEventRecord({
            eventHash: eventHash,
            eventType: eventType,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        sequence = batches[batchId].eventCount;
        emit BatchEventAppended(batchId, eventHash, eventType, sequence, block.timestamp);
    }

    /**
     * @notice Verify whether a given event hash matches the latest anchored on-chain hash.
     * @param batchId The bytes32 identifier of the batch
     * @param expectedHash The hash to compare against
     */
    function verifyBatchHash(
        bytes32 batchId,
        bytes32 expectedHash
    ) external view returns (bool isMatch, bytes32 onChainHash, uint256 eventCount) {
        require(batches[batchId].exists, "SpiceRegistry: Batch not found");
        onChainHash = batches[batchId].latestHash;
        isMatch = (onChainHash == expectedHash);
        eventCount = batches[batchId].eventCount;
    }

    /**
     * @notice Get metadata for a registered batch.
     */
    function getBatch(
        bytes32 batchId
    ) external view returns (
        string memory batchCode,
        bytes32 latestHash,
        uint256 timestamp,
        uint256 eventCount,
        bool exists
    ) {
        BatchRecord memory b = batches[batchId];
        return (b.batchCode, b.latestHash, b.timestamp, b.eventCount, b.exists);
    }

    /**
     * @notice Get the total count of events recorded for a batch.
     */
    function getBatchEventsCount(bytes32 batchId) external view returns (uint256) {
        return batchEvents[batchId].length;
    }

    /**
     * @notice Get an event record by index for a batch.
     */
    function getBatchEvent(
        bytes32 batchId,
        uint256 index
    ) external view returns (
        bytes32 eventHash,
        string memory eventType,
        uint256 timestamp,
        address recordedBy
    ) {
        require(index < batchEvents[batchId].length, "SpiceRegistry: Index out of bounds");
        BatchEventRecord memory e = batchEvents[batchId][index];
        return (e.eventHash, e.eventType, e.timestamp, e.recordedBy);
    }
}
