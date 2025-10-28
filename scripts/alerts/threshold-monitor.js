const ContractLoader = require("../utils/contract-loader");

// Alert thresholds configuration
const THRESHOLDS = {
  nft: {
    maxMintedPerHour: 100,
    lowContractBalance: "0.1" // ETH
  },
  token: {
    maxSupplyUtilization: 90, // percentage
    largeTransferAmount: "10000" // tokens
  },
  staking: {
    maxStakePerUser: "50000", // tokens
    lowRewardRate: 50 // basis points
  }
};

async function monitorThresholds() {
  console.log("🚨 Threshold Monitoring System");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log("=" .repeat(50));
  
  try {
    const contracts = await ContractLoader.loadAllContracts();
    const alerts = await checkThresholds(contracts);
    
    if (alerts.length > 0) {
      displayAlerts(alerts);
      saveAlerts(alerts);
    } else {
      console.log("✅ All systems within normal parameters");
    }
    
  } catch (error) {
    console.error("❌ Threshold monitoring failed:", error.message);
    process.exit(1);
  }
}

async function checkThresholds(contracts) {
  const alerts = [];
  const timestamp = new Date().toISOString();
  
  // NFT Threshold Checks
  if (contracts.BaseNFT) {
    const contractBalance = await hre.ethers.provider.getBalance(await contracts.BaseNFT.getAddress());
    const balanceETH = parseFloat(ContractLoader.formatEther(contractBalance));
    
    if (balanceETH < parseFloat(THRESHOLDS.nft.lowContractBalance)) {
      alerts.push({
        timestamp,
        severity: "WARNING",
        contract: "BaseNFT",
        type: "LOW_BALANCE",
        message: `Contract balance (${balanceETH.toFixed(4)} ETH) below threshold (${THRESHOLDS.nft.lowContractBalance} ETH)`,
        value: balanceETH,
        threshold: parseFloat(THRESHOLDS.nft.lowContractBalance)
      });
    }
  }
  
  // Token Threshold Checks
  if (contracts.BaseToken) {
    const totalSupply = await contracts.BaseToken.totalSupply();
    const maxSupply = await contracts.BaseToken.maxSupply();
    const utilization = Number((totalSupply * 100n) / maxSupply);
    
    if (utilization > THRESHOLDS.token.maxSupplyUtilization) {
      alerts.push({
        timestamp,
        severity: "CRITICAL",
        contract: "BaseToken",
        type: "HIGH_SUPPLY_UTILIZATION",
        message: `Supply utilization (${utilization}%) exceeds threshold (${THRESHOLDS.token.maxSupplyUtilization}%)`,
        value: utilization,
        threshold: THRESHOLDS.token.maxSupplyUtilization
      });
    }
  }
  
  // Staking Threshold Checks
  if (contracts.BaseStaking) {
    const rewardRate = await contracts.BaseStaking.rewardRate();
    
    if (rewardRate < THRESHOLDS.staking.lowRewardRate) {
      alerts.push({
        timestamp,
        severity: "INFO",
        contract: "BaseStaking",
        type: "LOW_REWARD_RATE",
        message: `Reward rate (${rewardRate} bp) below recommended threshold (${THRESHOLDS.staking.lowRewardRate} bp)`,
        value: Number(rewardRate),
        threshold: THRESHOLDS.staking.lowRewardRate
      });
    }
  }
  
  return alerts;
}

function displayAlerts(alerts) {
  console.log(`\n🚨 ${alerts.length} Alert(s) Detected:\n`);
  
  alerts.forEach((alert, index) => {
    const icon = getSeverityIcon(alert.severity);
    console.log(`${icon} Alert #${index + 1}`);
    console.log(`   Severity: ${alert.severity}`);
    console.log(`   Contract: ${alert.contract}`);
    console.log(`   Type: ${alert.type}`);
    console.log(`   Message: ${alert.message}`);
    console.log(`   Time: ${alert.timestamp}`);
    console.log("");
  });
}

function getSeverityIcon(severity) {
  switch (severity) {
    case "CRITICAL": return "🔴";
    case "WARNING": return "🟡";
    case "INFO": return "🔵";
    default: return "⚪";
  }
}

function saveAlerts(alerts) {
  const fs = require("fs");
  const path = require("path");
  
  const alertsDir = path.join(__dirname, "../../alerts");
  if (!fs.existsSync(alertsDir)) {
    fs.mkdirSync(alertsDir, { recursive: true });
  }
  
  const filename = `alerts-${hre.network.name}-${Date.now()}.json`;
  const alertData = {
    timestamp: new Date().toISOString(),
    network: hre.network.name,
    alertCount: alerts.length,
    alerts: alerts
  };
  
  fs.writeFileSync(
    path.join(alertsDir, filename),
    JSON.stringify(alertData, null, 2)
  );
  
  console.log(`💾 Alerts saved to alerts/${filename}`);
}

// Configuration display
function showConfiguration() {
  console.log("⚙️  Alert Thresholds Configuration:");
  console.log(JSON.stringify(THRESHOLDS, null, 2));
}

// Main execution
if (process.argv[2] === "config") {
  showConfiguration();
} else {
  monitorThresholds();
}