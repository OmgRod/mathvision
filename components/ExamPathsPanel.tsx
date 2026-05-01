
import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Zap, Target, ChevronRight, Award } from 'lucide-react';
import { EXAM_PATHS, getExamPathsProgress, ExamProgress, ExamPath } from '../examService';

interface ExamPathsPanelProps {
  onTopicSelect: (topic: string) => void;
  onPathSelect: (path: ExamPath) => void;
}

const ICON_MAP: Record<string, any> = {
  GraduationCap: GraduationCap,
  Zap: Zap,
  Target: Target
};

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400',
  amber: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
};

const PROGRESS_COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-600 dark:bg-indigo-500',
  amber: 'bg-amber-500 dark:bg-amber-400',
  emerald: 'bg-emerald-600 dark:bg-emerald-500'
};

export const ExamPathsPanel: React.FC<ExamPathsPanelProps> = ({ onTopicSelect, onPathSelect }) => {
  const [progress, setProgress] = React.useState<ExamProgress[]>([]);

  React.useEffect(() => {
    setProgress(getExamPathsProgress());
    
    const refresh = () => setProgress(getExamPathsProgress());
    window.addEventListener('xp_updated', refresh);
    window.addEventListener('profile_updated', refresh);
    return () => {
      window.removeEventListener('xp_updated', refresh);
      window.removeEventListener('profile_updated', refresh);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Exam Preparation Paths</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {EXAM_PATHS.map((path) => {
          const pathProgress = progress.find(p => p.pathId === path.id);
          const Icon = ICON_MAP[path.icon] || GraduationCap;
          const colorClass = COLOR_MAP[path.color] || COLOR_MAP.indigo;
          const progressColor = PROGRESS_COLOR_MAP[path.color] || PROGRESS_COLOR_MAP.indigo;
          
          return (
            <motion.div
              key={path.id}
              whileHover={{ y: -5 }}
              onClick={() => onPathSelect(path)}
              className={`p-8 rounded-[3rem] border flex flex-col gap-6 shadow-xl shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-800 transition-all cursor-pointer ${pathProgress?.isUnlocked ? 'ring-4 ring-indigo-500/20 ring-offset-4 dark:ring-offset-slate-900' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${colorClass}`}>
                  <Icon size={24} />
                </div>
                {pathProgress?.isUnlocked && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Award size={12} /> Mastered
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{path.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {path.description}
                </p>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Course Progress</span>
                    <span>{pathProgress?.percentComplete || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pathProgress?.percentComplete || 0}%` }}
                      className={`h-full ${progressColor}`}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   {path.topics.slice(0, 3).map(topic => {
                     const isDone = pathProgress?.completedTopics.includes(topic);
                     return (
                       <button
                         key={topic}
                         onClick={(e) => {
                           e.stopPropagation();
                           onTopicSelect(topic);
                         }}
                         className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${isDone 
                           ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                           : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
                       >
                         {topic}
                       </button>
                     );
                   })}
                   {path.topics.length > 3 && (
                     <div className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-400 dark:bg-slate-900 dark:border-slate-700">
                       +{path.topics.length - 3} more
                     </div>
                   )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onTopicSelect(path.topics.find(t => !pathProgress?.completedTopics.includes(t)) || path.topics[0]);
                  }}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${pathProgress?.isUnlocked 
                    ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 dark:shadow-none'}`}
                >
                  {pathProgress?.isUnlocked ? 'TRACK COMPLETED' : (pathProgress?.percentComplete === 0 ? 'START PATH' : 'CONTINUE PATH')}
                  {!pathProgress?.isUnlocked && <ChevronRight size={18} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
