const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Deployment batches for organized deployment
const DEPLOYMENT_BATCHES = {
  core: ["BaseToken", "BaseNFT"],
  defi: ["BaseStaking", "BaseDEX", "BaseVesting"],
  governance: ["BaseGovernance"],
  utilities: ["BalanceManager", "BalanceTracker", "BaseMarketplace"]
};

const CONTRACT_CONFIGS = {
  BaseToken: {
    args: () => ["BaseLytics Token", "BLT", hre.ethers.parseEther("1000000")]
  },
  BaseNFT: {
    args: () => ["BaseLytics NFT", "BLNFT", "https://api.baselytics.com/nft/"]
  },
  BaseStaking: {
    dependencies: ["BaseToken"],
    args: (deps) => [deps.BaseToken]
  },
  BalanceManager: {
    args: () => ["Balance Manager Token", "BMT", hre.ethers.parseEther("500000")]
  },
  BalanceTracker: {
    args: () => []
  },
  BaseDEX: {
    args: () => []
  },
  BaseMarketplace: {
    args: () => []
  },
  BaseVesting: {
    dependencies: ["BaseToken"],
    args: (deps) => [deps.BaseToken]
  },
  BaseGovernance: {
    dependencies: ["BaseToken"],
    args: (deps) => [deps.BaseToken]
  }
};

async function deployContract(contractName, args, deployer) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  const Contract = await hre.ethers.getContractFactory(contractName);
  
  // Estimate gas
  const deployTx = await Contract.getDeployTransaction(...args);
  const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
  console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
  
  const contract = await Contract.deploy(...args);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ ${contractName} deployed to: ${address}`);
  
  return { contract, address };
}

async function deployBatch(batchName, deployedContracts = {}) {
  console.log(`\n📦 Deploying batch: ${batchName.toUpperCase()}`);
  console.log("=" .repeat(50));
  
  const contracts = DEPLOYMENT_BATCHES[batchName];
  const [deployer] = await hre.ethers.getSigners();
  
  for (const contractName of contracts) {
    const config = CONTRACT_CONFIGS[contractName];
    let args = [];
    
    if (config.dependencies) {
      // Check if dependencies are deployed
      for (const dep of config.dependencies) {
        if (!deployedContracts[dep]) {
          console.log(`❌ Dependency ${dep} not found for ${contractName}`);
          process.exit(1);
        }
      }
      args = config.args(deployedContracts);
    } else {
      args = config.args();
    }
    
    const { address } = await deployContract(contractName, args, deployer);
    deployedContracts[contractName] = address;
  }
  
  return deployedContracts;
}

async function main() {
  const batchName = process.argv[2];
  
  if (!batchName) {
    console.log("Usage: npx hardhat run scripts/deploy-batch.js --network <network> <batch-name>");
    console.log("Available batches:");
    Object.keys(DEPLOYMENT_BATCHES).forEach(batch => {
      console.log(`  ${batch}: ${DEPLOYMENT_BATCHES[batch].join(", ")}`);
    });
    process.exit(1);
  }
  
  if (!DEPLOYMENT_BATCHES[batchName]) {
    console.log(`❌ Batch ${batchName} not found`);
    console.log("Available batches:", Object.keys(DEPLOYMENT_BATCHES).join(", "));
    process.exit(1);
  }
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Load existing deployments
  let deployedContracts = {};
  const existingDeployment = getLatestDeployment();
  if (existingDeployment) {
    deployedContracts = existingDeployment.contracts;
    console.log("📋 Found existing deployments:", Object.keys(deployedContracts).join(", "));
  }
  
  // Deploy batch
  deployedContracts = await deployBatch(batchName, deployedContracts);
  
  // Save deployment
  saveDeployment(deployedContracts, deployer.address);
  
  console.log(`\n🎉 Batch ${batchName} deployment completed!`);
  console.log("📋 Deployed contracts:");
  DEPLOYMENT_BATCHES[batchName].forEach(contract => {
    console.log(`  ${contract}: ${deployedContracts[contract]}`);
  });
}

function getLatestDeployment() {
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) return null;
  
  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith(hre.network.name) && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) return null;
  
  return JSON.parse(fs.readFileSync(path.join(deploymentsDir, files[0]), 'utf8'));
}

function saveDeployment(contracts, deployer) {
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deployment = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer,
    contracts: contracts
  };
  
  const filename = `${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deployment, null, 2)
  );
  
  console.log(`💾 Deployment saved to deployments/${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });