import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, GraduationCap, Filter, ChevronRight, RefreshCcw, Award } from 'lucide-react';
import { ExamPathsPanel } from './ExamPathsPanel';
import { MathTopic, getTopicCategories, getTopicLevels, formatTopicLevel } from '../constants';
import { getDueItems, SrsItem } from '../srsService';

interface TopicLibraryProps {
  topics: MathTopic[];
  onTopicSelect: (topic: string) => void;
  onPathSelect?: (path: any) => void;
  emptyMessage?: string;
}

export const TopicLibrary: React.FC<TopicLibraryProps> = ({
  topics,
  onTopicSelect,
  onPathSelect,
  emptyMessage = 'No topics matched your search criteria.',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dueItems, setDueItems] = useState<SrsItem[]>([]);

  React.useEffect(() => {
    setDueItems(getDueItems());
  }, []);

  const levels = useMemo<string[]>(() => ['All', ...Array.from(new Set(topics.flatMap(getTopicLevels)))], [topics]);
  const categories = useMemo<string[]>(() => ['All', ...Array.from(new Set(topics.flatMap(getTopicCategories)))], [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || getTopicLevels(t).includes(selectedLevel);
      const matchesCategory = selectedCategory === 'All' || getTopicCategories(t).includes(selectedCategory);
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [topics, searchQuery, selectedLevel, selectedCategory]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, MathTopic[]> = {};

    filteredTopics.forEach(t => {
      const topicCategories = getTopicCategories(t);
      // Group by the first matching category if filtered, or just the primary category
      const displayCategory = (selectedCategory !== 'All' && topicCategories.includes(selectedCategory))
        ? selectedCategory
        : (topicCategories[0] || 'Uncategorized');
      
      groups[displayCategory] ??= [];
      groups[displayCategory].push(t);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTopics]);

  return (
    <div className="space-y-12 transition-colors">
      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search topics (e.g. Calculus...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base"
            />
          </div>
          <div className="grid grid-cols-2 md:flex gap-2">
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-10 pr-6 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl appearance-none font-bold text-slate-600 dark:text-slate-400 focus:border-indigo-500 transition-all cursor-pointer text-xs md:text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level} className="dark:bg-slate-900">{level}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-6 py-3 md:py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl appearance-none font-bold text-slate-600 dark:text-slate-400 focus:border-indigo-500 transition-all cursor-pointer text-xs md:text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="dark:bg-slate-900">{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <ExamPathsPanel 
        onTopicSelect={onTopicSelect} 
        onPathSelect={(path) => {
          if (onPathSelect) onPathSelect(path);
          window.dispatchEvent(new CustomEvent('select_exam_path', { detail: path }));
        }} 
      />


      {dueItems.length > 0 && (
        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCcw className="text-indigo-200 dark:text-indigo-300" size={24} />
            <h3 className="text-xl font-black uppercase tracking-widest">Due for Review</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueItems.map(item => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={item.topic}
                onClick={() => onTopicSelect(item.topic)}
                className="p-5 bg-white/10 hover:bg-white/20 rounded-3xl border border-white/20 transition-all text-left flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-lg">{item.topic}</div>
                  <div className="text-xs text-indigo-200 mt-1 uppercase font-bold tracking-wider">Level {item.repetitions} Mastery</div>
                </div>
                <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <ChevronRight size={20} className="text-indigo-100" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-12 transition-colors">
        {groupedTopics.map(([category, topicGroup]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">{category}</h3>
              <div className="h-px flex-grow bg-slate-100 dark:bg-slate-800"></div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{topicGroup.length} Topics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicGroup.map((topic) => (
                <motion.button
                  key={topic.name}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTopicSelect(topic.name)}
                  className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100/30 dark:hover:shadow-none transition-all text-left flex flex-col justify-between group h-content"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{formatTopicLevel(topic)}</span>
                      <ChevronRight className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" size={20} />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 dark:text-white">{topic.name}</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">{topic.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {groupedTopics.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xl">{emptyMessage}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('All');
                setSelectedCategory('All');
              }}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
