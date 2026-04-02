const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying on Celo with account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CELO");

  const BaseToken = await hre.ethers.getContractFactory("BaseToken");
  const token = await BaseToken.deploy(
    "BaseLytics Token",
    "BLT",
    hre.ethers.parseEther("1000000")
  );
  await token.waitForDeployment();
  const address = await token.getAddress();
  console.log("BaseToken deployed to:", address);

  const info = {
    network: hre.network.name,
    chainId: 42220,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: { BaseToken: address }
  };

  fs.writeFileSync(
    `deployments/celo-${Date.now()}.json`,
    JSON.stringify(info, null, 2)
  );

  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network celo ${address} "BaseLytics Token" "BLT" "1000000000000000000000000"`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
