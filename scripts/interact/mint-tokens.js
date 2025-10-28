const ContractLoader = require("../utils/contract-loader");

async function mintTokens() {
  const recipient = process.argv[2];
  const amount = process.argv[3];
  
  if (!recipient || !amount) {
    console.log("Usage: npx hardhat run scripts/interact/mint-tokens.js --network <network> <recipient> <amount>");
    console.log("Example: npx hardhat run scripts/interact/mint-tokens.js --network baseSepolia 0x123... 1000");
    process.exit(1);
  }
  
  try {
    console.log("🪙 Minting BaseTokens...");
    console.log(`📍 Network: ${hre.network.name}`);
    
    const baseToken = await ContractLoader.loadContract("BaseToken");
    const signer = await ContractLoader.getSigner();
    
    console.log(`👤 Minter: ${signer.address}`);
    console.log(`🎯 Recipient: ${recipient}`);
    console.log(`💰 Amount: ${amount} tokens`);
    
    // Check if signer is owner
    const owner = await baseToken.owner();
    if (signer.address !== owner) {
      throw new Error("Only contract owner can mint tokens");
    }
    
    // Mint tokens
    const mintAmount = ContractLoader.parseEther(amount);
    const tx = await baseToken.mint(recipient, mintAmount);
    
    console.log(`⏳ Transaction: ${tx.hash}`);
    await tx.wait();
    
    // Check new balance
    const balance = await baseToken.balanceOf(recipient);
    console.log(`✅ Minted successfully!`);
    console.log(`💼 New balance: ${ContractLoader.formatEther(balance)} tokens`);
    
  } catch (error) {
    console.error("❌ Minting failed:", error.message);
    process.exit(1);
  }
}

mintTokens();