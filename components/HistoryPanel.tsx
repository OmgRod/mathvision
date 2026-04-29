import React, { useState, useEffect } from 'react';
import { getHistory, deleteHistoryItem, clearHistory } from '../historyService';
import { HistoryItem } from '../types';
import { 
  Clock, Trash2, BookOpen, Brain, GraduationCap, ChevronRight, 
  Calendar, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from './Modal';

interface HistoryPanelProps {
  onSelectItem: (item: HistoryItem) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelectItem }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'clear' | 'delete';
    targetId?: string;
  }>({
    isOpen: false,
    type: 'clear'
  });

  useEffect(() => {
    const loadHistory = () => setHistory(getHistory());
    loadHistory();
    window.addEventListener('history-updated', loadHistory);
    return () => window.removeEventListener('history-updated', loadHistory);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const getTypeIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'solution': return <BookOpen size={16} className="text-blue-500" />;
      case 'practice': return <Brain size={16} className="text-purple-500" />;
      case 'lesson': return <GraduationCap size={16} className="text-indigo-500" />;
    }
  };

  const getTypeLabel = (type: HistoryItem['type']) => {
    switch (type) {
      case 'solution': return 'Solved Problem';
      case 'practice': return 'Practice Lap';
      case 'lesson': return 'Lesson Guide';
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
          <Clock size={40} />
        </div>
        <div className="max-w-xs">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Your history is empty</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Every master was once a beginner. Start solving or learning to see your journey here!"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 pb-40 transition-colors">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Clock className="text-indigo-600 dark:text-indigo-400" />
            Learning <span className="text-indigo-600 dark:text-indigo-400">Journey</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Revisit your past solutions and lessons</p>
        </div>
        <button
          onClick={() => setModalConfig({ isOpen: true, type: 'clear' })}
          className="flex items-center justify-center gap-2 px-4 py-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all font-bold text-sm w-fit"
        >
          <Trash2 size={16} />
          Clear All
        </button>
      </header>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={() => {
          if (modalConfig.type === 'clear') {
            clearHistory();
            setHistory([]); // Immediate UI update
          } else if (modalConfig.targetId) {
            deleteHistoryItem(modalConfig.targetId);
            setHistory(prev => prev.filter(item => item.id !== modalConfig.targetId)); // Immediate UI update
          }
        }}
        title={modalConfig.type === 'clear' ? "Clear entire history?" : "Remove this item?"}
        message={modalConfig.type === 'clear' 
          ? "This will delete all your past solutions and lessons forever. This action cannot be undone." 
          : "Are you sure you want to remove this specific session from your journey?"}
        confirmLabel={modalConfig.type === 'clear' ? "Clear History" : "Remove"}
        confirmVariant="danger"
      />

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              role="article"
              aria-label={`${getTypeLabel(item.type)}: ${item.topic}`}
              className="group bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500 transition-all flex items-center gap-6 relative overflow-hidden"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                {getTypeIcon(item.type)}
              </div>

              <div className="flex-grow min-w-0 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-indigo-400">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(item.timestamp)}
                  </span>
                </div>
                <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.topic || 'Untitled Session'}
                </h4>
              </div>

              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => onSelectItem(item)}
                  className="p-3 md:px-4 md:py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 focus:opacity-100 outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                  <span className="hidden md:inline">View Detail</span>
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModalConfig({ isOpen: true, type: 'delete', targetId: item.id });
                  }}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  title="Remove from history"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex gap-4">
        <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0" />
        <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium leading-relaxed">
          <b>Space Saving:</b> History is stored locally on your device. We keep your last 50 sessions so you can always look back at your progress without cluttering your browser!
        </p>
      </div>
    </div>
  );
};
