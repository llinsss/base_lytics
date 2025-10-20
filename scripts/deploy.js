const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Base Sepolia testnet...");

  // Get the contract factories
  const BaseToken = await hre.ethers.getContractFactory("BaseToken");
  const BaseNFT = await hre.ethers.getContractFactory("BaseNFT");
  const BaseStaking = await hre.ethers.getContractFactory("BaseStaking");

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

  // Display deployment summary
  console.log("\n📋 Deployment Summary:");
  console.log("=" .repeat(50));
  console.log("BaseToken Address:", baseTokenAddress);
  console.log("BaseNFT Address:", baseNFTAddress);
  console.log("BaseStaking Address:", baseStakingAddress);
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
      BaseStaking: baseStakingAddress
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
