const ContractLoader = require("../utils/contract-loader");

async function trackRevenue() {
  console.log("💰 Revenue Tracking Analysis");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log("=" .repeat(50));
  
  try {
    const contracts = await ContractLoader.loadAllContracts();
    const revenue = await calculateRevenue(contracts);
    
    displayRevenue(revenue);
    
  } catch (error) {
    console.error("❌ Revenue tracking failed:", error.message);
    process.exit(1);
  }
}

async function calculateRevenue(contracts) {
  const revenue = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    sources: {}
  };
  
  // NFT Revenue
  if (contracts.BaseNFT) {
    const currentId = await contracts.BaseNFT.getCurrentTokenId();
    const price = await contracts.BaseNFT.PRICE();
    const contractBalance = await hre.ethers.provider.getBalance(await contracts.BaseNFT.getAddress());
    
    revenue.sources.nft = {
      totalMinted: currentId.toString(),
      pricePerNFT: ContractLoader.formatEther(price),
      grossRevenue: ContractLoader.formatEther(currentId * price),
      contractBalance: ContractLoader.formatEther(contractBalance),
      currency: "ETH"
    };
  }
  
  // Token Distribution (if applicable)
  if (contracts.BaseToken) {
    const totalSupply = await contracts.BaseToken.totalSupply();
    const maxSupply = await contracts.BaseToken.maxSupply();
    const owner = await contracts.BaseToken.owner();
    const ownerBalance = await contracts.BaseToken.balanceOf(owner);
    
    revenue.sources.token = {
      totalSupply: ContractLoader.formatEther(totalSupply),
      ownerBalance: ContractLoader.formatEther(ownerBalance),
      distributedTokens: ContractLoader.formatEther(totalSupply - ownerBalance),
      distributionRate: (((totalSupply - ownerBalance) * 100n) / totalSupply).toString() + "%"
    };
  }
  
  // Staking Metrics (indirect revenue indicator)
  if (contracts.BaseStaking) {
    const totalStaked = await contracts.BaseStaking.totalStaked();
    const rewardRate = await contracts.BaseStaking.rewardRate();
    
    revenue.sources.staking = {
      totalValueLocked: ContractLoader.formatEther(totalStaked),
      rewardRate: rewardRate.toString() + " basis points",
      engagementMetric: totalStaked > 0n ? "Active" : "Inactive"
    };
  }
  
  return revenue;
}

function displayRevenue(revenue) {
  console.log("\n💰 Revenue Sources:");
  
  if (revenue.sources.nft) {
    const nft = revenue.sources.nft;
    console.log(`\n🎨 NFT Revenue:`);
    console.log(`   Total Minted: ${nft.totalMinted} NFTs`);
    console.log(`   Price per NFT: ${nft.pricePerNFT} ${nft.currency}`);
    console.log(`   Gross Revenue: ${nft.grossRevenue} ${nft.currency}`);
    console.log(`   Contract Balance: ${nft.contractBalance} ${nft.currency}`);
  }
  
  if (revenue.sources.token) {
    const token = revenue.sources.token;
    console.log(`\n🪙 Token Distribution:`);
    console.log(`   Total Supply: ${token.totalSupply} tokens`);
    console.log(`   Owner Balance: ${token.ownerBalance} tokens`);
    console.log(`   Distributed: ${token.distributedTokens} tokens`);
    console.log(`   Distribution Rate: ${token.distributionRate}`);
  }
  
  if (revenue.sources.staking) {
    const staking = revenue.sources.staking;
    console.log(`\n🏦 Staking Metrics:`);
    console.log(`   Total Value Locked: ${staking.totalValueLocked} tokens`);
    console.log(`   Reward Rate: ${staking.rewardRate}`);
    console.log(`   Engagement: ${staking.engagementMetric}`);
  }
  
  // Calculate total ETH revenue
  let totalETH = 0;
  if (revenue.sources.nft) {
    totalETH += parseFloat(revenue.sources.nft.contractBalance);
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total ETH Revenue: ${totalETH.toFixed(4)} ETH`);
  console.log(`   Timestamp: ${revenue.timestamp}`);
}

trackRevenue();