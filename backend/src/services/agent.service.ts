import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
  type Tool,
  type ToolResultBlock,
} from '@aws-sdk/client-bedrock-runtime';
import { ethers } from 'ethers';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

const celoProvider = new ethers.JsonRpcProvider('https://forno.celo.org');
const baseProvider = new ethers.JsonRpcProvider(
  process.env.BASE_RPC_URL || 'https://mainnet.base.org'
);

// ─── Tool definitions ────────────────────────────────────────────────────────

const tools: Tool[] = [
  {
    toolSpec: {
      name: 'get_wallet_balances',
      description: 'Get native token balances (ETH/CELO) for a wallet address on Base and Celo networks.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address (0x...)' },
          },
          required: ['address'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_token_price',
      description: 'Get current USD price for a token by its CoinGecko ID.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            token_id: {
              type: 'string',
              description: 'CoinGecko token ID e.g. "ethereum", "celo", "bitcoin"',
            },
          },
          required: ['token_id'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_gas_price',
      description: 'Get current gas prices on Base and Celo networks in Gwei.',
      inputSchema: {
        json: { type: 'object', properties: {} },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_transaction_history',
      description: 'Get recent transactions for a wallet address on Base mainnet via Basescan API.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address (0x...)' },
            limit: { type: 'number', description: 'Number of transactions to fetch (max 10)' },
          },
          required: ['address'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_portfolio_summary',
      description: 'Get a combined portfolio summary including balances and estimated USD values for a wallet.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Wallet address (0x...)' },
          },
          required: ['address'],
        },
      },
    },
  },
];

// ─── Tool implementations ────────────────────────────────────────────────────

async function getWalletBalances(address: string) {
  const [baseBalance, celoBalance] = await Promise.all([
    baseProvider.getBalance(address).catch(() => 0n),
    celoProvider.getBalance(address).catch(() => 0n),
  ]);
  return {
    base: { native: ethers.formatEther(baseBalance), symbol: 'ETH' },
    celo: { native: ethers.formatEther(celoBalance), symbol: 'CELO' },
  };
}

async function getTokenPrice(tokenId: string) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
  );
  const data = await res.json() as Record<string, any>;
  return data[tokenId] ?? { error: 'Token not found' };
}

async function getGasPrice() {
  const [baseFee, celoFee] = await Promise.all([
    baseProvider.getFeeData().catch(() => null),
    celoProvider.getFeeData().catch(() => null),
  ]);
  return {
    base: baseFee?.gasPrice ? `${ethers.formatUnits(baseFee.gasPrice, 'gwei')} Gwei` : 'unavailable',
    celo: celoFee?.gasPrice ? `${ethers.formatUnits(celoFee.gasPrice, 'gwei')} Gwei` : 'unavailable',
  };
}

async function getTransactionHistory(address: string, limit = 5) {
  const apiKey = process.env.BASESCAN_API_KEY || '';
  const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${Math.min(limit, 10)}&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json() as { status: string; result: any[] };
  if (data.status !== '1') return { transactions: [] };
  return {
    transactions: data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: `${ethers.formatEther(tx.value)} ETH`,
      timestamp: new Date(Number(tx.timeStamp) * 1000).toISOString(),
      status: tx.isError === '0' ? 'success' : 'failed',
    })),
  };
}

async function getPortfolioSummary(address: string) {
  const [balances, ethPrice, celoPrice] = await Promise.all([
    getWalletBalances(address),
    getTokenPrice('ethereum'),
    getTokenPrice('celo'),
  ]);
  const ethUsd = ethPrice?.usd ?? 0;
  const celoUsd = celoPrice?.usd ?? 0;
  const baseValueUsd = parseFloat(balances.base.native) * ethUsd;
  const celoValueUsd = parseFloat(balances.celo.native) * celoUsd;
  return {
    balances,
    prices: { ETH: ethPrice, CELO: celoPrice },
    estimatedTotalUsd: (baseValueUsd + celoValueUsd).toFixed(2),
    breakdown: {
      base: `$${baseValueUsd.toFixed(2)}`,
      celo: `$${celoValueUsd.toFixed(2)}`,
    },
  };
}

// ─── Tool dispatcher ─────────────────────────────────────────────────────────

async function dispatchTool(name: string, input: any): Promise<string> {
  try {
    let result: any;
    switch (name) {
      case 'get_wallet_balances':
        result = await getWalletBalances(input.address);
        break;
      case 'get_token_price':
        result = await getTokenPrice(input.token_id);
        break;
      case 'get_gas_price':
        result = await getGasPrice();
        break;
      case 'get_transaction_history':
        result = await getTransactionHistory(input.address, input.limit);
        break;
      case 'get_portfolio_summary':
        result = await getPortfolioSummary(input.address);
        break;
      default:
        result = { error: `Unknown tool: ${name}` };
    }
    return JSON.stringify(result);
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

// ─── Main agent function ─────────────────────────────────────────────────────

export async function runAgent(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const messages: Message[] = [
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: [{ text: m.content }],
    })),
    { role: 'user', content: [{ text: userMessage }] },
  ];

  const system = [
    {
      text: `You are BaseLytics AI, a DeFi wallet analyst for the BaseLytics platform.
You help users understand their on-chain portfolio across Base and Celo networks.
When a user asks about their wallet, balances, transactions, gas, or portfolio — use the available tools to fetch real data before answering.
Always be concise, specific, and actionable. Format numbers clearly. If you don't have a wallet address, ask the user for it.`,
    },
  ];

  // Agentic loop — keep going until the model stops calling tools
  while (true) {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system,
        messages,
        toolConfig: { tools },
      })
    );

    const output = response.output?.message;
    if (!output) break;

    messages.push(output);

    if (response.stopReason === 'end_turn') {
      const textBlock = output.content?.find((b) => 'text' in b);
      return textBlock && 'text' in textBlock ? textBlock.text ?? '' : '';
    }

    if (response.stopReason === 'tool_use') {
      const toolResults: ToolResultBlock[] = [];

      for (const block of output.content ?? []) {
        if ('toolUse' in block && block.toolUse) {
          const { toolUseId, name, input } = block.toolUse;
          const resultText = await dispatchTool(name!, input as any);
          toolResults.push({
            toolUseId: toolUseId!,
            content: [{ text: resultText }],
          });
        }
      }

      messages.push({
        role: 'user',
        content: toolResults.map((r) => ({ toolResult: r })),
      });
    } else {
      break;
    }
  }

  return 'Sorry, I was unable to process your request.';
}
