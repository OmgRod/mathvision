import React, { useRef, useEffect } from 'react';
import 'mathlive';

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        onInput?: (e: any) => void;
      }, HTMLElement>;
    }
  }
}

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const MathInput: React.FC<MathInputProps> = ({ 
  value, 
  onChange, 
  onEnter, 
  placeholder, 
  className = "",
  disabled = false,
  autoFocus = false
}) => {
  const mfRef = useRef<any>(null);

  useEffect(() => {
    if (mfRef.current) {
      // Set the value initially
      // Optimization: only set if different to avoid cursor reset
      if (mfRef.current.value !== value) {
        mfRef.current.value = value;
      }
      
      // Configure mathfield
      mfRef.current.mathVirtualKeyboardPolicy = "manual"; 
      mfRef.current.disabled = disabled;
      
      const handleFocus = () => {
        (window as any).activeMathField = mfRef.current;
      };
      
      const currentMf = mfRef.current;
      currentMf.addEventListener('focus', handleFocus);
      
      if (autoFocus) {
        setTimeout(() => currentMf.focus(), 100);
      }

      return () => {
        currentMf.removeEventListener('focus', handleFocus);
      };
    }
  }, [disabled, autoFocus]);

  // Update value when prop changes (for external updates like the custom keyboard)
  useEffect(() => {
    if (mfRef.current && mfRef.current.value !== value) {
      mfRef.current.value = value;
    }
  }, [value]);

  const handleInput = (e: any) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className={`math-field-container ${className}`}>
      <math-field
        ref={mfRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown as any}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '1.25rem',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          '--caret-color': '#4f46e5',
          '--selection-background-color': '#e0e7ff',
        }}
      >
        {value}
      </math-field>
      {!value && placeholder && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
          {placeholder}
        </div>
      )}
    </div>
  );
};
