const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying contracts on BaseScan...");

  // Contract addresses from deployment
  const baseTokenAddress = "CONTRACT_ADDRESS_HERE"; // Replace with actual address
  const baseNFTAddress = "CONTRACT_ADDRESS_HERE";   // Replace with actual address
  const baseStakingAddress = "CONTRACT_ADDRESS_HERE"; // Replace with actual address

  try {
    // Verify BaseToken
    console.log("🪙 Verifying BaseToken...");
    await hre.run("verify:verify", {
      address: baseTokenAddress,
      constructorArguments: [
        "BaseLytics Token",
        "BLT",
        hre.ethers.parseEther("1000000")
      ],
    });
    console.log("✅ BaseToken verified successfully!");

    // Verify BaseNFT
    console.log("🎨 Verifying BaseNFT...");
    await hre.run("verify:verify", {
      address: baseNFTAddress,
      constructorArguments: [
        "BaseLytics NFT",
        "BLNFT",
        "https://api.baselytics.com/nft/"
      ],
    });
    console.log("✅ BaseNFT verified successfully!");

    // Verify BaseStaking
    console.log("🏦 Verifying BaseStaking...");
    await hre.run("verify:verify", {
      address: baseStakingAddress,
      constructorArguments: [baseTokenAddress],
    });
    console.log("✅ BaseStaking verified successfully!");

    console.log("\n🎉 All contracts verified successfully!");
    console.log("📋 Contract addresses:");
    console.log("BaseToken:", baseTokenAddress);
    console.log("BaseNFT:", baseNFTAddress);
    console.log("BaseStaking:", baseStakingAddress);

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
