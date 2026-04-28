import React, { useRef, useEffect } from 'react';
import 'mathlive';

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

  useEffect(() => {
    if (mfRef.current) {
      if (mfRef.current.value !== value) {
        mfRef.current.value = value;
      }
      
      // Configure mathfield
      mfRef.current.mathVirtualKeyboardPolicy = "auto"; 
      mfRef.current.disabled = disabled;
      
      // Explicitly set options for virtual keyboard
      mfRef.current.setOptions({
        virtualKeyboardMode: 'onfocus', // Shows the keyboard when focused
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

  const MathField = 'math-field' as any;

  return (
    <div className={`math-field-container ${className}`}>
      <MathField
        ref={mfRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown as any}
        style={{
          width: '100%',
          padding: '12px 16px',
          paddingRight: paddingRight,
          fontSize: '1.25rem',
          outline: 'none',
          border: 'none',
          background: 'transparent',
          '--caret-color': '#4f46e5',
          '--selection-background-color': '#e0e7ff',
        }}
      >
        {value}
      </MathField>
      {!value && placeholder && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
          {placeholder}
        </div>
      )}
    </div>
  );
};
