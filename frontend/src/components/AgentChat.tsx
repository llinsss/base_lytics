import React, { useEffect, useRef } from 'react';
import { useAgentChat } from '../hooks/useAgentChat';

const SUGGESTIONS = [
  'What is my portfolio worth?',
  'Show my recent transactions',
  'What are gas prices right now?',
  'Analyze my wallet risk',
  'What is the price of CELO?',
];

export function AgentChat() {
  const { messages, input, setInput, sendMessage, loading, clearChat } = useAgentChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[700px] card">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-base-600 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <div>
            <h3 className="font-semibold dark:text-white">BaseLytics AI Agent</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Powered by AWS Bedrock
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded border dark:border-gray-600"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-base-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
              }`}
            >
              {msg.content}
              <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="text-xs px-3 py-1.5 rounded-full border border-base-300 text-base-600 dark:border-base-500 dark:text-base-400 hover:bg-base-50 dark:hover:bg-base-900 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your wallet, portfolio, gas prices..."
          className="flex-1 resize-none px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-base-500"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : '↑'}
        </button>
      </div>
    </div>
  );
}
