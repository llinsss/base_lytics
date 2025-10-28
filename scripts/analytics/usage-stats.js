const ContractLoader = require("../utils/contract-loader");
const fs = require("fs");
const path = require("path");

async function generateUsageStats() {
  const timeframe = process.argv[2] || "24h"; // 24h, 7d, 30d
  
  console.log("📊 Generating Usage Statistics");
  console.log(`📍 Network: ${hre.network.name}`);
  console.log(`⏰ Timeframe: ${timeframe}`);
  console.log("=" .repeat(50));
  
  try {
    const contracts = await ContractLoader.loadAllContracts();
    const stats = await collectStats(contracts, timeframe);
    
    displayStats(stats);
    saveStats(stats, timeframe);
    
  } catch (error) {
    console.error("❌ Stats generation failed:", error.message);
    process.exit(1);
  }
}

async function collectStats(contracts, timeframe) {
  const stats = {
    timestamp: new Date().toISOString(),
    timeframe,
    network: hre.network.name,
    contracts: {}
  };
  
  // BaseToken Stats
  if (contracts.BaseToken) {
    const totalSupply = await contracts.BaseToken.totalSupply();
    const maxSupply = await contracts.BaseToken.maxSupply();
    
    stats.contracts.BaseToken = {
      totalSupply: ContractLoader.formatEther(totalSupply),
      maxSupply: ContractLoader.formatEther(maxSupply),
      supplyUtilization: ((totalSupply * 100n) / maxSupply).toString() + "%"
    };
  }
  
  // BaseNFT Stats
  if (contracts.BaseNFT) {
    const currentId = await contracts.BaseNFT.getCurrentTokenId();
    const price = await contracts.BaseNFT.PRICE();
    const mintingEnabled = await contracts.BaseNFT.mintingEnabled();
    
    stats.contracts.BaseNFT = {
      totalMinted: currentId.toString(),
      mintPrice: ContractLoader.formatEther(price),
      mintingEnabled,
      estimatedRevenue: ContractLoader.formatEther(currentId * price)
    };
  }
  
  // BaseStaking Stats
  if (contracts.BaseStaking) {
    const totalStaked = await contracts.BaseStaking.totalStaked();
    const rewardRate = await contracts.BaseStaking.rewardRate();
    
    stats.contracts.BaseStaking = {
      totalStaked: ContractLoader.formatEther(totalStaked),
      rewardRate: rewardRate.toString() + " basis points",
      stakingAPY: (rewardRate * 365 / 100).toString() + "%"
    };
  }
  
  // Load event data if available
  const eventStats = loadEventStats(timeframe);
  if (eventStats) {
    stats.events = eventStats;
  }
  
  return stats;
}

function loadEventStats(timeframe) {
  const logsDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(logsDir)) return null;
  
  const files = fs.readdirSync(logsDir)
    .filter(f => f.startsWith(`events-${hre.network.name}`) && f.endsWith('.json'));
  
  if (files.length === 0) return null;
  
  // Load latest event log
  const latestFile = files.sort().reverse()[0];
  const events = JSON.parse(fs.readFileSync(path.join(logsDir, latestFile), 'utf8'));
  
  // Filter by timeframe
  const cutoffTime = getTimeframeCutoff(timeframe);
  const recentEvents = events.filter(e => new Date(e.timestamp) > cutoffTime);
  
  // Aggregate event stats
  const eventStats = {
    totalEvents: recentEvents.length,
    byContract: {},
    byType: {}
  };
  
  recentEvents.forEach(event => {
    // By contract
    if (!eventStats.byContract[event.contract]) {
      eventStats.byContract[event.contract] = 0;
    }
    eventStats.byContract[event.contract]++;
    
    // By event type
    const eventKey = `${event.contract}.${event.event}`;
    if (!eventStats.byType[eventKey]) {
      eventStats.byType[eventKey] = 0;
    }
    eventStats.byType[eventKey]++;
  });
  
  return eventStats;
}

function getTimeframeCutoff(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function displayStats(stats) {
  console.log("\n📈 Contract Statistics:");
  
  Object.entries(stats.contracts).forEach(([contract, data]) => {
    console.log(`\n🔸 ${contract}:`);
    Object.entries(data).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
  });
  
  if (stats.events) {
    console.log("\n📝 Event Activity:");
    console.log(`   Total Events: ${stats.events.totalEvents}`);
    
    console.log("\n   By Contract:");
    Object.entries(stats.events.byContract).forEach(([contract, count]) => {
      console.log(`     ${contract}: ${count} events`);
    });
    
    console.log("\n   By Type:");
    Object.entries(stats.events.byType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });
  }
}

function saveStats(stats, timeframe) {
  const reportsDir = path.join(__dirname, "../../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const filename = `usage-stats-${hre.network.name}-${timeframe}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(reportsDir, filename),
    JSON.stringify(stats, null, 2)
  );
  
  console.log(`\n💾 Stats saved to reports/${filename}`);
}

generateUsageStats();