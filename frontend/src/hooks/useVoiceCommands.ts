import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export function useVoiceCommands() {
  const { addNotification } = useNotifications();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setTranscript(command);
        processCommand(command);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processCommand = (command: string) => {
    if (command.includes('show balance')) {
      addNotification({ title: 'Voice: Showing balance', type: 'info' });
      // Navigate to balance view
    } else if (command.includes('swap tokens')) {
      addNotification({ title: 'Voice: Opening swap interface', type: 'info' });
      // Navigate to swap
    } else if (command.includes('stake tokens')) {
      addNotification({ title: 'Voice: Opening staking', type: 'info' });
      // Navigate to staking
    } else if (command.includes('check portfolio')) {
      addNotification({ title: 'Voice: Showing portfolio', type: 'info' });
      // Navigate to portfolio
    } else {
      addNotification({ title: `Voice command not recognized: "${command}"`, type: 'warning' });
    }
  };

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening };
}