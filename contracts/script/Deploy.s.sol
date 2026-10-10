// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BountyBoard.sol";
import "../src/AgentRegistry.sol";
import "../src/VerifierRegistry.sol";
import "../src/Reputation.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Reputation reputation = new Reputation();
        AgentRegistry agentRegistry = new AgentRegistry();
        VerifierRegistry verifierRegistry = new VerifierRegistry(1 ether);
        
        BountyBoard board = new BountyBoard(
            address(agentRegistry),
            address(verifierRegistry),
            address(reputation)
        );

        vm.stopBroadcast();
        
        console.log("Reputation deployed to:", address(reputation));
        console.log("AgentRegistry deployed to:", address(agentRegistry));
        console.log("VerifierRegistry deployed to:", address(verifierRegistry));
        console.log("BountyBoard deployed to:", address(board));
    }
}
