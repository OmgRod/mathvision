
import React, { useState } from 'react';
import { MathResult } from '../types';
import { TTSButton } from './TTSButton';
import { Copy, Check, Info, BookOpen, Sparkles, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'motion/react';

interface MathSolutionProps {
  result: MathResult;
}

export const MathSolution: React.FC<MathSolutionProps> = ({ result }) => {
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [mode, setMode] = useState<'easy' | 'essay'>('easy');
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const activePart = result.parts[activePartIndex];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => {
    if (activePart && currentStep < activePart.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const Diagram = ({ svg }: { svg?: string }) => {
    if (!svg) return null;
    return (
      <div 
        className="my-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-center overflow-auto max-h-[300px] shadow-sm"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  };

  if (!result.parts || result.parts.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Overall Header if multi-part */}
      {result.parts.length > 1 && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {result.parts.map((p, idx) => (
              <button
                key={p.partId}
                onClick={() => {
                  setActivePartIndex(idx);
                  setCurrentStep(0);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activePartIndex === idx 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                }`}
              >
                Part {p.partId}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1 transition-colors">
          <button
            onClick={() => setMode('easy')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              mode === 'easy' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} className="md:w-4 md:h-4" />
            Easy Mode
          </button>
          <button
            onClick={() => setMode('essay')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              mode === 'essay' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} className="md:w-4 md:h-4" />
            Essay Mode
          </button>
        </div>
      </div>

      {activePart && (
        mode === 'easy' ? (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="relative min-h-[300px] md:min-h-[320px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePartIndex}-${currentStep}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="w-full h-full bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500/10 dark:bg-indigo-400/10">
                    <motion.div 
                      className="h-full bg-indigo-50 dark:bg-indigo-900/30"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep + 1) / activePart.steps.length) * 100}%` }}
                    />
                  </div>
                  
                  <span className="text-[10px] md:text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-4">
                    {result.parts.length > 1 ? `Part ${activePart.partId} • ` : ''}Step {currentStep + 1} of {activePart.steps.length}
                  </span>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-4">
                    <h4 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white px-4 prose prose-indigo dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ children }) => <>{children}</>,
                        }}
                      >
                        {activePart.steps[currentStep]?.title || ''}
                      </ReactMarkdown>
                    </h4>
                    <TTSButton text={activePart.steps[currentStep]?.title || ''} size={14} />
                  </div>
                  
                  <div className="math-container text-xl md:text-2xl font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 px-4 md:px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4 w-full overflow-x-auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {`$$ ${activePart.steps[currentStep]?.math} $$`}
                    </ReactMarkdown>
                  </div>

                  <Diagram svg={activePart.steps[currentStep]?.diagramSvg} />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons - Adjusted for mobile */}
              <div className="absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="p-2 md:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={20} className="md:w-6 md:h-6" />
                </button>
              </div>
              <div className="absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={nextStep}
                  disabled={currentStep === activePart.steps.length - 1}
                  className="p-2 md:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-0 transition-all"
                >
                  <ChevronRight size={20} className="md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2">
              {activePart.steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep ? 'w-6 bg-indigo-500 dark:bg-indigo-400' : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {currentStep === activePart.steps.length - 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-3xl text-center transition-colors"
              >
                <p className="text-emerald-700 dark:text-emerald-400 font-bold mb-2">Part {activePart.partId} Result Reached!</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`$$ ${activePart.finalAnswer} $$`}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-10 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Explanation for Part {activePart.partId}</h3>
                </div>
                <TTSButton text={activePart.explanation} />
              </div>
              
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-slate-900 dark:text-white">{children}</h3>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-6 space-y-2 dark:text-slate-400">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-6 space-y-2 dark:text-slate-400">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-600 dark:text-slate-400">{children}</li>,
                    strong: ({ children }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
                  }}
                >
                  {activePart.explanation}
                </ReactMarkdown>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Final Answer</span>
                <div className="math-container text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`$$ ${activePart.finalAnswer} $$`}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => copyToClipboard(activePart.finalAnswer)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all transform active:scale-95 ${
                    copied 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                      : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-lg shadow-slate-200 dark:shadow-none'
                  }`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied LaTeX!' : 'Copy Part Result'}
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
