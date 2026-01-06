const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying BaseLytics Enhanced Contracts...");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy BaseToken first
  const BaseToken = await ethers.getContractFactory("BaseToken");
  const baseToken = await BaseToken.deploy();
  await baseToken.waitForDeployment();
  console.log("BaseToken deployed to:", await baseToken.getAddress());

  // Deploy BaseLyticsRewards (ERC-1155)
  const BaseLyticsRewards = await ethers.getContractFactory("BaseLyticsRewards");
  const rewardsContract = await BaseLyticsRewards.deploy();
  await rewardsContract.waitForDeployment();
  console.log("BaseLyticsRewards deployed to:", await rewardsContract.getAddress());

  // Deploy OptimizedStaking
  const OptimizedStaking = await ethers.getContractFactory("OptimizedStaking");
  const stakingContract = await OptimizedStaking.deploy(
    await baseToken.getAddress(),
    await rewardsContract.getAddress()
  );
  await stakingContract.waitForDeployment();
  console.log("OptimizedStaking deployed to:", await stakingContract.getAddress());

  // Deploy OptimizedTrading
  const OptimizedTrading = await ethers.getContractFactory("OptimizedTrading");
  const tradingContract = await OptimizedTrading.deploy(
    await rewardsContract.getAddress()
  );
  await tradingContract.waitForDeployment();
  console.log("OptimizedTrading deployed to:", await tradingContract.getAddress());

  // Deploy BaseLyticsGovernance
  const BaseLyticsGovernance = await ethers.getContractFactory("BaseLyticsGovernance");
  const governanceContract = await BaseLyticsGovernance.deploy(
    await baseToken.getAddress(),
    await rewardsContract.getAddress()
  );
  await governanceContract.waitForDeployment();
  console.log("BaseLyticsGovernance deployed to:", await governanceContract.getAddress());

  // Set up permissions
  console.log("Setting up contract permissions...");
  
  // Grant rewards contract permission to mint rewards
  await rewardsContract.transferOwnership(deployer.address);
  
  // Add supported tokens to trading contract
  await tradingContract.addSupportedToken(await baseToken.getAddress());
  
  // Mint initial tokens for testing
  const initialSupply = ethers.parseEther("1000000");
  await baseToken.mint(deployer.address, initialSupply);
  console.log("Minted initial tokens to deployer");

  // Set early adopter status for deployer
  await rewardsContract.setEarlyAdopter(deployer.address);
  console.log("Set deployer as early adopter");

  // Save deployment addresses
  const deploymentInfo = {
    network: "base-sepolia",
    contracts: {
      BaseToken: await baseToken.getAddress(),
      BaseLyticsRewards: await rewardsContract.getAddress(),
      OptimizedStaking: await stakingContract.getAddress(),
      OptimizedTrading: await tradingContract.getAddress(),
      BaseLyticsGovernance: await governanceContract.getAddress()
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verify contracts on Basescan (if on mainnet)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await baseToken.deploymentTransaction().wait(5);
    
    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: await baseToken.getAddress(),
        constructorArguments: []
      });
      
      await hre.run("verify:verify", {
        address: await rewardsContract.getAddress(),
        constructorArguments: []
      });
      
      await hre.run("verify:verify", {
        address: await stakingContract.getAddress(),
        constructorArguments: [
          await baseToken.getAddress(),
          await rewardsContract.getAddress()
        ]
      });
      
      await hre.run("verify:verify", {
        address: await tradingContract.getAddress(),
        constructorArguments: [await rewardsContract.getAddress()]
      });
      
      await hre.run("verify:verify", {
        address: await governanceContract.getAddress(),
        constructorArguments: [
          await baseToken.getAddress(),
          await rewardsContract.getAddress()
        ]
      });
      
      console.log("All contracts verified!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });