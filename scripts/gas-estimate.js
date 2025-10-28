const hre = require("hardhat");

const CONTRACTS = [
  "BaseToken",
  "BaseNFT", 
  "BaseStaking",
  "BalanceManager",
  "BalanceTracker",
  "BaseDEX",
  "BaseMarketplace",
  "BaseVesting",
  "BaseGovernance"
];

async function estimateGas() {
  console.log("⛽ Gas Estimation Report");
  console.log("=" .repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  let totalGas = 0n;
  
  for (const contractName of CONTRACTS) {
    try {
      const Contract = await hre.ethers.getContractFactory(contractName);
      
      // Get constructor args based on contract
      let args = [];
      switch (contractName) {
        case "BaseToken":
          args = ["BaseLytics Token", "BLT", hre.ethers.parseEther("1000000")];
          break;
        case "BaseNFT":
          args = ["BaseLytics NFT", "BLNFT", "https://api.baselytics.com/nft/"];
          break;
        case "BalanceManager":
          args = ["Balance Manager Token", "BMT", hre.ethers.parseEther("500000")];
          break;
        case "BaseStaking":
        case "BaseVesting":
        case "BaseGovernance":
          args = ["0x0000000000000000000000000000000000000000"]; // placeholder
          break;
      }
      
      const deployTx = await Contract.getDeployTransaction(...args);
      const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
      
      totalGas += gasEstimate;
      
      console.log(`${contractName.padEnd(20)} ${gasEstimate.toString().padStart(10)} gas`);
      
    } catch (error) {
      console.log(`${contractName.padEnd(20)} ${"ERROR".padStart(10)} - ${error.message.split('\n')[0]}`);
    }
  }
  
  console.log("=" .repeat(60));
  console.log(`${"TOTAL".padEnd(20)} ${totalGas.toString().padStart(10)} gas`);
  
  // Estimate cost at different gas prices
  const gasPrices = [1, 5, 10, 20]; // gwei
  console.log("\n💰 Estimated Deployment Costs:");
  console.log("=" .repeat(40));
  
  gasPrices.forEach(price => {
    const costWei = totalGas * BigInt(price * 1e9);
    const costEth = hre.ethers.formatEther(costWei);
    console.log(`${price} gwei: ${costEth} ETH`);
  });
}

estimateGas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Gas estimation failed:", error);
    process.exit(1);
  });