import React from 'react';
import { useChatSystem } from '../hooks/useChatSystem';
import { useAccount } from 'wagmi';

export function ChatSystem() {
  const { rooms, activeRoom, setActiveRoom, message, setMessage, sendMessage, getCurrentRoom } = useChatSystem();
  const { address, isConnected } = useAccount();
  const currentRoom = getCurrentRoom();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const formatAddress = (addr: string) => {
    if (addr === 'System') return 'System';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'trade': return '💱';
      case 'system': return '🔔';
      default: return '💬';
    }
  };

  if (!isConnected) {
    return (
      <div className="card text-center">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">💬 Community Chat</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your wallet to join the conversation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">💬 Community Chat</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
        {/* Room List */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Rooms</h3>
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeRoom === room.id
                    ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium dark:text-white">{room.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {room.memberCount} members
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 card flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{currentRoom.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentRoom.description}</p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentRoom.memberCount} online
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {currentRoom.messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              currentRoom.messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="text-lg">{getMessageIcon(msg.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${
                        msg.user === address ? 'text-base-600' :
                        msg.user === 'System' ? 'text-gray-600' : 'dark:text-white'
                      }`}>
                        {formatAddress(msg.user)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={`text-sm ${
                      msg.type === 'system' ? 'text-gray-600 italic' : 'dark:text-gray-300'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}