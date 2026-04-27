
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface TTSButtonProps {
  text: string;
  className?: string;
  size?: number;
}

export const TTSButton: React.FC<TTSButtonProps> = ({ text, className = '', size = 16 }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Clean text from Markdown artifacts for better speech
      const cleanText = text
        .replace(/\$\$(.*?)\$\$/g, '$1') // Remove LaTeX delimiters but keep content
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
        .replace(/[#*`_]/g, ''); // Remove basic markdown symbols

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleSpeech}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isSpeaking 
          ? 'bg-indigo-100 text-indigo-600' 
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
      } ${className}`}
      title={isSpeaking ? "Stop speaking" : "Listen to this text"}
      aria-label={isSpeaking ? "Stop speaking" : "Listen to this text"}
    >
      {isSpeaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
};
