import { CONTRACT_ADDRESSES } from '../config/contracts';

export async function loadDeploymentAddresses() {
  try {
    // Try to load from deployments directory
    const response = await fetch('/deployments/addresses.json');
    if (response.ok) {
      const deployments = await response.json();
      
      // Update contract addresses with deployed addresses
      Object.keys(deployments).forEach(chainId => {
        const chain = parseInt(chainId);
        if (CONTRACT_ADDRESSES[chain]) {
          Object.assign(CONTRACT_ADDRESSES[chain], deployments[chainId]);
        }
      });
      
      console.log('Loaded deployment addresses:', deployments);
      return deployments;
    }
  } catch (error) {
    console.warn('Could not load deployment addresses, using defaults');
  }
  
  return CONTRACT_ADDRESSES;
}