export interface Transaction {
  hash: string;
  type: 'token_transfer' | 'nft_mint' | 'stake' | 'unstake' | 'claim' | 'approve';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
  from: string;
  to?: string;
  value?: string;
  gasUsed?: string;
  gasPrice?: string;
  contract: string;
  description: string;
}

export interface ActivityFilter {
  type?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}