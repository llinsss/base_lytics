const ContractLoader = require("../utils/contract-loader");

async function userJourney() {
  const scenario = process.argv[2] || "complete";
  
  console.log("🚀 BaseLytics User Journey Simulation");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log(`🎯 Scenario: ${scenario}`);
  console.log("=" .repeat(50));
  
  try {
    const baseToken = await ContractLoader.loadContract("BaseToken");
    const baseNFT = await ContractLoader.loadContract("BaseNFT");
    const baseStaking = await ContractLoader.loadContract("BaseStaking");
    const signer = await ContractLoader.getSigner();
    
    console.log(`👤 User: ${signer.address}`);
    
    if (scenario === "complete" || scenario === "tokens") {
      await simulateTokenOperations(baseToken, signer);
    }
    
    if (scenario === "complete" || scenario === "nft") {
      await simulateNFTOperations(baseNFT, signer);
    }
    
    if (scenario === "complete" || scenario === "staking") {
      await simulateStakingOperations(baseToken, baseStaking, signer);
    }
    
    console.log("\n🎉 User journey completed successfully!");
    
  } catch (error) {
    console.error("❌ User journey failed:", error.message);
    process.exit(1);
  }
}

async function simulateTokenOperations(baseToken, signer) {
  console.log("\n🪙 Token Operations:");
  
  // Check initial balance
  const initialBalance = await baseToken.balanceOf(signer.address);
  console.log(`   Initial balance: ${ContractLoader.formatEther(initialBalance)} tokens`);
  
  // If user has no tokens, they need to get some (from owner or faucet)
  if (initialBalance === 0n) {
    console.log("   ⚠️  No tokens found. User needs tokens to continue.");
    return;
  }
  
  // Transfer some tokens to another address (simulate payment)
  const transferAmount = ContractLoader.parseEther("10");
  if (initialBalance >= transferAmount) {
    console.log("   📤 Transferring 10 tokens...");
    const tx = await baseToken.transfer("0x0000000000000000000000000000000000000001", transferAmount);
    await tx.wait();
    console.log("   ✅ Transfer completed");
  }
}

async function simulateNFTOperations(baseNFT, signer) {
  console.log("\n🎨 NFT Operations:");
  
  // Check NFT price and user ETH balance
  const price = await baseNFT.PRICE();
  const ethBalance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log(`   NFT Price: ${ContractLoader.formatEther(price)} ETH`);
  console.log(`   ETH Balance: ${ContractLoader.formatEther(ethBalance)} ETH`);
  
  // Mint NFT if user has enough ETH
  if (ethBalance >= price) {
    console.log("   🎨 Minting NFT...");
    const tx = await baseNFT.mint({ value: price });
    await tx.wait();
    
    const balance = await baseNFT.balanceOf(signer.address);
    console.log(`   ✅ NFT minted! Total NFTs: ${balance}`);
  } else {
    console.log("   ⚠️  Insufficient ETH for NFT minting");
  }
}

async function simulateStakingOperations(baseToken, baseStaking, signer) {
  console.log("\n🏦 Staking Operations:");
  
  const balance = await baseToken.balanceOf(signer.address);
  console.log(`   Token balance: ${ContractLoader.formatEther(balance)} tokens`);
  
  if (balance === 0n) {
    console.log("   ⚠️  No tokens to stake");
    return;
  }
  
  // Stake 50% of tokens
  const stakeAmount = balance / 2n;
  
  // Approve tokens
  console.log("   🔓 Approving tokens for staking...");
  const approveTx = await baseToken.approve(await baseStaking.getAddress(), stakeAmount);
  await approveTx.wait();
  
  // Stake tokens
  console.log(`   🔒 Staking ${ContractLoader.formatEther(stakeAmount)} tokens...`);
  const stakeTx = await baseStaking.stake(stakeAmount);
  await stakeTx.wait();
  
  // Check staking info
  const stake = await baseStaking.stakes(signer.address);
  console.log(`   ✅ Staked: ${ContractLoader.formatEther(stake.amount)} tokens`);
  
  // Simulate time passing and check rewards
  console.log("   ⏰ Simulating time passage...");
  const reward = await baseStaking.calculateReward(signer.address);
  console.log(`   💎 Current rewards: ${ContractLoader.formatEther(reward)} tokens`);
}

userJourney();