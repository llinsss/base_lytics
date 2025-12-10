import React from 'react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

export function VoiceControl() {
  const { isListening, transcript, startListening, stopListening } = useVoiceCommands();

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {transcript && (
          <div className="bg-white dark:bg-gray-800 border rounded-lg p-3 shadow-lg max-w-xs">
            <div className="text-sm text-gray-600 dark:text-gray-400">Voice Command:</div>
            <div className="font-medium dark:text-white">"{transcript}"</div>
          </div>
        )}
        
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-base-600 text-white hover:bg-base-700'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice commands'}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
      </div>
    </div>
  );
}