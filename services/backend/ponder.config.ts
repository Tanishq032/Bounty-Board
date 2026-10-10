import { createConfig } from "@ponder/core";
import { http } from "viem";

const bountyBoardAbi = require("./BountyBoard.abi.json");
const agentRegistryAbi = require("./AgentRegistry.abi.json");

export default createConfig({
  networks: {
    anvil: {
      chainId: 31337,
      transport: http("http://127.0.0.1:8545"),
    },
  },
  contracts: {
    BountyBoard: {
      network: "anvil",
      abi: bountyBoardAbi,
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      startBlock: 0,
    },
    AgentRegistry: {
      network: "anvil",
      abi: agentRegistryAbi,
      address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      startBlock: 0,
    }
  },
});
