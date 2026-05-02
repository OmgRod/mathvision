import React, { useRef, useEffect, useState } from 'react';
import 'mathlive';
import { Keyboard, Type, Sigma } from 'lucide-react';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  paddingRight?: string;
}

export const MathInput: React.FC<MathInputProps> = ({ 
  value, 
  onChange, 
  onEnter, 
  placeholder, 
  className = "",
  disabled = false,
  autoFocus = false,
  paddingRight = "0px"
}) => {
  const mfRef = useRef<any>(null);
  const [isMathMode, setIsMathMode] = useState(true);

  useEffect(() => {
    if (mfRef.current) {
      if (mfRef.current.value !== value) {
        mfRef.current.value = value;
      }
      
      // Configure mathfield
      mfRef.current.mathVirtualKeyboardPolicy = "manual"; 
      mfRef.current.disabled = disabled;
      
      // Explicitly set options
      mfRef.current.setOptions({
        virtualKeyboardMode: 'manual',
        virtualKeyboardToggle: 'none',
        menuToggle: 'none',
        smartMode: false, // We control the mode manually
        multiline: true, // Allow multiple lines
      });

      const handleFocus = () => {
        (window as any).activeMathField = mfRef.current;
      };
      
      const currentMf = mfRef.current;
      currentMf.addEventListener('focus', handleFocus);
      
      if (autoFocus) {
        setTimeout(() => currentMf.focus(), 150);
      }

      return () => {
        currentMf.removeEventListener('focus', handleFocus);
      };
    }
  }, [disabled, autoFocus]);

  // Update mode when toggled
  useEffect(() => {
    if (mfRef.current) {
      // Use executeCommand to change mode if possible, or just set it
      // In MathLive, 'math' mode is the default. 'text' mode is for text.
      // We can use setOptions or executeCommand
      if (isMathMode) {
        mfRef.current.executeCommand(['switch-mode', 'math']);
      } else {
        mfRef.current.executeCommand(['switch-mode', 'text']);
      }
    }
  }, [isMathMode]);

  // Update value when prop changes
  useEffect(() => {
    if (mfRef.current && mfRef.current.value !== value) {
      mfRef.current.value = value;
    }
  }, [value]);

  const handleInput = (e: any) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Keep the MathField mode synced when text mode is active.
    // MathLive can reset back to math mode when the last text character is deleted.
    if (mfRef.current && !isMathMode) {
      mfRef.current.executeCommand(['switch-mode', 'text']);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow Shift+Enter to create a new line (default behavior)
        return;
      }
      
      if (onEnter) {
        e.preventDefault();
        onEnter();
      }
    }
  };

  const toggleMathMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMathMode(!isMathMode);
    if (mfRef.current) {
      mfRef.current.focus();
    }
  };

  const MathField = 'math-field' as any;

  return (
    <div className={`math-field-container relative flex items-center transition-colors ${className}`}>
      <MathField
        ref={mfRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown as any}
        style={{
          width: '100%',
          padding: '12px 16px',
          paddingRight: `calc(${paddingRight} + 40px)`,
          fontSize: '1.15rem',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          '--caret-color': '#4f46e5',
          '--selection-background-color': '#e0e7ff',
          '--text-font-family': 'inherit',
          '--contains-highlight-background-color': 'rgba(79, 70, 229, 0.1)',
        }}
        className="dark:text-white"
      >
        {value}
      </MathField>
      
      <button
        onClick={toggleMathMode}
        type="button"
        title={isMathMode ? "Switch to Text Mode" : "Switch to Math Mode"}
        className={`absolute right-4 p-2 rounded-xl transition-all shadow-sm ${
          isMathMode 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400' 
            : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
        }`}
        style={{ right: `calc(${paddingRight} + 12px)` }}
      >
        {isMathMode ? <Sigma size={18} /> : <Type size={18} />}
      </button>

      {!value && placeholder && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg">
          {placeholder}
        </div>
      )}
    </div>
  );
};
