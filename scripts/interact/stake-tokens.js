const ContractLoader = require("../utils/contract-loader");

async function stakeTokens() {
  const amount = process.argv[2];
  const action = process.argv[3] || "stake"; // stake, unstake, claim, info
  
  if (!amount && action !== "info") {
    console.log("Usage: npx hardhat run scripts/interact/stake-tokens.js --network <network> <amount> [action]");
    console.log("Actions: stake, unstake, claim, info");
    console.log("Example: npx hardhat run scripts/interact/stake-tokens.js --network baseSepolia 100 stake");
    process.exit(1);
  }
  
  try {
    console.log("🏦 BaseStaking Operations...");
    console.log(`📍 Network: ${hre.network.name}`);
    
    const baseToken = await ContractLoader.loadContract("BaseToken");
    const baseStaking = await ContractLoader.loadContract("BaseStaking");
    const signer = await ContractLoader.getSigner();
    
    console.log(`👤 User: ${signer.address}`);
    
    if (action === "info") {
      // Show staking info
      const stake = await baseStaking.stakes(signer.address);
      const reward = await baseStaking.calculateReward(signer.address);
      const totalStaked = await baseStaking.totalStaked();
      
      console.log(`📊 Staking Information:`);
      console.log(`   Staked: ${ContractLoader.formatEther(stake.amount)} tokens`);
      console.log(`   Rewards: ${ContractLoader.formatEther(reward)} tokens`);
      console.log(`   Total Staked: ${ContractLoader.formatEther(totalStaked)} tokens`);
      return;
    }
    
    const tokenAmount = ContractLoader.parseEther(amount);
    
    if (action === "stake") {
      // Check balance
      const balance = await baseToken.balanceOf(signer.address);
      if (balance < tokenAmount) {
        throw new Error("Insufficient token balance");
      }
      
      // Approve if needed
      const allowance = await baseToken.allowance(signer.address, await baseStaking.getAddress());
      if (allowance < tokenAmount) {
        console.log("🔓 Approving tokens...");
        const approveTx = await baseToken.approve(await baseStaking.getAddress(), tokenAmount);
        await approveTx.wait();
      }
      
      // Stake
      console.log(`🔒 Staking ${amount} tokens...`);
      const tx = await baseStaking.stake(tokenAmount);
      await tx.wait();
      console.log(`✅ Staked successfully!`);
      
    } else if (action === "unstake") {
      console.log(`🔓 Unstaking ${amount} tokens...`);
      const tx = await baseStaking.unstake(tokenAmount);
      await tx.wait();
      console.log(`✅ Unstaked successfully!`);
      
    } else if (action === "claim") {
      console.log(`💰 Claiming rewards...`);
      const tx = await baseStaking.claimReward();
      await tx.wait();
      console.log(`✅ Rewards claimed!`);
    }
    
    // Show updated info
    const stake = await baseStaking.stakes(signer.address);
    const reward = await baseStaking.calculateReward(signer.address);
    console.log(`📊 Updated stake: ${ContractLoader.formatEther(stake.amount)} tokens`);
    console.log(`💎 Pending rewards: ${ContractLoader.formatEther(reward)} tokens`);
    
  } catch (error) {
    console.error("❌ Staking operation failed:", error.message);
    process.exit(1);
  }
}

stakeTokens();