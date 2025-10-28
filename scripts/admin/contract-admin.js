const ContractLoader = require("../utils/contract-loader");

async function contractAdmin() {
  const contract = process.argv[2];
  const action = process.argv[3];
  const param1 = process.argv[4];
  const param2 = process.argv[5];
  
  if (!contract || !action) {
    console.log("Usage: npx hardhat run scripts/admin/contract-admin.js --network <network> <contract> <action> [params]");
    console.log("\nAvailable contracts: BaseToken, BaseNFT, BaseStaking");
    console.log("\nBaseToken actions:");
    console.log("  set-max-supply <amount>     - Set maximum supply");
    console.log("  transfer-ownership <address> - Transfer ownership");
    console.log("\nBaseNFT actions:");
    console.log("  pause                       - Pause contract");
    console.log("  unpause                     - Unpause contract");
    console.log("  toggle-minting              - Enable/disable minting");
    console.log("  withdraw                    - Withdraw ETH");
    console.log("  set-base-uri <uri>          - Set base URI");
    console.log("\nBaseStaking actions:");
    console.log("  set-reward-rate <rate>      - Set reward rate (basis points)");
    console.log("  emergency-withdraw          - Emergency withdraw");
    process.exit(1);
  }
  
  try {
    console.log(`⚙️  Contract Admin: ${contract}`);
    console.log(`📍 Network: ${hre.network.name}`);
    
    const contractInstance = await ContractLoader.loadContract(contract);
    const signer = await ContractLoader.getSigner();
    
    // Verify ownership
    const owner = await contractInstance.owner();
    if (signer.address !== owner) {
      throw new Error("Only contract owner can perform admin actions");
    }
    
    console.log(`👤 Admin: ${signer.address}`);
    console.log(`🎯 Action: ${action}`);
    
    let tx;
    
    if (contract === "BaseToken") {
      if (action === "set-max-supply") {
        const amount = ContractLoader.parseEther(param1);
        tx = await contractInstance.setMaxSupply(amount);
        console.log(`📈 Setting max supply to ${param1} tokens...`);
        
      } else if (action === "transfer-ownership") {
        tx = await contractInstance.transferOwnership(param1);
        console.log(`👑 Transferring ownership to ${param1}...`);
        
      } else {
        throw new Error(`Unknown BaseToken action: ${action}`);
      }
      
    } else if (contract === "BaseNFT") {
      if (action === "pause") {
        tx = await contractInstance.pause();
        console.log(`⏸️  Pausing contract...`);
        
      } else if (action === "unpause") {
        tx = await contractInstance.unpause();
        console.log(`▶️  Unpausing contract...`);
        
      } else if (action === "toggle-minting") {
        tx = await contractInstance.toggleMinting();
        console.log(`🔄 Toggling minting status...`);
        
      } else if (action === "withdraw") {
        tx = await contractInstance.withdraw();
        console.log(`💸 Withdrawing ETH...`);
        
      } else if (action === "set-base-uri") {
        tx = await contractInstance.setBaseURI(param1);
        console.log(`🔗 Setting base URI to ${param1}...`);
        
      } else {
        throw new Error(`Unknown BaseNFT action: ${action}`);
      }
      
    } else if (contract === "BaseStaking") {
      if (action === "set-reward-rate") {
        const rate = parseInt(param1);
        tx = await contractInstance.setRewardRate(rate);
        console.log(`📊 Setting reward rate to ${rate} basis points...`);
        
      } else if (action === "emergency-withdraw") {
        tx = await contractInstance.emergencyWithdraw();
        console.log(`🚨 Emergency withdraw...`);
        
      } else {
        throw new Error(`Unknown BaseStaking action: ${action}`);
      }
      
    } else {
      throw new Error(`Unknown contract: ${contract}`);
    }
    
    console.log(`⏳ Transaction: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Admin action completed successfully!`);
    
  } catch (error) {
    console.error("❌ Admin action failed:", error.message);
    process.exit(1);
  }
}

contractAdmin();