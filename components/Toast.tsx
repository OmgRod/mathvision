import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  X, 
  Star, 
  Footprints, 
  Zap, 
  Flame, 
  Crown, 
  Timer, 
  GraduationCap, 
  Sword, 
  Target, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Footprints': <Footprints size={28} />,
  'Zap': <Zap size={28} />,
  'Flame': <Flame size={28} />,
  'Crown': <Crown size={28} />,
  'Timer': <Timer size={28} />,
  'GraduationCap': <GraduationCap size={28} />,
  'Sword': <Sword size={28} />,
  'Target': <Target size={28} />,
  'Sparkles': <Sparkles size={28} />,
  'BookOpen': <BookOpen size={28} />
};

interface ToastProps {
  achievement: {
    title: string;
    description: string;
    xpReward: number;
    icon: string;
  };
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ achievement, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4"
    >
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-5 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Star size={80} />
        </div>
        
        <div className="w-14 h-14 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          {ICON_MAP[achievement.icon] || <Trophy size={28} className="text-white" />}
        </div>
        
        <div className="flex-grow space-y-1 relative z-10">
          <div className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">Achievement Unlocked!</div>
          <h4 className="font-black text-lg leading-tight">{achievement.title}</h4>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{achievement.description}</p>
          <div className="inline-block mt-2 px-3 py-1 bg-white/10 dark:bg-indigo-900/40 rounded-full text-[10px] font-black text-emerald-400">
            +{achievement.xpReward} XP
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors self-start"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};
