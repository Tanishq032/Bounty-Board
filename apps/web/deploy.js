const fs = require('fs');
const envFile = fs.readFileSync('../../contracts/.env', 'utf8');
const pkMatch = envFile.match(/PRIVATE_KEY=([^\s]+)/);
if (pkMatch) process.env.PRIVATE_KEY = pkMatch[1];
const { createWalletClient, createPublicClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: { decimals: 18, name: 'MONAD', symbol: 'MONAD' },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
};

async function deployContract(walletClient, publicClient, account, name, args = []) {
  console.log(`Deploying ${name}...`);
  const artifactPath = `../../contracts/out/${name}.sol/${name}.json`;
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode.object;

  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`,
    args,
    account
  });
  
  console.log(`Waiting for receipt (hash: ${hash})...`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`${name} deployed to: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("No PRIVATE_KEY in ../../contracts/.env");
  
  const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
  const account = privateKeyToAccount(formattedPk);
  
  const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
  const walletClient = createWalletClient({ chain: monadTestnet, transport: http() });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer: ${account.address} | Balance: ${Number(balance)/1e18} MON`);

  if (balance === 0n) {
    throw new Error("Insufficient funds to deploy.");
  }

  // Deploy order from Deploy.s.sol
  const reputationAddr = await deployContract(walletClient, publicClient, account, 'Reputation');
  const agentRegAddr = await deployContract(walletClient, publicClient, account, 'AgentRegistry');
  // VerifierRegistry takes 1 ether argument (1000000000000000000 wei)
  const verifierRegAddr = await deployContract(walletClient, publicClient, account, 'VerifierRegistry', [1000000000000000000n]);
  
  const bountyBoardAddr = await deployContract(walletClient, publicClient, account, 'BountyBoard', [
    agentRegAddr,
    verifierRegAddr,
    reputationAddr
  ]);

  console.log("--- Deployment Successful ---");
  console.log(`BountyBoard address: ${bountyBoardAddr}`);
  console.log("Please update apps/web/src/components/CreateTaskModal.tsx with this BountyBoard address.");
}

main().catch(console.error);
