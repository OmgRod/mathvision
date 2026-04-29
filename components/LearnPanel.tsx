import React, { useState, useMemo, useEffect } from 'react';
import { PRACTICE_TOPICS, TOPIC_DATA, getTopicCategories, getTopicLevels, formatTopicLevel } from '../constants';
import { Lesson, LessonSection, LessonQuestion, QuizFeedback } from '../types';
import { generateLesson, askLessonClarification, evaluateLessonAnswer, generateTopicOutline } from '../geminiService';
import { 
  ArrowLeft, Search, GraduationCap, ChevronRight, ChevronLeft, 
  MessageCircle, Send, Loader2, BookOpen, CheckCircle2, AlertCircle, 
  Lightbulb, RefreshCcw, Volume2, Sparkles, PenTool, Pencil
} from 'lucide-react';
import { TTSButton } from './TTSButton';
import { Whiteboard } from './Whiteboard';
import { CelebrationOverlay } from './CelebrationOverlay';
import { addXP, updateGenericStats, addMastery, incrementWhiteboardOpens } from '../userService';
import { checkAchievements } from '../achievementService';
import { saveToHistory } from '../historyService';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { MathInput } from './MathInput';

export const LearnPanel: React.FC<{ initialData?: Lesson | { lesson: Lesson; lastCheckpointIndex?: number; lessonLevel?: number } }> = ({ initialData }) => {
  // Detect if this is a wrapped lesson with checkpoint data (new format) or plain lesson (old format)
  const isWrappedFormat = initialData && typeof initialData === 'object' && 'lesson' in initialData;
  const restoredLesson: Lesson | undefined = isWrappedFormat ? (initialData as any).lesson : (initialData as Lesson | undefined);
  const restoredCheckpointIndex: number | undefined = isWrappedFormat ? (initialData as any).lastCheckpointIndex : undefined;
  const restoredLessonLevel: number | undefined = isWrappedFormat ? (initialData as any).lessonLevel : undefined;
  const hasInitialData = !!initialData;

  const [topic, setTopic] = useState<string | null>(restoredLesson ? restoredLesson.topic : null);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(restoredLesson || null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customTopic, setCustomTopic] = useState('');

  // Clarification Chat
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  // Checkpoint State
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [checkpointFeedback, setCheckpointFeedback] = useState<QuizFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const levels = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.flatMap(getTopicLevels)))], []);
  const categories = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.flatMap(getTopicCategories)))], []);

  const filteredTopics = useMemo(() => {
    return PRACTICE_TOPICS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || getTopicLevels(t).includes(selectedLevel);
      const matchesCategory = selectedCategory === 'All' || getTopicCategories(t).includes(selectedCategory);
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [searchTerm, selectedLevel, selectedCategory]);

  const [isFinished, setIsFinished] = useState(false);
  // If any initialData is provided, start in learning mode. Otherwise start in list mode.
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'learning'>(hasInitialData ? 'learning' : 'list');
  const [lessonLevel, setLessonLevel] = useState(restoredLessonLevel ?? 1);
  const [topicOutline, setTopicOutline] = useState<string[]>([]);
  const [outlineLoading, setOutlineLoading] = useState(false);

  // If restoring from history with checkpoint data, jump to that checkpoint
  useEffect(() => {
    if (hasInitialData && restoredLesson && restoredCheckpointIndex !== undefined) {
      setCurrentSectionIndex(restoredLesson.sections.length);
      setShowCheckpoint(true);
      setCurrentCheckpointIndex(restoredCheckpointIndex);
    }
  }, [hasInitialData, restoredLesson, restoredCheckpointIndex]);

  useEffect(() => {
    const handleRemoteLesson = (e: any) => {
      startLesson(e.detail);
    };
    window.addEventListener('learn_topic', handleRemoteLesson);
    return () => window.removeEventListener('learn_topic', handleRemoteLesson);
  }, []);

  const startLesson = async (selectedTopic: string, level: number = 1, skipDetail: boolean = false) => {
    setTopic(selectedTopic);
    setLesson(null);
    setLessonLevel(level);
    setViewMode(skipDetail ? 'learning' : 'detail');
    setCurrentSectionIndex(0);
    setCurrentCheckpointIndex(0);
    setUserAnswer('');
    setCheckpointFeedback(null);
    setShowCheckpoint(false);
    setChatHistory([]);
    setTopicOutline([]);
    
    if (!skipDetail) {
      setOutlineLoading(true);
      generateTopicOutline(selectedTopic, level).then(outline => {
        setTopicOutline(outline);
        setOutlineLoading(false);
      });
    } else {
      setLoading(true);
      try {
        const l = await generateLesson(selectedTopic, level);
        setLesson(l);
        saveToHistory('lesson', selectedTopic, {
          lesson: l,
          lastCheckpointIndex: 0,
          lessonLevel: level
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load lesson. Please try again.");
        setViewMode('list');
      } finally {
        setLoading(false);
      }
    }
  };

  const beginActualLearning = async () => {
    if (!topic) return;
    setLoading(true);
    setViewMode('learning');
    try {
      const l = await generateLesson(topic, lessonLevel);
      setLesson(l);
      saveToHistory('lesson', topic, {
        lesson: l,
        lastCheckpointIndex: 0,
        lessonLevel
      });
    } catch (err) {
      console.error(err);
      alert("Failed to load lesson. Please try again.");
      setViewMode('list');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTopics = () => {
    setTopic(null);
    setLesson(null);
    setViewMode('list');
    setChatHistory([]);
    setCurrentSectionIndex(0);
    setCurrentCheckpointIndex(0);
    setShowCheckpoint(false);
    setIsFinished(false);
    setLessonLevel(1);
  };
  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !lesson || isAsking) return;

    const question = chatQuestion;
    setChatQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setIsAsking(true);

    try {
      const context = lesson.sections[currentSectionIndex].content;
      const response = await askLessonClarification(lesson.topic, question, context);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "I'm sorry, I couldn't process that query. Please try again." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCheckpointSubmit = async () => {
    if (!lesson || !userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const checkpoint = lesson.checkpoints[currentCheckpointIndex];
      const feedback = await evaluateLessonAnswer(
        lesson.topic,
        checkpoint.question,
        userAnswer,
        checkpoint.correctAnswer
      );
      setCheckpointFeedback(feedback);
    } catch (error) {
      console.error(error);
      setCheckpointFeedback({
        isCorrect: false,
        message: "I'm having trouble evaluating that right now. Try your best and move forward!"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextSection = () => {
    if (!lesson) return;
    if (currentSectionIndex === lesson.sections.length - 1) {
      setShowCheckpoint(true);
    } else {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextCheckpoint = () => {
    if (!lesson) return;
    if (currentCheckpointIndex < lesson.checkpoints.length - 1) {
      // Save current progress to history
      saveToHistory('lesson', topic || lesson.topic, {
        lesson,
        lastCheckpointIndex: currentCheckpointIndex + 1,
        lessonLevel
      });
      setCurrentCheckpointIndex(prev => prev + 1);
      setUserAnswer('');
      setCheckpointFeedback(null);
    } else {
      // Completed all checkpoints
      const xpAmount = 150 * lessonLevel;
      addXP(xpAmount); // Comprehensive lesson bonus
      if (topic) addMastery(topic);
      updateGenericStats({ totalTimeMinutes: 20 });
      checkAchievements();
      // Save completed lesson to history
      saveToHistory('lesson', topic || lesson.topic, {
        lesson,
        lastCheckpointIndex: lesson.checkpoints.length,
        lessonLevel
      });
      window.dispatchEvent(new Event('xp_updated'));
      setIsFinished(true);
    }
  };

  const prevCheckpoint = () => {
    if (currentCheckpointIndex > 0) {
      setCurrentCheckpointIndex(prev => prev - 1);
      setUserAnswer('');
      setCheckpointFeedback(null);
    } else {
      setShowCheckpoint(false);
    }
    // Save progress when going back
    if (lesson) {
      saveToHistory('lesson', topic || lesson.topic, {
        lesson,
        lastCheckpointIndex: Math.max(0, currentCheckpointIndex - 1),
        lessonLevel
      });
    }
  };

  const formatMarkdown = (text: string) => {
    return text.replace(/\\n/g, '\n');
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto pb-40 transition-colors">
        <header className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-widest">
            <GraduationCap size={16} />
            Study Hall
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">Interactive <span className="text-indigo-600 dark:text-indigo-400">Learning</span></h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Choose a topic to start a personalized AI-guided lesson. Learn at your own pace with interactive examples and checkpoints.</p>
        </header>

        <div className="space-y-8 bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl shadow-indigo-100/30 dark:shadow-none">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics (e.g. Equations)..."
                className="w-full pl-14 pr-4 py-4 md:py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-[1.5rem] md:rounded-[2rem] focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium text-sm md:text-base dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 md:p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row gap-6 items-center">
            <div className="shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-base md:text-lg font-black text-indigo-900 dark:text-indigo-100 mb-1 uppercase tracking-tight">Something else?</h4>
              <p className="text-xs md:text-sm text-indigo-600/70 dark:text-indigo-400/70 font-medium italic">I'll create a custom lesson for any math topic.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. History of Zero..."
                className="flex-grow px-6 py-3 md:py-4 bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-2xl focus:border-indigo-600 transition-all font-bold text-slate-900 dark:text-white text-sm md:text-base"
              />
              <button
                onClick={() => startLesson(customTopic)}
                disabled={!customTopic.trim()}
                className="px-6 py-3 md:py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 text-sm md:text-base whitespace-nowrap"
              >
                Go
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              <span className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">Level</span>
              <div className="flex flex-nowrap gap-2">
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                      selectedLevel === level ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTopics.map((t, idx) => (
                <motion.button
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => startLesson(t.name)}
                  className="group p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] text-left hover:border-indigo-600 dark:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 dark:hover:shadow-none transition-all transform hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-colors"></div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{formatTopicLevel(t)}</span>
                    <ChevronRight className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" size={20} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{t.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t.description}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'detail') {
    const staticData = topic ? PRACTICE_TOPICS.find(t => t.name === topic) : null;
    
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 transition-colors">
        <button 
          onClick={handleBackToTopics}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Library
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <div className="md:col-span-2 space-y-8">
            <div className="space-y-4">
               <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{topic}</h1>
               <div className="flex gap-3">
                 <span className="px-4 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-black uppercase tracking-widest">Level {lessonLevel} Module</span>
                 <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-black uppercase tracking-widest">{staticData ? formatTopicLevel(staticData) : 'Academic'} Mastery</span>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl dark:shadow-none space-y-10">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Topic Overview</h3>
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {staticData?.description || "Dive deep into the fascinating details of this mathematical concept. Our AI tutor will guide you through theory and application."}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">What you'll learn</h3>
                {outlineLoading ? (
                  <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Loader2 size={20} className="animate-spin" />
                    Generating your curriculum...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(topicOutline.length > 0 ? topicOutline : ["Advanced Concepts", "Practical Logic", "Complex Systems", "Real-world Proofs"]).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">{i + 1}</div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-900 dark:bg-indigo-900/40 p-8 rounded-[3rem] text-white border-2 border-slate-900 dark:border-indigo-500/30 space-y-8 shadow-2xl dark:shadow-none relative overflow-hidden transition-colors">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <GraduationCap size={120} />
               </div>
               <div className="space-y-2 relative z-10">
                 <div className="text-[10px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-[0.2em] mb-4">Academic Module</div>
                 <div className="flex items-center gap-2 mb-2">
                   <BookOpen size={16} className="text-indigo-400" />
                   <span className="font-bold text-sm">Adaptive Study Sections</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-emerald-400" />
                   <span className="font-bold text-sm">Dynamic Checkpoints</span>
                 </div>
               </div>

               <button 
                 onClick={beginActualLearning}
                 disabled={loading}
                 className="w-full py-5 bg-white dark:bg-indigo-500 text-slate-900 dark:text-white rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-white/5 relative z-10 flex items-center justify-center gap-3"
               >
                 {loading ? <Loader2 className="animate-spin" /> : 'START LESSON'}
               </button>

               <div className="text-center relative z-10">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-indigo-300 uppercase tracking-widest">Est. Time: {staticData?.time || (staticData?.level === 'University' || staticData?.level === 'Advanced' ? '30-40 mins' : '15-20 mins')}</span>
               </div>
             </div>

             <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-[2rem] flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={24} />
                </div>
                <div className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase leading-snug">
                  AI-Powered Dynamic Curriculum: Tailored to your pace and questions.
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  function Diagram({ svg }: { svg?: string }) {
    if (!svg) return null;
    return (
      <div 
        className="my-8 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex justify-center overflow-auto shadow-sm"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 transition-colors">
      <button 
        onClick={handleBackToTopics}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Topics
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-indigo-600 dark:text-indigo-400"
            >
              <Sparkles size={64} />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap size={24} className="text-indigo-400 dark:text-indigo-300" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Brewing some math magic...</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Making numbers simple, one step at a time!"</p>
          </div>
        </div>
      ) : lesson && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Lesson Content */}
          <div className="lg:col-span-2 space-y-8 pb-32">
            <AnimatePresence mode="wait">
              {!showCheckpoint ? (
                <motion.div
                  key={`section-${currentSectionIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-700 shadow-2xl shadow-indigo-100/50 dark:shadow-none"
                >
                  <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl flex items-center justify-center font-black">
                        {currentSectionIndex + 1}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {lesson.sections[currentSectionIndex].title}
                      </h3>
                    </div>
                    <TTSButton text={`${lesson.sections[currentSectionIndex].title}. ${lesson.sections[currentSectionIndex].content}`} />
                  </div>

                  <div className="prose prose-invert max-w-none prose-p:text-slate-200 prose-p:leading-relaxed prose-headings:font-black prose-strong:text-indigo-400">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {formatMarkdown(lesson.sections[currentSectionIndex].content)}
                    </ReactMarkdown>
                  </div>

                  <Diagram svg={lesson.sections[currentSectionIndex].diagramSvg} />

                  <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <button
                      onClick={prevSection}
                      disabled={currentSectionIndex === 0}
                      className="flex items-center gap-2 px-6 py-4 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>
                    <button
                      onClick={nextSection}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all hover:translate-x-1"
                    >
                      {currentSectionIndex === lesson.sections.length - 1 ? 'Go to Checkpoint' : 'Continue Lesson'}
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`checkpoint-${currentCheckpointIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-600 dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 text-white border-4 border-indigo-600 dark:border-indigo-500 placeholder:shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden transition-colors"
                >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   
                   <div className="relative z-10 space-y-6 md:space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={32} className="text-indigo-200 dark:text-indigo-400" />
                          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Checkpoint {currentCheckpointIndex + 1}</h3>
                        </div>
                        <TTSButton text={lesson.checkpoints[currentCheckpointIndex].question} className="bg-white/10 text-white hover:bg-white/20 self-end md:self-auto" />
                      </div>

                      <div className="p-6 md:p-8 bg-white/10 dark:bg-indigo-900/20 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-indigo-500/30">
                        <div className="text-lg md:text-xl font-medium leading-relaxed prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {formatMarkdown(lesson.checkpoints[currentCheckpointIndex].question)}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {!checkpointFeedback ? (
                        <div className="space-y-4 relative">
                          <div className="relative">
                            <MathInput
                              value={userAnswer}
                              onChange={setUserAnswer}
                              placeholder="Your answer..."
                              className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-white/20 dark:border-slate-700 rounded-[1.5rem] md:rounded-[2rem] focus-within:border-white dark:focus-within:border-indigo-500 transition-all"
                              onEnter={handleCheckpointSubmit}
                              paddingRight="40px"
                            />
                          </div>
                          <button
                            onClick={handleCheckpointSubmit}
                            disabled={!userAnswer.trim() || isEvaluating}
                            className="w-full py-4 md:py-5 bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white font-black text-lg md:text-xl rounded-[1.5rem] md:rounded-[2rem] hover:bg-indigo-50 dark:hover:bg-indigo-700 transition-all shadow-xl dark:shadow-none flex items-center justify-center gap-3"
                          >
                            {isEvaluating ? (
                              <>
                                <Loader2 size={24} className="animate-spin" />
                                Evaluating...
                              </>
                            ) : 'Submit Answer'}
                          </button>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border ${
                            checkpointFeedback.isCorrect ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              {checkpointFeedback.isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                              <span className="font-black uppercase tracking-widest text-sm md:text-base">{checkpointFeedback.isCorrect ? 'Correct!' : 'Almost there!'}</span>
                            </div>
                            <TTSButton text={checkpointFeedback.message} className="bg-white/10 text-white hover:bg-white/20 self-end md:self-auto" size={14} />
                          </div>
                          
                          <div className="font-medium mb-6 leading-relaxed prose prose-invert prose-p:my-0">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {formatMarkdown(checkpointFeedback.message)}
                            </ReactMarkdown>
                          </div>
                          
                          {checkpointFeedback.improvement && (
                            <div className="mb-8 p-4 bg-black/20 rounded-xl border border-white/10 text-xs font-bold flex gap-3 italic">
                              <Lightbulb size={16} className="text-indigo-300 shrink-0" />
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {formatMarkdown(checkpointFeedback.improvement)}
                              </ReactMarkdown>
                            </div>
                          )}

                          <button
                            onClick={checkpointFeedback.isCorrect ? nextCheckpoint : () => setCheckpointFeedback(null)}
                            className="w-full py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg"
                          >
                            {checkpointFeedback.isCorrect ? (currentCheckpointIndex === lesson.checkpoints.length - 1 ? 'Complete Lesson' : 'Next Checkpoint') : 'Try Again'}
                          </button>
                        </motion.div>
                      )}

                      <div className="flex justify-between items-center mt-4">
                        <button 
                          onClick={prevCheckpoint}
                          className="flex items-center gap-2 text-indigo-200 dark:text-indigo-400 hover:text-white dark:hover:text-white transition-colors text-sm font-bold"
                        >
                          <ChevronLeft size={16} />
                          Back
                        </button>
                        <button 
                          onClick={() => setShowCheckpoint(false)}
                          className="flex items-center gap-2 text-indigo-200 dark:text-indigo-400 hover:text-white dark:hover:text-white transition-colors text-sm font-bold"
                        >
                          <RefreshCcw size={16} />
                          Review Lesson Content
                        </button>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Tutor Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl dark:shadow-none relative overflow-hidden group border border-white/5">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex flex-col h-[500px]">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-widest text-xs">AI Tutor</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Ask anything if you're stuck!</p>
                    </div>
                  </div>

                  <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                        <div className="p-4 bg-white/5 rounded-full text-indigo-400">
                          <Lightbulb size={32} />
                        </div>
                        <p className="text-sm text-slate-400 font-bold">"Is there a part of this lesson you'd like me to explain differently?"</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed group relative ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-br-none' 
                              : 'bg-white/10 text-slate-200 rounded-bl-none prose prose-invert prose-xs'
                          }`}>
                            {msg.role === 'ai' ? (
                               <div className="flex gap-2">
                                 <div className="flex-grow">
                                   <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                     {msg.text}
                                   </ReactMarkdown>
                                 </div>
                                 <TTSButton text={msg.text} size={10} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 border border-white/10" />
                               </div>
                            ) : msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    {isAsking && (
                      <div className="flex items-center gap-2">
                        <div className="p-3 bg-white/10 rounded-2xl rounded-bl-none">
                          <Loader2 className="animate-spin text-indigo-400" size={16} />
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAskTutor} className="relative">
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      placeholder="Ask for clarification..."
                      disabled={isAsking}
                      className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 focus:bg-white/10 transition-all text-xs font-bold text-white placeholder:text-slate-500"
                    />
                    <button 
                      type="submit"
                      disabled={!chatQuestion.trim() || isAsking}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-800 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-6 rounded-[2rem] flex items-center gap-4 transition-colors">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest">Progress</h4>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentSectionIndex + (showCheckpoint ? 1 : 0)) / (lesson.sections.length + 1)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}

      {lesson && (
        <button
          onClick={() => {
            if (!showWhiteboard) {
              incrementWhiteboardOpens();
              checkAchievements();
            }
            setShowWhiteboard(prev => !prev);
          }}
          className="fixed bottom-6 left-6 z-40 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Pencil size={20} />
          <span className="font-bold text-sm hidden md:inline">Open Scratchpad</span>
        </button>
      )}

      {isFinished && (
        <CelebrationOverlay 
          xpEarned={150 * lessonLevel}
          message={`Level ${lessonLevel} Mastered! You've successfully completed the current module for ${topic}. Ready for more advanced concepts?`}
          onHome={handleBackToTopics}
          onNext={() => {
            const nextLevel = lessonLevel + 1;
            setIsFinished(false);
            if (topic) startLesson(topic, nextLevel, true);
          }}
        />
      )}
    </div>
  );
};
