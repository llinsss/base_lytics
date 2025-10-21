const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Base Sepolia testnet...");

  // Get the contract factories
  const BaseToken = await hre.ethers.getContractFactory("BaseToken");
  const BaseNFT = await hre.ethers.getContractFactory("BaseNFT");
  const BaseStaking = await hre.ethers.getContractFactory("BaseStaking");
  const BalanceManager = await hre.ethers.getContractFactory("BalanceManager");
  const BalanceTracker = await hre.ethers.getContractFactory("BalanceTracker");
  const BaseDEX = await hre.ethers.getContractFactory("BaseDEX");
  const BaseMarketplace = await hre.ethers.getContractFactory("BaseMarketplace");
  const BaseVesting = await hre.ethers.getContractFactory("BaseVesting");
  const BaseGovernance = await hre.ethers.getContractFactory("BaseGovernance");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy BaseToken
  console.log("\n🪙 Deploying BaseToken...");
  const baseToken = await BaseToken.deploy(
    "BaseLytics Token", // name
    "BLT",              // symbol
    hre.ethers.parseEther("1000000") // initial supply: 1M tokens
  );
  await baseToken.waitForDeployment();
  const baseTokenAddress = await baseToken.getAddress();
  console.log("✅ BaseToken deployed to:", baseTokenAddress);

  // Deploy BaseNFT
  console.log("\n🎨 Deploying BaseNFT...");
  const baseNFT = await BaseNFT.deploy(
    "BaseLytics NFT",                    // name
    "BLNFT",                            // symbol
    "https://api.baselytics.com/nft/"   // base URI
  );
  await baseNFT.waitForDeployment();
  const baseNFTAddress = await baseNFT.getAddress();
  console.log("✅ BaseNFT deployed to:", baseNFTAddress);

  // Deploy BaseStaking
  console.log("\n🏦 Deploying BaseStaking...");
  const baseStaking = await BaseStaking.deploy(baseTokenAddress);
  await baseStaking.waitForDeployment();
  const baseStakingAddress = await baseStaking.getAddress();
  console.log("✅ BaseStaking deployed to:", baseStakingAddress);

  // Deploy BalanceManager
  console.log("\n📊 Deploying BalanceManager...");
  const balanceManager = await BalanceManager.deploy(
    "Balance Manager Token", // name
    "BMT",                  // symbol
    hre.ethers.parseEther("500000") // initial supply: 500K tokens
  );
  await balanceManager.waitForDeployment();
  const balanceManagerAddress = await balanceManager.getAddress();
  console.log("✅ BalanceManager deployed to:", balanceManagerAddress);

  // Deploy BalanceTracker
  console.log("\n🔍 Deploying BalanceTracker...");
  const balanceTracker = await BalanceTracker.deploy();
  await balanceTracker.waitForDeployment();
  const balanceTrackerAddress = await balanceTracker.getAddress();
  console.log("✅ BalanceTracker deployed to:", balanceTrackerAddress);

  // Deploy BaseDEX
  console.log("\n💱 Deploying BaseDEX...");
  const baseDEX = await BaseDEX.deploy();
  await baseDEX.waitForDeployment();
  const baseDEXAddress = await baseDEX.getAddress();
  console.log("✅ BaseDEX deployed to:", baseDEXAddress);

  // Deploy BaseMarketplace
  console.log("\n🛒 Deploying BaseMarketplace...");
  const baseMarketplace = await BaseMarketplace.deploy();
  await baseMarketplace.waitForDeployment();
  const baseMarketplaceAddress = await baseMarketplace.getAddress();
  console.log("✅ BaseMarketplace deployed to:", baseMarketplaceAddress);

  // Deploy BaseVesting
  console.log("\n⏰ Deploying BaseVesting...");
  const baseVesting = await BaseVesting.deploy(baseTokenAddress);
  await baseVesting.waitForDeployment();
  const baseVestingAddress = await baseVesting.getAddress();
  console.log("✅ BaseVesting deployed to:", baseVestingAddress);

  // Deploy BaseGovernance
  console.log("\n🗳️ Deploying BaseGovernance...");
  const baseGovernance = await BaseGovernance.deploy(baseTokenAddress);
  await baseGovernance.waitForDeployment();
  const baseGovernanceAddress = await baseGovernance.getAddress();
  console.log("✅ BaseGovernance deployed to:", baseGovernanceAddress);

  // Configure contracts
  console.log("\n🔧 Configuring contracts...");
  
  // Add BaseToken to BalanceTracker's supported tokens
  await balanceTracker.addSupportedToken(baseTokenAddress);
  console.log("✅ BaseToken added to BalanceTracker");
  
  // Add BaseToken to BaseMarketplace's supported payment tokens
  await baseMarketplace.addSupportedPaymentToken(baseTokenAddress);
  console.log("✅ BaseToken added to BaseMarketplace");
  
  // Create DEX pool for BaseToken/ETH
  await baseDEX.createPool(baseTokenAddress, "0x0000000000000000000000000000000000000000", 0);
  console.log("✅ BaseToken/ETH pool created on DEX");

  // Display deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log("BaseToken Address:", baseTokenAddress);
  console.log("BaseNFT Address:", baseNFTAddress);
  console.log("BaseStaking Address:", baseStakingAddress);
  console.log("BalanceManager Address:", balanceManagerAddress);
  console.log("BalanceTracker Address:", balanceTrackerAddress);
  console.log("BaseDEX Address:", baseDEXAddress);
  console.log("BaseMarketplace Address:", baseMarketplaceAddress);
  console.log("BaseVesting Address:", baseVestingAddress);
  console.log("BaseGovernance Address:", baseGovernanceAddress);
  console.log("Network:", hre.network.name);
  console.log("=" .repeat(50));

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BaseToken: baseTokenAddress,
      BaseNFT: baseNFTAddress,
      BaseStaking: baseStakingAddress,
      BalanceManager: balanceManagerAddress,
      BalanceTracker: balanceTrackerAddress,
      BaseDEX: baseDEXAddress,
      BaseMarketplace: baseMarketplaceAddress,
      BaseVesting: baseVestingAddress,
      BaseGovernance: baseGovernanceAddress
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployments/${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to deployments/ folder");
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
