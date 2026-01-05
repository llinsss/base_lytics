import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'trade' | 'system';
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  messages: ChatMessage[];
}

export function useChatSystem() {
  const { address } = useAccount();
  const [activeRoom, setActiveRoom] = useState('general');
  const [message, setMessage] = useState('');
  
  const [rooms] = useState<ChatRoom[]>([
    {
      id: 'general',
      name: 'General',
      description: 'General trading discussion',
      memberCount: 1247,
      messages: [
        {
          id: '1',
          user: '0x1234...5678',
          message: 'ETH looking bullish today! 🚀',
          timestamp: new Date(Date.now() - 300000),
          type: 'message'
        },
        {
          id: '2',
          user: '0x9876...4321',
          message: 'Just bought 2 ETH at $2100',
          timestamp: new Date(Date.now() - 240000),
          type: 'trade'
        },
        {
          id: '3',
          user: 'System',
          message: 'New user CryptoWhale joined the room',
          timestamp: new Date(Date.now() - 180000),
          type: 'system'
        }
      ]
    },
    {
      id: 'trading',
      name: 'Trading Signals',
      description: 'Share trading signals and analysis',
      memberCount: 892,
      messages: []
    },
    {
      id: 'defi',
      name: 'DeFi Discussion',
      description: 'DeFi protocols and yield farming',
      memberCount: 634,
      messages: []
    }
  ]);

  const sendMessage = () => {
    if (!message.trim() || !address) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: address,
      message: message.trim(),
      timestamp: new Date(),
      type: 'message'
    };

    // In a real app, this would send to a backend
    console.log('Sending message:', newMessage);
    setMessage('');
  };

  const getCurrentRoom = () => {
    return rooms.find(room => room.id === activeRoom) || rooms[0];
  };

  return {
    rooms,
    activeRoom,
    setActiveRoom,
    message,
    setMessage,
    sendMessage,
    getCurrentRoom
  };
}