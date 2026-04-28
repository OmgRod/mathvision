
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
      // Clean text from LaTeX and Markdown for better speech
      const cleanLaTeX = (str: string) => {
        return str
          .replace(/\\text\{(.*?)\}/g, '$1')
          .replace(/\\mathrm\{(.*?)\}/g, '$1')
          .replace(/\\mathbf\{(.*?)\}/g, '$1')
          .replace(/\\mathit\{(.*?)\}/g, '$1')
          .replace(/\\mathtt\{(.*?)\}/g, '$1')
          .replace(/\\mathsf\{(.*?)\}/g, '$1')
          .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, '$1 divided by $2')
          .replace(/\\sqrt\{(.*?)\}/g, 'square root of $1')
          .replace(/\\sqrt\[(.*?)\]\{(.*?)\}/g, '$1 root of $2')
          .replace(/\^\{(.*?)\}/g, ' to the power of $1')
          .replace(/\^\\circ/g, ' degrees ')
          .replace(/\^circ/g, ' degrees ')
          .replace(/\^/g, ' to the power of ')
          .replace(/_\{(.*?)\}/g, ' sub $1')
          .replace(/_(.)/g, ' sub $1')
          .replace(/\\sin/g, ' sine ')
          .replace(/\\cos/g, ' cosine ')
          .replace(/\\tan/g, ' tangent ')
          .replace(/\\times/g, ' times ')
          .replace(/\\cdot/g, ' dot ')
          .replace(/\\div/g, ' divided by ')
          .replace(/\\pm/g, ' plus or minus ')
          .replace(/\\approx/g, ' approximately ')
          .replace(/\\neq/g, ' is not equal to ')
          .replace(/\\leq/g, ' is less than or equal to ')
          .replace(/\\geq/g, ' is greater than or equal to ')
          .replace(/\\infty/g, ' infinity ')
          .replace(/\\pi/g, ' pi ')
          .replace(/\\alpha/g, ' alpha ')
          .replace(/\\beta/g, ' beta ')
          .replace(/\\theta/g, ' theta ')
          .replace(/\\lambda/g, ' lambda ')
          .replace(/\\Delta/g, ' delta ')
          .replace(/\\sum/g, ' sum ')
          .replace(/\\int/g, ' integral ')
          .replace(/\\vec\{(.*?)\}/g, 'vector $1')
          .replace(/\\(?:left|right)/g, '')
          .replace(/\\,/g, ' ')
          .replace(/\\;/g, ' ')
          .replace(/\\!/g, '')
          .replace(/\\ /g, ' ')
          .replace(/\\/g, '')
          .replace(/\{/g, '')
          .replace(/\}/g, '')
          .replace(/\$/g, '');
      };

      const cleanText = text
        .replace(/\$\$(.*?)\$\$/g, (_, match) => cleanLaTeX(match))
        .replace(/\$(.*?)\$/g, (_, match) => cleanLaTeX(match))
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/[#*`_]/g, '');

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
          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
      } ${className}`}
      title={isSpeaking ? "Stop speaking" : "Listen to this text"}
      aria-label={isSpeaking ? "Stop speaking" : "Listen to this text"}
    >
      {isSpeaking ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
};
