import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, MessageCircle, HelpCircle, LifeBuoy, Brain, GraduationCap } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl dark:shadow-none relative z-10 overflow-hidden max-h-[90vh] flex flex-col transition-colors"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 dark:bg-indigo-500 rounded-2xl text-white">
              <LifeBuoy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Support & Learning</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">How to master math with MathVision AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={24} className="text-slate-400 dark:text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-12">
          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Core Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl space-y-3">
                <Brain className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h4 className="font-black text-slate-900 dark:text-white">Adaptive Practice</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">Our AI generates dynamic quizzes that adjust to your skill level. The more you solve, the smarter it gets.</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl space-y-3">
                <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={24} />
                <h4 className="font-black text-slate-900 dark:text-white">Learning Paths</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">Deep dive into curated topics. Unlock checkpoints and masteries as you progress through academic modules.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Common Questions</h3>
            <div className="space-y-4">
              <details className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4">
                <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  How does the AI solve equations?
                  <span className="group-open:rotate-180 transition-transform dark:text-slate-500">▼</span>
                </summary>
                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  We use the latest Antigravity models to analyze the mathematical logic step-by-step. It doesn't just give the answer; it explains the proof.
                </p>
              </details>
              <details className="group bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4">
                <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  Are my solutions saved?
                  <span className="group-open:rotate-180 transition-transform dark:text-slate-500">▼</span>
                </summary>
                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                  Yes, every solution, practice session, and learning module is saved in your local History tab. You can export this data anytime.
                </p>
              </details>
            </div>
          </section>

          <section className="p-8 bg-indigo-900 dark:bg-indigo-950 rounded-[2.5rem] text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="space-y-4 flex-grow">
                <h3 className="text-2xl font-black">Keep Mastering Math</h3>
                <p className="text-indigo-200 dark:text-indigo-300 text-sm font-medium">Continue your journey through our learning modules and practice sessions to unlock more achievements and sharpen your skills.</p>
                <button 
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-indigo-500 text-indigo-900 dark:text-white rounded-xl font-black text-sm uppercase tracking-widest"
                >
                  <Brain size={18} />
                  Start Practicing
                </button>
              </div>
              <div className="shrink-0 opacity-20 transition-colors">
                <HelpCircle size={120} />
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
