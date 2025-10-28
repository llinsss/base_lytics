const ContractLoader = require("../utils/contract-loader");
const fs = require("fs");
const path = require("path");

async function generateDailySummary() {
  const date = process.argv[2] || new Date().toISOString().split('T')[0];
  
  console.log("📋 Daily Summary Report");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log(`📅 Date: ${date}`);
  console.log("=" .repeat(50));
  
  try {
    const contracts = await ContractLoader.loadAllContracts();
    const summary = await compileSummary(contracts, date);
    
    displaySummary(summary);
    saveSummary(summary, date);
    
  } catch (error) {
    console.error("❌ Summary generation failed:", error.message);
    process.exit(1);
  }
}

async function compileSummary(contracts, date) {
  const summary = {
    date,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {},
    metrics: {},
    alerts: []
  };
  
  // Contract States
  if (contracts.BaseToken) {
    const totalSupply = await contracts.BaseToken.totalSupply();
    const maxSupply = await contracts.BaseToken.maxSupply();
    
    summary.contracts.BaseToken = {
      totalSupply: ContractLoader.formatEther(totalSupply),
      maxSupply: ContractLoader.formatEther(maxSupply),
      utilization: ((totalSupply * 100n) / maxSupply).toString() + "%"
    };
  }
  
  if (contracts.BaseNFT) {
    const currentId = await contracts.BaseNFT.getCurrentTokenId();
    const price = await contracts.BaseNFT.PRICE();
    const contractBalance = await hre.ethers.provider.getBalance(await contracts.BaseNFT.getAddress());
    const paused = await contracts.BaseNFT.paused();
    
    summary.contracts.BaseNFT = {
      totalMinted: currentId.toString(),
      price: ContractLoader.formatEther(price),
      revenue: ContractLoader.formatEther(contractBalance),
      status: paused ? "Paused" : "Active"
    };
  }
  
  if (contracts.BaseStaking) {
    const totalStaked = await contracts.BaseStaking.totalStaked();
    const rewardRate = await contracts.BaseStaking.rewardRate();
    
    summary.contracts.BaseStaking = {
      totalStaked: ContractLoader.formatEther(totalStaked),
      rewardRate: rewardRate.toString() + " bp",
      apy: (rewardRate * 365 / 100).toString() + "%"
    };
  }
  
  // Load daily metrics from event logs
  const eventMetrics = loadDailyEventMetrics(date);
  if (eventMetrics) {
    summary.metrics = eventMetrics;
  }
  
  // Load any alerts from the day
  const dailyAlerts = loadDailyAlerts(date);
  if (dailyAlerts.length > 0) {
    summary.alerts = dailyAlerts;
  }
  
  return summary;
}

function loadDailyEventMetrics(date) {
  const logsDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logsDir)) return null;
  
  const eventFile = `events-${hre.network.name}-${date}.json`;
  const eventPath = path.join(logsDir, eventFile);
  
  if (!fs.existsSync(eventPath)) return null;
  
  const events = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  
  const metrics = {
    totalEvents: events.length,
    transfers: events.filter(e => e.event === "Transfer").length,
    stakes: events.filter(e => e.event === "Staked").length,
    unstakes: events.filter(e => e.event === "Unstaked").length,
    uniqueUsers: [...new Set(events.map(e => e.data.user || e.data.from || e.data.to))].length
  };
  
  return metrics;
}

function loadDailyAlerts(date) {
  const alertsDir = path.join(__dirname, "../../alerts");
  if (!fs.existsSync(alertsDir)) return [];
  
  const alertFiles = fs.readdirSync(alertsDir)
    .filter(f => f.includes(date) && f.endsWith('.json'));
  
  let allAlerts = [];
  alertFiles.forEach(file => {
    const alertData = JSON.parse(fs.readFileSync(path.join(alertsDir, file), 'utf8'));
    allAlerts = allAlerts.concat(alertData.alerts || []);
  });
  
  return allAlerts;
}

function displaySummary(summary) {
  console.log("\n📊 Contract Summary:");
  
  Object.entries(summary.contracts).forEach(([contract, data]) => {
    console.log(`\n🔸 ${contract}:`);
    Object.entries(data).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  });
  
  if (Object.keys(summary.metrics).length > 0) {
    console.log("\n📈 Daily Metrics:");
    Object.entries(summary.metrics).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  }
  
  if (summary.alerts.length > 0) {
    console.log(`\n🚨 Alerts: ${summary.alerts.length}`);
    summary.alerts.forEach((alert, i) => {
      console.log(`   ${i + 1}. ${alert.severity}: ${alert.message}`);
    });
  } else {
    console.log("\n✅ No alerts for this period");
  }
  
  // Health Score
  const healthScore = calculateHealthScore(summary);
  console.log(`\n💚 System Health Score: ${healthScore}/100`);
}

function calculateHealthScore(summary) {
  let score = 100;
  
  // Deduct for alerts
  summary.alerts.forEach(alert => {
    switch (alert.severity) {
      case "CRITICAL": score -= 20; break;
      case "WARNING": score -= 10; break;
      case "INFO": score -= 5; break;
    }
  });
  
  // Deduct for paused contracts
  Object.values(summary.contracts).forEach(contract => {
    if (contract.status === "Paused") score -= 15;
  });
  
  return Math.max(0, score);
}

function saveSummary(summary, date) {
  const reportsDir = path.join(__dirname, "../../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `daily-summary-${hre.network.name}-${date}.json`;
  fs.writeFileSync(
    path.join(reportsDir, filename),
    JSON.stringify(summary, null, 2)
  );
  
  console.log(`\n💾 Summary saved to reports/${filename}`);
}

generateDailySummary();