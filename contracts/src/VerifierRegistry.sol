// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VerifierRegistry
 * @dev Manages verifier membership, stakes, and slashing for deterministic mismatches.
 */
contract VerifierRegistry is Ownable {
    
    mapping(address => bool) public isVerifier;
    mapping(address => uint256) public stakes;
    
    address[] public verifiersList;
    uint256 public requiredStake;
    
    address public bountyBoard;

    event VerifierAdded(address indexed verifier, uint256 stakeAmount);
    event VerifierRemoved(address indexed verifier);
    event StakeSlashed(address indexed verifier, uint256 slashedAmount, address receiver1, address receiver2);
    event BountyBoardSet(address indexed bountyBoardAddress);

    error IncorrectStakeAmount();
    error NotAVerifier();
    error Unauthorized();

    constructor(uint256 _requiredStake) Ownable(msg.sender) {
        requiredStake = _requiredStake;
    }

    function setBountyBoard(address _bountyBoard) external onlyOwner {
        bountyBoard = _bountyBoard;
        emit BountyBoardSet(_bountyBoard);
    }

    modifier onlyBountyBoard() {
        if (msg.sender != bountyBoard) revert Unauthorized();
        _;
    }

    /**
     * @dev Register as a verifier by providing the exact required stake.
     */
    function registerVerifier() external payable {
        if (msg.value != requiredStake) revert IncorrectStakeAmount();
        if (!isVerifier[msg.sender]) {
            isVerifier[msg.sender] = true;
            verifiersList.push(msg.sender);
            stakes[msg.sender] += msg.value;
            emit VerifierAdded(msg.sender, msg.value);
        }
    }

    /**
     * @dev Remove a verifier and return their stake. Only admin can force remove in v1, 
     * or the verifier can remove themselves.
     */
    function removeVerifier(address verifier) external {
        if (msg.sender != verifier && msg.sender != owner()) revert Unauthorized();
        if (!isVerifier[verifier]) revert NotAVerifier();
        
        isVerifier[verifier] = false;
        uint256 amount = stakes[verifier];
        stakes[verifier] = 0;
        
        // Remove from list
        for (uint256 i = 0; i < verifiersList.length; i++) {
            if (verifiersList[i] == verifier) {
                verifiersList[i] = verifiersList[verifiersList.length - 1];
                verifiersList.pop();
                break;
            }
        }

        emit VerifierRemoved(verifier);
        
        (bool success, ) = payable(verifier).call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Slashing hook called by BountyBoard during a dispute resolution if a verifier signs a mismatch.
     * The slashed stake is split between the winning disputant and the protocol pool.
     */
    function slashVerifier(
        address verifier, 
        uint256 slashAmount, 
        address winner, 
        address protocolPool
    ) external onlyBountyBoard {
        if (!isVerifier[verifier]) revert NotAVerifier();
        
        // Safely bound the slash amount
        uint256 actualSlash = slashAmount > stakes[verifier] ? stakes[verifier] : slashAmount;
        stakes[verifier] -= actualSlash;
        
        uint256 split = actualSlash / 2;
        uint256 remainder = actualSlash - split;

        emit StakeSlashed(verifier, actualSlash, winner, protocolPool);

        // Pay winner
        if (split > 0) {
            (bool success1, ) = payable(winner).call{value: split}("");
            require(success1, "Transfer to winner failed");
        }
        
        // Pay protocol pool
        if (remainder > 0) {
            (bool success2, ) = payable(protocolPool).call{value: remainder}("");
            require(success2, "Transfer to pool failed");
        }
        
        // If stake falls below required, they are automatically deactivated or suspended in a fuller implementation.
        // For v0.1, we just slash the funds.
    }

    function getVerifiersCount() external view returns (uint256) {
        return verifiersList.length;
    }
}
