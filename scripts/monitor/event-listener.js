const ContractLoader = require("../utils/contract-loader");
const fs = require("fs");
const path = require("path");

class EventMonitor {
  constructor() {
    this.contracts = {};
    this.listeners = [];
    this.eventLog = [];
  }
  
  async initialize() {
    console.log("🔍 Initializing Event Monitor...");
    console.log(`📍 Network: ${hre.network.name}`);
    
    this.contracts = await ContractLoader.loadAllContracts();
    this.setupEventListeners();
    
    console.log("✅ Event monitoring started");
    console.log("📊 Monitoring contracts:", Object.keys(this.contracts).join(", "));
  }
  
  setupEventListeners() {
    // BaseToken Events
    if (this.contracts.BaseToken) {
      this.contracts.BaseToken.on("Transfer", (from, to, value, event) => {
        this.logEvent("BaseToken", "Transfer", { from, to, value: ContractLoader.formatEther(value) }, event);
      });
    }
    
    // BaseNFT Events
    if (this.contracts.BaseNFT) {
      this.contracts.BaseNFT.on("Transfer", (from, to, tokenId, event) => {
        this.logEvent("BaseNFT", "Transfer", { from, to, tokenId: tokenId.toString() }, event);
      });
    }
    
    // BaseStaking Events
    if (this.contracts.BaseStaking) {
      this.contracts.BaseStaking.on("Staked", (user, amount, event) => {
        this.logEvent("BaseStaking", "Staked", { user, amount: ContractLoader.formatEther(amount) }, event);
      });
      
      this.contracts.BaseStaking.on("Unstaked", (user, amount, event) => {
        this.logEvent("BaseStaking", "Unstaked", { user, amount: ContractLoader.formatEther(amount) }, event);
      });
    }
  }
  
  logEvent(contract, eventName, data, event) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      contract,
      event: eventName,
      data,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash
    };
    
    this.eventLog.push(logEntry);
    console.log(`📝 ${timestamp} | ${contract}.${eventName} | ${JSON.stringify(data)}`);
    
    // Save to file periodically
    if (this.eventLog.length % 10 === 0) {
      this.saveEventLog();
    }
  }
  
  saveEventLog() {
    const logsDir = path.join(__dirname, "../../logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const filename = `events-${hre.network.name}-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(
      path.join(logsDir, filename),
      JSON.stringify(this.eventLog, null, 2)
    );
  }
  
  stop() {
    console.log("🛑 Stopping event monitor...");
    this.listeners.forEach(listener => listener.removeAllListeners());
    this.saveEventLog();
  }
}

async function startMonitoring() {
  const monitor = new EventMonitor();
  
  try {
    await monitor.initialize();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      monitor.stop();
      process.exit(0);
    });
    
    // Keep the process running
    console.log("Press Ctrl+C to stop monitoring");
    
  } catch (error) {
    console.error("❌ Monitoring failed:", error.message);
    process.exit(1);
  }
}

startMonitoring();