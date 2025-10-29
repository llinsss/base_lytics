const fs = require("fs");
const path = require("path");

function generateFrontendConfig() {
  const network = process.argv[2] || "baseSepolia";
  
  console.log("🔧 Generating Frontend Configuration");
  console.log(`📍 Network: ${network}`);
  console.log("=" .repeat(50));
  
  try {
    // Load latest deployment
    const deployment = getLatestDeployment(network);
    if (!deployment) {
      throw new Error(`No deployment found for network ${network}`);
    }
    
    // Generate config
    const config = generateConfig(deployment, network);
    
    // Save to frontend
    saveFrontendConfig(config);
    
    console.log("✅ Frontend configuration generated successfully!");
    console.log(`📋 Contracts: ${Object.keys(deployment.contracts).join(", ")}`);
    
  } catch (error) {
    console.error("❌ Config generation failed:", error.message);
    process.exit(1);
  }
}

function getLatestDeployment(network) {
  const deploymentsDir = path.join(__dirname, "../../deployments");
  if (!fs.existsSync(deploymentsDir)) return null;
  
  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith(network) && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) return null;
  
  return JSON.parse(fs.readFileSync(path.join(deploymentsDir, files[0]), 'utf8'));
}

function generateConfig(deployment, network) {
  const chainId = getChainId(network);
  
  return {
    network: network,
    chainId: chainId,
    timestamp: new Date().toISOString(),
    contracts: deployment.contracts,
    deployer: deployment.deployer,
    deploymentTimestamp: deployment.timestamp
  };
}

function getChainId(network) {
  const chainIds = {
    baseSepolia: 84532,
    base: 8453,
    hardhat: 1337,
    localhost: 1337
  };
  return chainIds[network] || 84532;
}

function saveFrontendConfig(config) {
  const frontendDir = path.join(__dirname, "../../frontend/src/config");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  // Generate TypeScript config file
  const configContent = `// Auto-generated contract configuration
// Generated at: ${config.timestamp}
// Network: ${config.network}

export const CONTRACT_CONFIG = ${JSON.stringify(config, null, 2)} as const;

export const CONTRACT_ADDRESSES = ${JSON.stringify(config.contracts, null, 2)} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
`;
  
  fs.writeFileSync(
    path.join(frontendDir, "contracts.ts"),
    configContent
  );
  
  console.log(`💾 Config saved to frontend/src/config/contracts.ts`);
}

generateFrontendConfig();