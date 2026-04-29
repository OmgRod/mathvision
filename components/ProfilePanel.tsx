
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Star, 
  Download, 
  Upload, 
  TrendingUp, 
  Award,
  Zap,
  Target,
  Clock,
  ChevronRight,
  Flame,
  MousePointer2,
  Timer,
  Footprints,
  Crown,
  GraduationCap,
  Sword,
  Sparkles,
  BookOpen,
  X,
  Lock
} from 'lucide-react';
import { getUserProfile, UserProfile, saveUserProfile } from '../userService';
import { ACHIEVEMENTS } from '../achievementService';

const ICON_MAP: Record<string, React.ReactNode> = {
  'Footprints': <Footprints size={18} />,
  'Zap': <Zap size={18} />,
  'Flame': <Flame size={18} />,
  'Crown': <Crown size={18} />,
  'Timer': <Timer size={18} />,
  'GraduationCap': <GraduationCap size={18} />,
  'Sword': <Sword size={18} />,
  'Target': <Target size={18} />,
  'Sparkles': <Sparkles size={18} />,
  'BookOpen': <BookOpen size={18} />
};

const AchievementsModal: React.FC<{ isOpen: boolean, onClose: () => void, profile: UserProfile }> = ({ isOpen, onClose, profile }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Achievements Hall</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your collection of mathematical milestones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {([...ACHIEVEMENTS].sort((a, b) => {
              const unlockedA = profile.achievements.some(item => item.id === a.id);
              const unlockedB = profile.achievements.some(item => item.id === b.id);
              if (unlockedA !== unlockedB) return unlockedA ? -1 : 1;

              if (unlockedA && unlockedB) {
                const aData = profile.achievements.find(item => item.id === a.id);
                const bData = profile.achievements.find(item => item.id === b.id);
                return new Date(bData?.unlockedAt || 0).getTime() - new Date(aData?.unlockedAt || 0).getTime();
              }

              const progressA = Math.min(100, (a.currentValue(profile) / a.target) * 100);
              const progressB = Math.min(100, (b.currentValue(profile) / b.target) * 100);
              return progressB - progressA;
            })).map(ach => {
              const unlocked = profile.achievements.some(a => a.id === ach.id);
              const unlockedData = profile.achievements.find(a => a.id === ach.id);
              const current = ach.currentValue(profile);
              const progress = Math.min(100, (current / ach.target) * 100);
              
              return (
                <div 
                  key={ach.id} 
                  className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                    unlocked 
                      ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-xl' 
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 shadow-inner'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl ${unlocked ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {unlocked ? (ICON_MAP[ach.icon] || <Award size={24} />) : <Lock size={24} />}
                    </div>
                    {unlocked ? (
                      <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        Unlocked
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {current} / {ach.target}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{ach.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">{ach.description}</p>
                  </div>

                  {!unlocked && (
                    <div className="mt-4 space-y-2">
                       <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                           style={{ width: `${progress}%` }}
                         />
                       </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      {ach.xpReward} XP Reward
                    </div>
                    {unlockedData && (
                      <div className="text-[9px] font-bold text-slate-300 dark:text-slate-500">
                        {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ProfilePanel: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [exportData, setExportData] = useState<string>('');

  useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    window.addEventListener('xp_updated', refresh);
    window.addEventListener('achievement_unlocked', refresh);
    return () => {
      window.removeEventListener('xp_updated', refresh);
      window.removeEventListener('achievement_unlocked', refresh);
    };
  }, []);

  const handleExport = () => {
    const allData: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allData[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathvision_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach(key => {
          if (data[key]) localStorage.setItem(key, data[key]);
        });
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const progress = (profile.xp % (profile.level * 100)) / (profile.level);
  const xpToNext = (profile.level * 100) - (profile.xp % (profile.level * 100));

  const featuredAchievements = ACHIEVEMENTS.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      <AnimatePresence>
        {showAchievementsModal && (
          <AchievementsModal 
            isOpen={showAchievementsModal} 
            onClose={() => setShowAchievementsModal(false)} 
            profile={profile} 
          />
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                <span className="text-2xl font-black">{profile.level}</span>
             </div>
              <div>
               <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">STUDENT PROFILE</h1>
               <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">Level {profile.level} Master Academic</p>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
            <Upload size={20} />
            IMPORT DATA
            <input type="file" className="hidden" onChange={handleImport} accept=".json" />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <Download size={20} />
            EXPORT ALL DATA
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl dark:shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 dark:text-white">
              <TrendingUp size={200} />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Experience</h3>
                  <div className="text-7xl font-black text-slate-900 dark:text-white leading-none">{profile.xp} <span className="text-indigo-600 dark:text-indigo-400 text-3xl">XP</span></div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Next Level In</span>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">{xpToNext} XP</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <span>Progress to Level {profile.level + 1}</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <StatCard 
               icon={<Flame className="text-orange-500" />} 
               label="Current Streak" 
               value={`${profile.streak} Days`} 
               color="bg-orange-50"
             />
             <StatCard 
               icon={<Timer className="text-emerald-500" />} 
               label="Total Study Time" 
               value={`${profile.totalTimeMinutes} Mins`} 
               color="bg-emerald-50"
             />
             <StatCard 
               icon={<Award className="text-amber-500" />} 
               label="Mastered Topics" 
               value={profile.masteredLessons?.length || 0} 
               color="bg-amber-50"
             />
             <StatCard 
               icon={<Zap className="text-indigo-500" />} 
               label="Practice sessions" 
               value={profile.completedTopics?.length || 0} 
               color="bg-indigo-50"
             />
             <StatCard 
               icon={<Target className="text-rose-500" />} 
               label="Problems Solved" 
               value={profile.totalQuestionsSolved || 0} 
               color="bg-rose-50"
             />
          </div>
        </div>

        {/* Sidebar / Settings */}
        <div className="space-y-8">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 transition-colors space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Achievements</h3>
                <button 
                  onClick={() => setShowAchievementsModal(true)}
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {featuredAchievements.map(ach => {
                  const unlocked = profile.achievements.some(a => a.id === ach.id);
                  const current = ach.currentValue(profile);
                  const progress = Math.min(100, (current / ach.target) * 100);
                  return (
                    <AchievementItem 
                      key={ach.id}
                      icon={ICON_MAP[ach.icon] || <Award size={18} />} 
                      title={ach.title} 
                      desc={ach.description}
                      unlocked={unlocked}
                      progress={progress}
                    />
                  );
                })}
              </div>

              <button 
                onClick={() => setShowAchievementsModal(true)}
                className="w-full py-4 bg-white dark:bg-slate-700 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2"
              >
                VIEW FULL HALL <ChevronRight size={14} />
              </button>
           </div>

           <div className="p-8 bg-indigo-600 dark:bg-indigo-700 rounded-[3rem] text-white space-y-6 shadow-2xl dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Zap size={100} />
              </div>
              <h3 className="text-xl font-black leading-tight relative z-10">Sync across all your devices</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed relative z-10">Use the Export/Import features to move your mathematical intelligence between machines.</p>
              <button 
                onClick={() => window.dispatchEvent(new Event('show_help'))}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all active:scale-95 shadow-xl shadow-indigo-900/20 relative z-10"
              >
                ACCESS SUPPORT
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number | string, color: string }> = ({ icon, label, value, color }) => (
  <div className={`p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6 ${color} dark:bg-slate-800`}>
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
      {icon}
    </div>
    <div>
      <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const AchievementItem: React.FC<{ icon: React.ReactNode, title: string, desc: string, unlocked?: boolean, progress?: number }> = ({ icon, title, desc, unlocked, progress }) => (
  <div className={`p-4 rounded-2xl transition-all ${unlocked ? 'bg-white dark:bg-slate-700 shadow-sm' : 'bg-white/50 dark:bg-slate-900/30'}`}>
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-lg shrink-0 ${unlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-grow">
        <div className="font-black text-slate-900 dark:text-white text-sm">{title}</div>
        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight line-clamp-1">{desc}</div>
        
        {!unlocked && progress !== undefined && (
          <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
