
import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, GraduationCap, Zap, Target, Award, Play, BookOpen, Brain, CheckCircle2 } from 'lucide-react';
import { ExamPath, getExamPathsProgress } from '../examService';
import { PRACTICE_TOPICS } from '../constants';
import { getUserProfile } from '../userService';

interface ExamPlaylistViewProps {
  path: ExamPath;
  onBack: () => void;
  onLearnTopic: (topic: string) => void;
  onPracticeTopic: (topic: string) => void;
}

const ICON_MAP: Record<string, any> = {
  GraduationCap: GraduationCap,
  Zap: Zap,
  Target: Target
};

export const ExamPlaylistView: React.FC<ExamPlaylistViewProps> = ({ path, onBack, onLearnTopic, onPracticeTopic }) => {
  const profile = getUserProfile();
  const allCompleted = new Set([...profile.completedTopics, ...profile.masteredLessons]);
  const Icon = ICON_MAP[path.icon] || GraduationCap;

  const playlistTopics = path.topics.map(topicName => {
    const topicData = PRACTICE_TOPICS.find(t => t.name === topicName);
    return {
      name: topicName,
      description: topicData?.description || '',
      isCompleted: allCompleted.has(topicName),
      category: topicData?.category || 'General'
    };
  });

  const completedCount = playlistTopics.filter(t => t.isCompleted).length;
  const progressPercent = Math.round((completedCount / playlistTopics.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold uppercase tracking-widest text-xs"
      >
        <ChevronLeft size={16} />
        Back to Library
      </button>

      <header className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl dark:shadow-none space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 dark:text-white">
          <Icon size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-4 bg-indigo-600 rounded-3xl text-white">
                <Icon size={32} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{path.name}</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
              {path.description}
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 min-w-[200px] text-center">
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{progressPercent}%</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Overall Progress</div>
            <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-indigo-600"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-4">Playlist Content ({playlistTopics.length} Topics)</h3>
        <div className="grid grid-cols-1 gap-4">
          {playlistTopics.map((topic, index) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-6 rounded-[2.5rem] border bg-white dark:bg-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-lg hover:border-indigo-100 dark:hover:border-slate-600 ${topic.isCompleted ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-slate-100 dark:border-slate-700'}`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${topic.isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500'}`}>
                  {topic.isCompleted ? <CheckCircle2 size={24} /> : index + 1}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{topic.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{topic.description}</p>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <button 
                  onClick={() => onLearnTopic(topic.name)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
                >
                  <BookOpen size={16} className="group-hover:scale-110 transition-transform" />
                  LEARN
                </button>
                <button 
                  onClick={() => onPracticeTopic(topic.name)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none transition-all group"
                >
                  <Brain size={16} className="group-hover:scale-110 transition-transform" />
                  PRACTICE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
