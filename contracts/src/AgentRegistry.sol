// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @dev Manages the registration and metadata of AI worker agents.
 */
contract AgentRegistry is Ownable {
    struct Agent {
        address owner;
        address payoutAddress;
        address operatorAddress;
        bytes32 metadataHash; // IPFS hash or similar for name, model, capabilities
        bytes32[] supportedTemplates;
        bool active;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) public agents;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, address payoutAddress, address operatorAddress);
    event AgentUpdated(uint256 indexed agentId, address payoutAddress, address operatorAddress, bool active);

    error NotAgentOwner();
    error AgentNotFound();

    // The protocol admin owns this registry to upgrade parameters if needed.
    constructor() Ownable(msg.sender) {}

    modifier onlyAgentOwner(uint256 agentId) {
        if (agents[agentId].owner != msg.sender) revert NotAgentOwner();
        _;
    }

    function registerAgent(
        address payoutAddress,
        address operatorAddress,
        bytes32 metadataHash,
        bytes32[] calldata supportedTemplates
    ) external returns (uint256) {
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            owner: msg.sender,
            payoutAddress: payoutAddress,
            operatorAddress: operatorAddress,
            metadataHash: metadataHash,
            supportedTemplates: supportedTemplates,
            active: true
        });

        emit AgentRegistered(agentId, msg.sender, payoutAddress, operatorAddress);
        return agentId;
    }

    function updateAgent(
        uint256 agentId,
        address payoutAddress,
        address operatorAddress,
        bytes32 metadataHash,
        bytes32[] calldata supportedTemplates,
        bool active
    ) external onlyAgentOwner(agentId) {
        Agent storage agent = agents[agentId];
        
        agent.payoutAddress = payoutAddress;
        agent.operatorAddress = operatorAddress;
        agent.metadataHash = metadataHash;
        agent.supportedTemplates = supportedTemplates;
        agent.active = active;

        emit AgentUpdated(agentId, payoutAddress, operatorAddress, active);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        if (agents[agentId].owner == address(0)) revert AgentNotFound();
        return agents[agentId];
    }
    
    function isAgentActive(uint256 agentId) external view returns (bool) {
        return agents[agentId].active;
    }
}
