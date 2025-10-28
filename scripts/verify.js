const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const CONTRACT_ARGS = {
  BaseToken: ["BaseLytics Token", "BLT", hre.ethers.parseEther("1000000")],
  BaseNFT: ["BaseLytics NFT", "BLNFT", "https://api.baselytics.com/nft/"],
  BalanceManager: ["Balance Manager Token", "BMT", hre.ethers.parseEther("500000")],
  BalanceTracker: [],
  BaseDEX: [],
  BaseMarketplace: []
};

async function verifyContract(name, address, args) {
  console.log(`\n🔍 Verifying ${name}...`);
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args,
    });
    console.log(`✅ ${name} verified successfully`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`✅ ${name} already verified`);
    } else {
      console.log(`❌ ${name} verification failed:`, error.message);
    }
  }
}

async function main() {
  const contractName = process.argv[2];
  
  // Load latest deployment
  const deployment = getLatestDeployment();
  if (!deployment) {
    console.log("❌ No deployment found. Deploy contracts first.");
    process.exit(1);
  }
  
  console.log(`🔍 Verifying contracts on ${hre.network.name}`);
  console.log("=" .repeat(50));
  
  if (contractName) {
    // Verify single contract
    if (!deployment.contracts[contractName]) {
      console.log(`❌ Contract ${contractName} not found in deployment`);
      process.exit(1);
    }
    
    let args = CONTRACT_ARGS[contractName] || [];
    
    // Handle contracts with dependencies
    if (["BaseStaking", "BaseVesting", "BaseGovernance"].includes(contractName)) {
      args = [deployment.contracts.BaseToken];
    }
    
    await verifyContract(contractName, deployment.contracts[contractName], args);
  } else {
    // Verify all contracts
    for (const [name, address] of Object.entries(deployment.contracts)) {
      let args = CONTRACT_ARGS[name] || [];
      
      // Handle contracts with dependencies
      if (["BaseStaking", "BaseVesting", "BaseGovernance"].includes(name)) {
        args = [deployment.contracts.BaseToken];
      }
      
      await verifyContract(name, address, args);
    }
  }
  
  console.log("\n🎉 Verification completed!");
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
