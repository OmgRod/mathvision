
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Lightbulb,
  ArrowLeft,
  Trophy,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Volume2,
  PenTool,
  History,
  Pencil
} from 'lucide-react';
import { TTSButton } from './TTSButton';
import { Whiteboard } from './Whiteboard';
import { CelebrationOverlay } from './CelebrationOverlay';
import { addXP, updateGenericStats, addCompletedTopic } from '../userService';
import { checkAchievements } from '../achievementService';
import { saveToHistory } from '../historyService';
import { generateQuizQuestion, evaluateStep } from '../geminiService';
import { QuizQuestion, QuizFeedback } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MathInput } from './MathInput';
import { TOPIC_DATA, PRACTICE_TOPICS, MathTopic } from '../constants';

export const PracticePanel: React.FC<{ initialData?: { topic: string, data: QuizQuestion } }> = ({ initialData }) => {
  const [topic, setTopic] = useState<string | null>(initialData?.topic || null);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(initialData?.data || null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<{ step: any, answer: string }[]>([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const levels = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.map(t => t.level as string)))], []);
  const categories = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.map(t => t.category as string)))], []);

  const filteredTopics = useMemo(() => {
    return PRACTICE_TOPICS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || t.level === selectedLevel;
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [searchQuery, selectedLevel, selectedCategory]);

  const groupedTopics = useMemo(() => {
    const groups: { [key: string]: MathTopic[] } = {};
    filteredTopics.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [filteredTopics]);

  const startPractice = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setQuestion(null);
    setFeedback(null);
    setUserAnswer('');
    setCurrentStepIndex(0);
    setIsFinished(false);
    setScore(0);
    setHintsUsed(0);
    setCompletedSteps([]);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    try {
      const q = await generateQuizQuestion(selectedTopic);
      setQuestion(q);
      saveToHistory('practice', selectedTopic, q);
    } catch (err) {
      console.error(err);
      alert("Failed to start practice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (!question || !userAnswer) return;
    
    setLoading(true);
    const expectedStep = question.correctSteps[currentStepIndex];
    try {
      const result = await evaluateStep(question.question, expectedStep.math, userAnswer, question.finalAnswer);
      setFeedback(result);
      
      if (result.isCorrect) {
        setScore(prev => prev + (currentStepIndex === question.correctSteps.length - 1 || result.isFinalAnswer ? 10 : 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const proceedToNext = () => {
    if (!question || !feedback) return;
    
    // Store current step and answer in history
    setCompletedSteps(prev => [
      ...prev, 
      { step: question.correctSteps[currentStepIndex], answer: userAnswer }
    ]);

    if (feedback.isFinalAnswer || currentStepIndex >= (question.correctSteps.length || 0) - 1) {
      const xpAmount = score + 50; // Base completion bonus
      addXP(xpAmount);
      addCompletedTopic(topic!);
      updateGenericStats({ totalQuestionsSolved: 1, totalTimeMinutes: 5 });
      checkAchievements();
      window.dispatchEvent(new Event('xp_updated'));
      setIsFinished(true);
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
    }
  };

  const useHint = () => {
    if (!question) return;
    setHintsUsed(prev => prev + 1);
    const hint = question.correctSteps[currentStepIndex].title;
    setFeedback({
      isCorrect: false,
      message: `Hint: ${hint}`,
    });
  };

  const handleBackToTopics = () => {
    setTopic(null);
    setQuestion(null);
    setFeedback(null);
    setUserAnswer('');
    setCurrentStepIndex(0);
    setIsFinished(false);
  };

  if (!topic) {
    return (
      <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto pb-40">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200"
          >
            <Brain size={40} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            Master Any Topic
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500"
          >
            Choose from over 50 expert-curated math subjects and solve problems step-by-step with real-time AI feedback.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search topics (e.g. Calculus...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-bold text-slate-700 text-sm md:text-base"
              />
            </div>
            <div className="grid grid-cols-2 md:flex gap-2">
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full pl-10 pr-6 py-3 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-600 focus:border-indigo-500 transition-all cursor-pointer text-xs md:text-sm"
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-6 py-3 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl appearance-none font-bold text-slate-600 focus:border-indigo-500 transition-all cursor-pointer text-xs md:text-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-12">
          {Object.entries(groupedTopics).map(([category, topics]) => (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">{category}</h3>
                <div className="h-px flex-grow bg-slate-100"></div>
                <span className="text-xs font-bold text-slate-400">{topics.length} Topics</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((t) => (
                  <motion.button
                    key={t.name}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startPractice(t.name)}
                    className="p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all text-left flex flex-col justify-between group h-content"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{t.level}</span>
                        <ChevronRight className="text-slate-200 group-hover:text-indigo-500 transition-all" size={20} />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">{t.name}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{t.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedTopics).length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xl">No topics matched your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedLevel('All'); setSelectedCategory('All'); }}
                className="mt-4 text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
          
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full p-6 md:p-8 bg-slate-900 text-white border-2 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] hover:bg-slate-800 transition-all text-center flex flex-col items-center justify-center gap-3 group shadow-2xl shadow-slate-200"
              >
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <Plus size={24} />
                </div>
                <div>
                  <span className="text-base md:text-lg font-black block">Other / Custom Topic</span>
                  <span className="text-xs md:text-sm text-slate-400 font-medium italic">Type anything you want to practice</span>
                </div>
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 bg-white border-4 border-indigo-600 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-indigo-100 space-y-4 md:space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="text-amber-500" size={20} />
                  <label className="block text-lg md:text-xl font-black text-slate-900">What do you want to learn today?</label>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Calculus: Green's Theorem"
                    className="flex-grow px-6 md:px-8 py-4 md:py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-bold text-base md:text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && customTopic && startPractice(customTopic)}
                    autoFocus
                  />
                  <button
                    onClick={() => customTopic && startPractice(customTopic)}
                    disabled={!customTopic || loading}
                    className="px-8 md:px-10 py-4 md:py-5 bg-indigo-600 text-white rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-200"
                  >
                    Launch
                  </button>
                </div>
                <button 
                  onClick={() => setShowCustomInput(false)}
                  className="px-6 py-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </div>
      );
    }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button 
        onClick={handleBackToTopics}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Topics
      </button>

      {loading && !question && (
        <div className="text-center py-20 space-y-4">
          <div className="animate-spin text-indigo-600 inline-block">
            <RefreshCcw size={48} />
          </div>
          <p className="text-slate-500 font-medium tracking-wide">AI is generating your challenge...</p>
        </div>
      )}

      {question && !isFinished && (
        <div className="space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-50"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 md:px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider">
                {topic}
              </span>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] md:text-xs">
                <span>Score: {score}</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="text-xl md:text-2xl font-black text-slate-900 prose prose-slate max-w-none flex-grow">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <>{children}</>,
                  }}
                >
                  {question.question}
                </ReactMarkdown>
              </div>
              <TTSButton text={question.question} className="ml-4" />
            </div>

            {question.diagramSvg && (
              <div 
                className="my-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-center overflow-auto"
                dangerouslySetInnerHTML={{ __html: question.diagramSvg }}
              />
            )}

            <div className="space-y-6">
              {/* Previous Completed Steps */}
              <AnimatePresence>
                {completedSteps.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <History size={12} />
                       Previous Steps
                    </span>
                    {completedSteps.map((cs, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1"
                      >
                        <div className="text-xs font-bold text-slate-500 uppercase">Step {idx + 1}: {cs.step.title}</div>
                        <div className="font-mono text-indigo-600 bg-white inline-block px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                           {cs.answer}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <div className="h-px flex-grow bg-slate-100"></div>
                <span className="text-xs font-bold text-slate-300 uppercase">Step {currentStepIndex + 1}</span>
                <div className="h-px flex-grow bg-slate-100"></div>
              </div>

              {question.correctSteps[currentStepIndex].diagramSvg && (
                <div 
                  className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex justify-center overflow-auto"
                  dangerouslySetInnerHTML={{ __html: question.correctSteps[currentStepIndex].diagramSvg }}
                />
              )}

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-500">What's the next step? Type the mathematical expression:</label>
                <div className="relative">
                  <div className="relative">
                    <MathInput
                      value={userAnswer}
                      onChange={setUserAnswer}
                      disabled={feedback?.isCorrect || loading}
                      placeholder="e.g. 2x = 10"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl focus-within:border-indigo-500 transition-all"
                      onEnter={handleNextStep}
                      paddingRight="60px"
                    />
                    <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1 z-10">
                      <button
                        onClick={handleNextStep}
                        disabled={loading || !userAnswer || feedback?.isCorrect}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                      >
                        {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-6 rounded-2xl border ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex gap-4">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="text-rose-500 shrink-0" />
                      )}
                      <div className="flex-grow space-y-2 prose prose-sm prose-slate max-w-none">
                        <div className={`font-bold ${feedback.isCorrect ? 'text-emerald-700' : 'text-slate-700'} flex items-center justify-between gap-2`}>
                          <div className="flex-grow">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                p: ({ children }) => <>{children}</>,
                              }}
                            >
                              {feedback.message}
                            </ReactMarkdown>
                          </div>
                          <TTSButton text={feedback.message} size={14} />
                        </div>
                        {feedback.improvement && (
                          <div className="text-sm text-slate-500 italic flex items-center justify-between gap-2">
                             <div className="flex-grow">
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  p: ({ children }) => <>{children}</>,
                                }}
                              >
                                {`Tip: ${feedback.improvement}`}
                              </ReactMarkdown>
                            </div>
                            <TTSButton text={feedback.improvement} size={12} className="p-1" />
                          </div>
                        )}
                        {feedback.isCorrect && (
                          <button
                            onClick={proceedToNext}
                            className="mt-4 px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
                          >
                            Proceed to {(feedback.isFinalAnswer || currentStepIndex === question.correctSteps.length - 1) ? 'Finish' : 'Next Step'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!feedback && (
                <button
                  onClick={useHint}
                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 text-sm font-bold transition-colors"
                >
                  <Lightbulb size={16} />
                  Stuck? Get a Hint
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}

      <button
        onClick={() => setShowWhiteboard(!showWhiteboard)}
        className="fixed bottom-6 left-6 z-40 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-2"
      >
        <Pencil size={20} />
        <span className="font-bold text-sm hidden md:inline">Open Scratchpad</span>
      </button>

      {isFinished && (
        <CelebrationOverlay 
          xpEarned={score + 50}
          message={`You crushed the practice module on ${topic}! You've gained 100% completion.`}
          onHome={() => {
            setTopic(null);
            setIsFinished(false);
          }}
          onNext={() => {
            setIsFinished(false);
            startPractice(topic!);
          }}
        />
      )}
    </div>
  );
};

