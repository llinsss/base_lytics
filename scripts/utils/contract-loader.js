const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

class ContractLoader {
  static getLatestDeployment() {
    const deploymentsDir = path.join(__dirname, "../../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      throw new Error("No deployments found. Deploy contracts first.");
    }
    
    const files = fs.readdirSync(deploymentsDir)
      .filter(f => f.startsWith(hre.network.name) && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      throw new Error(`No deployments found for network ${hre.network.name}`);
    }
    
    return JSON.parse(fs.readFileSync(path.join(deploymentsDir, files[0]), 'utf8'));
  }
  
  static async loadContract(contractName) {
    const deployment = this.getLatestDeployment();
    
    if (!deployment.contracts[contractName]) {
      throw new Error(`Contract ${contractName} not found in deployment`);
    }
    
    const contractFactory = await hre.ethers.getContractFactory(contractName);
    return contractFactory.attach(deployment.contracts[contractName]);
  }
  
  static async loadAllContracts() {
    const deployment = this.getLatestDeployment();
    const contracts = {};
    
    for (const [name, address] of Object.entries(deployment.contracts)) {
      try {
        const contractFactory = await hre.ethers.getContractFactory(name);
        contracts[name] = contractFactory.attach(address);
      } catch (error) {
        console.log(`⚠️  Could not load ${name}: ${error.message}`);
      }
    }
    
    return contracts;
  }
  
  static async getSigner() {
    const [signer] = await hre.ethers.getSigners();
    return signer;
  }
  
  static formatEther(value) {
    return hre.ethers.formatEther(value);
  }
  
  static parseEther(value) {
    return hre.ethers.parseEther(value);
  }
}

module.exports = ContractLoader;