
import React, { useState } from 'react';
import { MathResult } from '../types';
import { Copy, Check, Info, BookOpen, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'motion/react';

interface MathSolutionProps {
  result: MathResult;
}

export const MathSolution: React.FC<MathSolutionProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'easy' | 'essay'>('easy');
  const [currentStep, setCurrentStep] = useState(0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.finalAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < result.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setMode('easy')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'easy' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={16} />
            Easy Mode
          </button>
          <button
            onClick={() => setMode('essay')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === 'essay' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={16} />
            Essay Mode
          </button>
        </div>
      </div>

      {mode === 'easy' ? (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="relative h-[320px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full h-full bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500/10">
                  <motion.div 
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / result.steps.length) * 100}%` }}
                  />
                </div>
                
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">
                  Step {currentStep + 1} of {result.steps.length}
                </span>
                
                <h4 className="text-xl font-bold text-slate-800 mb-6 px-4">
                  {result.steps[currentStep]?.title}
                </h4>
                
                <div className="math-container text-3xl font-medium text-slate-900 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`$$ ${result.steps[currentStep]?.math} $$`}
                  </ReactMarkdown>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="p-3 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <div className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2">
              <button
                onClick={nextStep}
                disabled={currentStep === result.steps.length - 1}
                className="p-3 bg-white rounded-full shadow-lg border border-slate-100 text-slate-400 hover:text-indigo-600 disabled:opacity-0 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2">
            {result.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {currentStep === result.steps.length - 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center"
            >
              <p className="text-emerald-700 font-bold mb-2">Final Result Reached!</p>
              <div className="text-2xl font-bold text-slate-900">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`$$ ${result.finalAnswer} $$`}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Step-by-Step Explanation</h3>
            </div>
            
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({ children }) => <p className="mb-4 text-slate-700 leading-relaxed">{children}</p>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-900">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-6 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-6 space-y-2">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-600">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                }}
              >
                {result.explanation}
              </ReactMarkdown>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Final Answer</span>
              <div className="math-container text-3xl font-bold text-indigo-600 mb-6">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`$$ ${result.finalAnswer} $$`}
                </ReactMarkdown>
              </div>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all transform active:scale-95 ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied LaTeX!' : 'Copy Result'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
