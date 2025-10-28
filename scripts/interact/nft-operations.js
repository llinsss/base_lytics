const ContractLoader = require("../utils/contract-loader");

async function nftOperations() {
  const action = process.argv[2]; // mint, batch-mint, info, transfer
  const param1 = process.argv[3];
  const param2 = process.argv[4];
  
  if (!action) {
    console.log("Usage: npx hardhat run scripts/interact/nft-operations.js --network <network> <action> [params]");
    console.log("Actions:");
    console.log("  mint                    - Mint 1 NFT (pays ETH)");
    console.log("  batch-mint <count>      - Owner mint multiple NFTs");
    console.log("  info [address]          - Show NFT info");
    console.log("  transfer <to> <tokenId> - Transfer NFT");
    process.exit(1);
  }
  
  try {
    console.log("🎨 BaseNFT Operations...");
    console.log(`📍 Network: ${hre.network.name}`);
    
    const baseNFT = await ContractLoader.loadContract("BaseNFT");
    const signer = await ContractLoader.getSigner();
    
    console.log(`👤 User: ${signer.address}`);
    
    if (action === "mint") {
      const price = await baseNFT.PRICE();
      console.log(`💰 NFT Price: ${ContractLoader.formatEther(price)} ETH`);
      
      const tx = await baseNFT.mint({ value: price });
      console.log(`⏳ Transaction: ${tx.hash}`);
      await tx.wait();
      
      const currentId = await baseNFT.getCurrentTokenId();
      console.log(`✅ Minted NFT #${currentId}`);
      
    } else if (action === "batch-mint") {
      const count = parseInt(param1);
      if (!count || count <= 0) {
        throw new Error("Invalid count for batch mint");
      }
      
      // Check if owner
      const owner = await baseNFT.owner();
      if (signer.address !== owner) {
        throw new Error("Only owner can batch mint");
      }
      
      console.log(`🎨 Batch minting ${count} NFTs...`);
      const tx = await baseNFT.ownerMint(signer.address, count);
      await tx.wait();
      
      console.log(`✅ Batch minted ${count} NFTs`);
      
    } else if (action === "info") {
      const address = param1 || signer.address;
      
      const balance = await baseNFT.balanceOf(address);
      const totalSupply = await baseNFT.getCurrentTokenId();
      const mintingEnabled = await baseNFT.mintingEnabled();
      const paused = await baseNFT.paused();
      
      console.log(`📊 NFT Information:`);
      console.log(`   Address: ${address}`);
      console.log(`   Balance: ${balance} NFTs`);
      console.log(`   Total Supply: ${totalSupply}`);
      console.log(`   Minting Enabled: ${mintingEnabled}`);
      console.log(`   Paused: ${paused}`);
      
      if (balance > 0) {
        console.log(`   Owned Token IDs:`);
        // Note: This would require implementing tokenOfOwnerByIndex or similar
        // For now, just show that they own NFTs
      }
      
    } else if (action === "transfer") {
      const to = param1;
      const tokenId = param2;
      
      if (!to || !tokenId) {
        throw new Error("Transfer requires recipient address and token ID");
      }
      
      console.log(`📤 Transferring NFT #${tokenId} to ${to}...`);
      const tx = await baseNFT.transferFrom(signer.address, to, tokenId);
      await tx.wait();
      
      console.log(`✅ NFT transferred successfully`);
      
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error("❌ NFT operation failed:", error.message);
    process.exit(1);
  }
}

nftOperations();