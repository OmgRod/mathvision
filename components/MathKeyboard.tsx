
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Type as TypeIcon } from 'lucide-react';

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SYMBOLS = [
  { label: 'x', value: 'x', type: 'variable' },
  { label: 'y', value: 'y', type: 'variable' },
  { label: '+', value: '+', type: 'operator' },
  { label: '-', value: '-', type: 'operator' },
  { label: '×', value: '*', type: 'operator' },
  { label: '÷', value: '/', type: 'operator' },
  { label: '=', value: '=', type: 'operator' },
  { label: '^2', value: '^2', type: 'function' },
  { label: '^n', value: '^', type: 'function' },
  { label: '√', value: '\\sqrt{}', type: 'function' },
  { label: 'π', value: '\\pi', type: 'constant' },
  { label: '(', value: '(', type: 'bracket' },
  { label: ')', value: ')', type: 'bracket' },
  { label: 'sin', value: '\\sin()', type: 'function' },
  { label: 'cos', value: '\\cos()', type: 'function' },
  { label: 'tan', value: '\\tan()', type: 'function' },
  { label: 'log', value: '\\log()', type: 'function' },
  { label: 'ln', value: '\\ln()', type: 'function' },
  { label: 'θ', value: '\\theta', type: 'constant' },
  { label: 'Δ', value: '\\Delta', type: 'constant' },
];

export const MathKeyboard: React.FC<MathKeyboardProps> = ({ onInsert, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-none p-4 z-50 overflow-hidden mx-2 md:mx-0 transition-colors"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <TypeIcon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Math Symbols</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {SYMBOLS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const activeMf = (window as any).activeMathField;
                  if (activeMf) {
                    activeMf.insert(s.value);
                  } else {
                    onInsert(s.value);
                  }
                }}
                className={`
                  p-3 md:p-4 rounded-xl font-bold text-xs md:text-sm transition-all hover:scale-105 active:scale-95
                  ${s.type === 'variable' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''}
                  ${s.type === 'operator' ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400' : ''}
                  ${s.type === 'function' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : ''}
                  ${s.type === 'constant' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : ''}
                  ${s.type === 'bracket' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : ''}
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
