import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useAgentChat() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hey! I'm BaseLytics AI 👋 I can analyze your wallet, check balances across Base and Celo, review your transaction history, and give you portfolio insights.\n\nYour connected wallet is ${address ? `\`${address.slice(0, 6)}...${address.slice(-4)}\`` : 'not detected — connect your wallet first'}.\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Inject wallet address into message if user hasn't provided one
      const enriched =
        address && !text.toLowerCase().includes('0x')
          ? `${text} (my wallet address is ${address})`
          : text;

      const history = messages
        .filter((m) => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: enriched, history }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Could not reach the agent. Make sure the backend is running.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, address]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared. How can I help you?`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  return { messages, input, setInput, sendMessage, loading, clearChat };
}
