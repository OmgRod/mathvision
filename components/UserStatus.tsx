
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, TrendingUp, Star } from 'lucide-react';
import { getUserProfile, UserProfile } from '../userService';

export const UserStatus: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showXPPop, setShowXPPop] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setProfile(getUserProfile());
    };
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events if we trigger them locally
    window.addEventListener('xp_updated', handleStorageChange as any);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('xp_updated', handleStorageChange as any);
    };
  }, []);

  const progress = (profile.xp % (profile.level * 100)) / (profile.level);

  return (
    <div 
      onClick={() => window.dispatchEvent(new Event('navigate_profile'))}
      className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-95 active:shadow-inner"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
           <Star size={12} className="text-amber-400 fill-amber-400" />
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">LVL {profile.level}</span>
        </div>
        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
        <div className="relative">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Trophy size={14} />
          </div>
          <AnimatePresence>
            {showXPPop && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -15 }}
                exit={{ opacity: 0 }}
                className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full"
              >
                +XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900 leading-none">{profile.xp}</span>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-1">TOTAL XP</span>
        </div>
      </div>
    </div>
  );
};
