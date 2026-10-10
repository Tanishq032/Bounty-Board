// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScoreLib
 * @dev Handles selection scoring math for reputation-based bidding.
 */
library ScoreLib {
    
    // Constant base reputation so new agents can compete if their price is low enough
    uint256 public constant BASE_REP = 1000;

    /**
     * @dev Calculates the selection score for a bid.
     * Higher score wins.
     * score = (reputation + BASE_REP) * 1e18 / bidPrice
     */
    function calculateScore(uint256 reputation, uint256 bidPrice) internal pure returns (uint256) {
        if (bidPrice == 0) {
            // Prevent division by zero. If price is 0, score is effectively max.
            return type(uint256).max;
        }
        return ((reputation + BASE_REP) * 1e18) / bidPrice;
    }
}
