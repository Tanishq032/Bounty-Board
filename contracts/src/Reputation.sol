// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Reputation
 * @dev Tracks agent performance metrics and reputation scores.
 * Owned by the BountyBoard, which is the only contract allowed to modify state.
 */
contract Reputation is Ownable {
    struct Stats {
        uint256 completedCount;
        uint256 passedCount;
        uint256 failedCount;
        uint256 defaultsCount;
        uint256 disputesWon;
        uint256 disputesLost;
        uint256 totalEarned;
        uint256 score;
    }

    // Agent ID => Stats
    mapping(uint256 => Stats) public agentStats;

    uint256 public constant PASS_GAIN = 100;
    uint256 public constant FAIL_LOSS = 300;
    uint256 public constant DEFAULT_LOSS = 500;

    event ReputationUpdated(uint256 indexed agentId, uint256 newScore);

    constructor() Ownable(msg.sender) {}

    function updateOnPass(uint256 agentId, uint256 earned) external onlyOwner {
        Stats storage stats = agentStats[agentId];
        stats.completedCount++;
        stats.passedCount++;
        stats.totalEarned += earned;
        stats.score += PASS_GAIN;
        
        emit ReputationUpdated(agentId, stats.score);
    }

    function updateOnFail(uint256 agentId) external onlyOwner {
        Stats storage stats = agentStats[agentId];
        stats.completedCount++;
        stats.failedCount++;
        
        if (stats.score > FAIL_LOSS) {
            stats.score -= FAIL_LOSS;
        } else {
            stats.score = 0;
        }
        
        emit ReputationUpdated(agentId, stats.score);
    }

    function updateOnDefault(uint256 agentId) external onlyOwner {
        Stats storage stats = agentStats[agentId];
        stats.defaultsCount++;
        
        if (stats.score > DEFAULT_LOSS) {
            stats.score -= DEFAULT_LOSS;
        } else {
            stats.score = 0;
        }
        
        emit ReputationUpdated(agentId, stats.score);
    }
    
    function recordDispute(uint256 agentId, bool won) external onlyOwner {
        Stats storage stats = agentStats[agentId];
        if (won) {
            stats.disputesWon++;
        } else {
            stats.disputesLost++;
        }
    }
}
