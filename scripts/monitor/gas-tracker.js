const ContractLoader = require("../utils/contract-loader");

async function trackGasUsage() {
  console.log("⛽ Gas Usage Tracking");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log("=" .repeat(50));
  
  try {
    const contracts = await ContractLoader.loadAllContracts();
    const gasData = await analyzeGasUsage(contracts);
    
    displayGasAnalysis(gasData);
    
  } catch (error) {
    console.error("❌ Gas tracking failed:", error.message);
    process.exit(1);
  }
}

async function analyzeGasUsage(contracts) {
  const gasData = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    gasPrice: await hre.ethers.provider.getGasPrice(),
    estimates: {}
  };
  
  // Estimate gas for common operations
  if (contracts.BaseToken) {
    try {
      const mintGas = await contracts.BaseToken.mint.estimateGas(
        "0x0000000000000000000000000000000000000001",
        ContractLoader.parseEther("1000")
      );
      
      const transferGas = await contracts.BaseToken.transfer.estimateGas(
        "0x0000000000000000000000000000000000000001",
        ContractLoader.parseEther("100")
      );
      
      gasData.estimates.BaseToken = {
        mint: mintGas.toString(),
        transfer: transferGas.toString()
      };
    } catch (error) {
      gasData.estimates.BaseToken = { error: "Estimation failed - check permissions" };
    }
  }
  
  if (contracts.BaseNFT) {
    try {
      const price = await contracts.BaseNFT.PRICE();
      const mintGas = await contracts.BaseNFT.mint.estimateGas({ value: price });
      
      gasData.estimates.BaseNFT = {
        mint: mintGas.toString()
      };
    } catch (error) {
      gasData.estimates.BaseNFT = { error: "Estimation failed" };
    }
  }
  
  if (contracts.BaseStaking) {
    try {
      const stakeGas = await contracts.BaseStaking.stake.estimateGas(
        ContractLoader.parseEther("100")
      );
      
      gasData.estimates.BaseStaking = {
        stake: stakeGas.toString()
      };
    } catch (error) {
      gasData.estimates.BaseStaking = { error: "Estimation failed - check approvals" };
    }
  }
  
  return gasData;
}

function displayGasAnalysis(gasData) {
  const gasPriceGwei = ContractLoader.formatEther(gasData.gasPrice * 1000000000n);
  
  console.log(`\n⛽ Current Gas Price: ${parseFloat(gasPriceGwei).toFixed(2)} gwei`);
  
  console.log("\n📊 Gas Estimates by Operation:");
  
  Object.entries(gasData.estimates).forEach(([contract, operations]) => {
    console.log(`\n🔸 ${contract}:`);
    
    if (operations.error) {
      console.log(`   ⚠️  ${operations.error}`);
      return;
    }
    
    Object.entries(operations).forEach(([operation, gasEstimate]) => {
      const gasCost = BigInt(gasEstimate) * gasData.gasPrice;
      const costETH = ContractLoader.formatEther(gasCost);
      
      console.log(`   ${operation}:`);
      console.log(`     Gas: ${gasEstimate}`);
      console.log(`     Cost: ${parseFloat(costETH).toFixed(6)} ETH`);
    });
  });
  
  // Gas optimization recommendations
  console.log("\n💡 Optimization Recommendations:");
  
  Object.entries(gasData.estimates).forEach(([contract, operations]) => {
    if (operations.error) return;
    
    Object.entries(operations).forEach(([operation, gasEstimate]) => {
      const gas = parseInt(gasEstimate);
      
      if (gas > 200000) {
        console.log(`   🔴 ${contract}.${operation}: High gas usage (${gas})`);
      } else if (gas > 100000) {
        console.log(`   🟡 ${contract}.${operation}: Moderate gas usage (${gas})`);
      } else {
        console.log(`   🟢 ${contract}.${operation}: Efficient gas usage (${gas})`);
      }
    });
  });
}

trackGasUsage();