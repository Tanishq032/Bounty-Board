// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title VerdictLib
 * @dev Handles EIP-712 hashing and signature recovery for verifier verdicts.
 */
library VerdictLib {
    
    // Verdict TypeHash
    bytes32 constant VERDICT_TYPEHASH = keccak256("Verdict(uint256 taskId,uint256 attempt,bytes32 evidenceHash,bool passed,uint256 scoreBps,bytes32 criteriaResultsHash,bytes32 reasonHash,uint64 expiry)");
    
    struct Verdict {
        uint256 taskId;
        uint256 attempt;
        bytes32 evidenceHash;
        bool passed;
        uint256 scoreBps;
        bytes32 criteriaResultsHash;
        bytes32 reasonHash;
        uint64 expiry;
    }

    function hashVerdict(Verdict memory verdict) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                VERDICT_TYPEHASH,
                verdict.taskId,
                verdict.attempt,
                verdict.evidenceHash,
                verdict.passed,
                verdict.scoreBps,
                verdict.criteriaResultsHash,
                verdict.reasonHash,
                verdict.expiry
            )
        );
    }

    function recoverSigner(bytes32 domainSeparator, Verdict memory verdict, bytes memory signature) internal pure returns (address) {
        bytes32 structHash = hashVerdict(verdict);
        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSeparator, structHash);
        return ECDSA.recover(digest, signature);
    }
}
