
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, ChevronRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
  xpEarned: number;
  message: string;
  onHome: () => void;
  onNext?: () => void;
  onChallenge?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ 
  xpEarned, 
  message, 
  onHome, 
  onNext,
  onChallenge,
}) => {
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4f46e5', '#818cf8', '#ffffff']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4f46e5', '#818cf8', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" />
      
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-lg p-12 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-none transition-colors"
      >
        <motion.div 
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 bg-indigo-600 dark:bg-indigo-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 dark:shadow-none"
        >
          <Trophy size={48} />
        </motion.div>

        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">LEGENDARY!</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">{message}</p>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] mb-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star size={64} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">Rewards Earned</div>
          <div className="text-5xl font-black text-slate-900 dark:text-white">+{xpEarned} XP</div>
        </div>

        <div className={`grid gap-4 ${onChallenge ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button 
            onClick={onHome}
            className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
          >
            <Home size={20} />
            HOME
          </button>
          <button 
            onClick={onNext}
            className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-black hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-indigo-200 dark:shadow-none"
          >
            CONTINUE
            <ChevronRight size={20} />
          </button>
          {onChallenge && (
            <button
              onClick={onChallenge}
              className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white font-black hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-emerald-200 dark:shadow-none"
            >
              CHALLENGE
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
