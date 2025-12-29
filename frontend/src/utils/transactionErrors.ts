/**
 * Utility functions for parsing and formatting transaction errors
 */

export interface ParsedTransactionError {
  title: string;
  message: string;
  actionable?: string;
  code?: string;
}

/**
 * Parse a transaction error into a user-friendly format
 */
export function parseTransactionError(error: any): ParsedTransactionError {
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'An unknown error occurred',
    };
  }

  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || error.error?.code;

  // User rejection
  if (errorCode === 4001 || errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
    return {
      title: 'Transaction Rejected',
      message: 'You rejected the transaction request',
      code: 'USER_REJECTED',
    };
  }

  // Insufficient funds
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance') ||
    errorMessage.includes('exceeds balance')
  ) {
    return {
      title: 'Insufficient Balance',
      message: 'You do not have enough funds to complete this transaction',
      actionable: 'Please add funds to your wallet or reduce the transaction amount',
      code: 'INSUFFICIENT_FUNDS',
    };
  }

  // Gas estimation errors
  if (
    errorMessage.includes('gas') ||
    errorMessage.includes('gas required exceeds allowance') ||
    errorCode === -32000
  ) {
    return {
      title: 'Gas Estimation Failed',
      message: 'Unable to estimate gas for this transaction',
      actionable: 'The transaction may fail. Please check the transaction details or try again later',
      code: 'GAS_ESTIMATION_FAILED',
    };
  }

  // Nonce errors
  if (errorMessage.includes('nonce') || errorMessage.includes('replacement transaction')) {
    return {
      title: 'Transaction Nonce Error',
      message: 'There is a pending transaction that needs to be confirmed first',
      actionable: 'Please wait for your previous transaction to be confirmed',
      code: 'NONCE_ERROR',
    };
  }

  // Revert errors
  if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
    const revertReason = extractRevertReason(errorMessage);
    return {
      title: 'Transaction Would Fail',
      message: revertReason || 'This transaction would revert on the blockchain',
      actionable: 'Please check the transaction parameters and try again',
      code: 'REVERT',
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return {
      title: 'Network Error',
      message: 'Unable to connect to the network',
      actionable: 'Please check your internet connection and try again',
      code: 'NETWORK_ERROR',
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout')) {
    return {
      title: 'Transaction Timeout',
      message: 'The transaction took too long to process',
      actionable: 'Please try again. The transaction may still be pending',
      code: 'TIMEOUT',
    };
  }

  // Generic error
  return {
    title: 'Transaction Error',
    message: errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage,
    actionable: 'Please try again or contact support if the problem persists',
    code: errorCode?.toString(),
  };
}

/**
 * Extract revert reason from error message
 */
function extractRevertReason(errorMessage: string): string {
  // Try to extract revert reason from various formats
  const patterns = [
    /execution reverted: (.+)/i,
    /revert (.+)/i,
    /reverted with reason string '(.+)'/i,
    /VM execution error\.(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '';
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: any): boolean {
  const parsed = parseTransactionError(error);
  return ![
    'USER_REJECTED',
    'INSUFFICIENT_FUNDS',
  ].includes(parsed.code || '');
}

