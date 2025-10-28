const ContractLoader = require("./contract-loader");

async function contractInfo() {
  const address = process.argv[2];
  
  try {
    console.log("📊 BaseLytics Contract Information");
    console.log(`📍 Network: ${hre.network.name}`);
    console.log("=" .repeat(60));
    
    const contracts = await ContractLoader.loadAllContracts();
    const signer = await ContractLoader.getSigner();
    
    if (address) {
      console.log(`👤 Address: ${address}`);
      await showUserInfo(contracts, address);
    } else {
      console.log(`👤 Current User: ${signer.address}`);
      await showUserInfo(contracts, signer.address);
    }
    
    console.log("\n📋 Contract States:");
    await showContractStates(contracts);
    
  } catch (error) {
    console.error("❌ Failed to get contract info:", error.message);
    process.exit(1);
  }
}

async function showUserInfo(contracts, address) {
  console.log("\n💼 User Balances:");
  
  // ETH Balance
  const ethBalance = await hre.ethers.provider.getBalance(address);
  console.log(`   ETH: ${ContractLoader.formatEther(ethBalance)}`);
  
  // Token Balances
  if (contracts.BaseToken) {
    const tokenBalance = await contracts.BaseToken.balanceOf(address);
    console.log(`   BaseToken: ${ContractLoader.formatEther(tokenBalance)}`);
  }
  
  if (contracts.BalanceManager) {
    const bmBalance = await contracts.BalanceManager.balanceOf(address);
    console.log(`   BalanceManager: ${ContractLoader.formatEther(bmBalance)}`);
  }
  
  // NFT Balance
  if (contracts.BaseNFT) {
    const nftBalance = await contracts.BaseNFT.balanceOf(address);
    console.log(`   BaseNFT: ${nftBalance} NFTs`);
  }
  
  // Staking Info
  if (contracts.BaseStaking) {
    const stake = await contracts.BaseStaking.stakes(address);
    const reward = await contracts.BaseStaking.calculateReward(address);
    console.log(`   Staked: ${ContractLoader.formatEther(stake.amount)}`);
    console.log(`   Rewards: ${ContractLoader.formatEther(reward)}`);
  }
}

async function showContractStates(contracts) {
  
  // BaseToken Info
  if (contracts.BaseToken) {
    console.log("\n🪙 BaseToken:");
    const name = await contracts.BaseToken.name();
    const symbol = await contracts.BaseToken.symbol();
    const totalSupply = await contracts.BaseToken.totalSupply();
    const maxSupply = await contracts.BaseToken.maxSupply();
    const owner = await contracts.BaseToken.owner();
    
    console.log(`   Name: ${name} (${symbol})`);
    console.log(`   Supply: ${ContractLoader.formatEther(totalSupply)} / ${ContractLoader.formatEther(maxSupply)}`);
    console.log(`   Owner: ${owner}`);
  }
  
  // BaseNFT Info
  if (contracts.BaseNFT) {
    console.log("\n🎨 BaseNFT:");
    const name = await contracts.BaseNFT.name();
    const symbol = await contracts.BaseNFT.symbol();
    const currentId = await contracts.BaseNFT.getCurrentTokenId();
    const price = await contracts.BaseNFT.PRICE();
    const mintingEnabled = await contracts.BaseNFT.mintingEnabled();
    const paused = await contracts.BaseNFT.paused();
    
    console.log(`   Name: ${name} (${symbol})`);
    console.log(`   Total Supply: ${currentId}`);
    console.log(`   Price: ${ContractLoader.formatEther(price)} ETH`);
    console.log(`   Minting: ${mintingEnabled ? "Enabled" : "Disabled"}`);
    console.log(`   Status: ${paused ? "Paused" : "Active"}`);
  }
  
  // BaseStaking Info
  if (contracts.BaseStaking) {
    console.log("\n🏦 BaseStaking:");
    const totalStaked = await contracts.BaseStaking.totalStaked();
    const rewardRate = await contracts.BaseStaking.rewardRate();
    
    console.log(`   Total Staked: ${ContractLoader.formatEther(totalStaked)}`);
    console.log(`   Reward Rate: ${rewardRate} basis points (${rewardRate/100}%)`);
  }
  
  // BaseDEX Info
  if (contracts.BaseDEX) {
    console.log("\n💱 BaseDEX:");
    console.log(`   Status: Deployed`);
  }
  
  // BaseMarketplace Info
  if (contracts.BaseMarketplace) {
    console.log("\n🛒 BaseMarketplace:");
    console.log(`   Status: Deployed`);
  }
}

contractInfo();