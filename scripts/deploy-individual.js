const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Contract deployment configurations
const CONTRACTS = {
  BaseToken: {
    name: "BaseToken",
    args: ["BaseLytics Token", "BLT", hre.ethers.parseEther("1000000")]
  },
  BaseNFT: {
    name: "BaseNFT", 
    args: ["BaseLytics NFT", "BLNFT", "https://api.baselytics.com/nft/"]
  },
  BaseStaking: {
    name: "BaseStaking",
    dependencies: ["BaseToken"]
  },
  BalanceManager: {
    name: "BalanceManager",
    args: ["Balance Manager Token", "BMT", hre.ethers.parseEther("500000")]
  },
  BalanceTracker: {
    name: "BalanceTracker",
    args: []
  },
  BaseDEX: {
    name: "BaseDEX",
    args: []
  },
  BaseMarketplace: {
    name: "BaseMarketplace", 
    args: []
  },
  BaseVesting: {
    name: "BaseVesting",
    dependencies: ["BaseToken"]
  },
  BaseGovernance: {
    name: "BaseGovernance",
    dependencies: ["BaseToken"]
  }
};

async function deployContract(contractName, args = [], deployer) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  const Contract = await hre.ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...args);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`✅ ${contractName} deployed to: ${address}`);
  
  return { contract, address };
}

async function main() {
  const contractName = process.argv[2];
  
  if (!contractName) {
    console.log("Usage: npx hardhat run scripts/deploy-individual.js --network <network> <contract-name>");
    console.log("Available contracts:", Object.keys(CONTRACTS).join(", "));
    process.exit(1);
  }
  
  if (!CONTRACTS[contractName]) {
    console.log(`❌ Contract ${contractName} not found`);
    console.log("Available contracts:", Object.keys(CONTRACTS).join(", "));
    process.exit(1);
  }
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  
  const config = CONTRACTS[contractName];
  let args = config.args || [];
  
  // Handle dependencies
  if (config.dependencies) {
    const deploymentFile = getLatestDeployment();
    if (!deploymentFile) {
      console.log("❌ No previous deployments found. Deploy dependencies first.");
      process.exit(1);
    }
    
    for (const dep of config.dependencies) {
      if (!deploymentFile.contracts[dep]) {
        console.log(`❌ Dependency ${dep} not found in deployments`);
        process.exit(1);
      }
      args.push(deploymentFile.contracts[dep]);
    }
  }
  
  const { address } = await deployContract(contractName, args, deployer);
  
  // Save deployment
  saveDeployment(contractName, address, deployer.address);
  
  console.log(`\n🎉 ${contractName} deployment completed!`);
  console.log(`📋 Address: ${address}`);
  console.log(`🌐 Network: ${hre.network.name}`);
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

function saveDeployment(contractName, address, deployer) {
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  let deployment = getLatestDeployment() || {
    network: hre.network.name,
    contracts: {}
  };
  
  deployment.contracts[contractName] = address;
  deployment.timestamp = new Date().toISOString();
  deployment.deployer = deployer;
  
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