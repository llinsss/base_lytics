import { isAddress as viemIsAddress } from 'viem';

/**
 * Validates an Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return viemIsAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validates a numeric amount
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Formats an address for display (truncates to first 6 and last 4 characters)
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validates a chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

