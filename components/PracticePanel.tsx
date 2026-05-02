
import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Volume2,
  PenTool,
  History,
  Pencil,
  Calculator
} from 'lucide-react';
import { TTSButton } from './TTSButton';
import { Whiteboard } from './Whiteboard';
import { CalculatorModal } from './CalculatorModal';
import { CelebrationOverlay } from './CelebrationOverlay';
import { addXP, updateGenericStats, addCompletedTopic, incrementHintsUsed, incrementWhiteboardOpens, getUserProfile } from '../userService';
import { checkAchievements } from '../achievementService';
import { saveToHistory } from '../historyService';
import { updateSrsItem } from '../srsService';
import { generateQuizQuestion, evaluateStep } from '../geminiService';
import { QuizQuestion, QuizFeedback } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MathInput } from './MathInput';
import { TopicLibrary } from './TopicLibrary';
import { PRACTICE_TOPICS } from '../constants';

const wrapMathIfNeeded = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/\$/.test(trimmed)) return trimmed;
  if (/\\[a-zA-Z]+/.test(trimmed) || /[\^_{}]/.test(trimmed)) {
    return `$$${trimmed}$$`;
  }
  return trimmed;
};

export const PracticePanel: React.FC<{ 
  initialData?: { topic: string, data?: QuizQuestion },
  playlistContext?: { pathId: string, topicNames: string[], currentIndex: number } | null,
  onPlaylistNext?: () => void
}> = ({ initialData, playlistContext, onPlaylistNext }) => {
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
  const [showCalculator, setShowCalculator] = useState(false);
  
  useEffect(() => {
    if (initialData?.topic && initialData.topic !== topic) {
      startPractice(initialData.topic);
    } else if (initialData?.topic && !initialData.data && !question && !loading) {
      startPractice(initialData.topic);
    }
  }, [initialData?.topic, initialData?.data]);
  
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
      const profile = getUserProfile();
      const result = await evaluateStep(question.question, expectedStep.math, userAnswer, question.finalAnswer, profile.socraticMode);
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
      
      // Calculate quality of recall for SRS (0-5)
      let quality = 5;
      if (hintsUsed === 1) quality = 4;
      else if (hintsUsed === 2) quality = 3;
      else if (hintsUsed > 2) quality = 2;
      updateSrsItem(topic!, quality);
      
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
    incrementHintsUsed();
    checkAchievements();
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
            className="mx-auto w-20 h-20 bg-indigo-600 dark:bg-indigo-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200 dark:shadow-none"
          >
            <Brain size={40} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Master Any Topic
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            Choose from over 50 expert-curated math subjects and solve problems step-by-step with real-time AI feedback.
          </motion.p>
        </div>

        <div className="space-y-12 transition-colors">
          <TopicLibrary 
            topics={PRACTICE_TOPICS} 
            onTopicSelect={startPractice} 
          />

          {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full p-6 md:p-8 bg-slate-900 dark:bg-indigo-600 text-white border-2 border-slate-900 dark:border-indigo-600 rounded-[2rem] md:rounded-[2.5rem] hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all text-center flex flex-col items-center justify-center gap-3 group shadow-2xl shadow-slate-200 dark:shadow-none"
              >
                <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                  <Plus size={24} />
                </div>
                <div>
                  <span className="text-base md:text-lg font-black block">Other / Custom Topic</span>
                  <span className="text-xs md:text-sm text-slate-400 dark:text-indigo-200 font-medium italic">Type anything you want to practice</span>
                </div>
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 bg-white dark:bg-slate-800 border-4 border-indigo-600 dark:border-indigo-500 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-indigo-100 dark:shadow-none space-y-4 md:space-y-6"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="text-amber-500" size={20} />
                  <label className="block text-lg md:text-xl font-black text-slate-900 dark:text-white">What do you want to learn today?</label>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Calculus: Green's Theorem"
                    className="flex-grow px-6 md:px-8 py-4 md:py-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 transition-all font-bold text-base md:text-lg dark:text-white"
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
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-xs font-bold transition-all"
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
            className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-2xl shadow-indigo-50 dark:shadow-none transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 md:px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider prose prose-xs prose-indigo dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <>{children}</>,
                    }}
                  >
                    {topic || ''}
                  </ReactMarkdown>
                </span>
                {question.calculatorAllowed !== undefined && (
                  <span className={`px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    question.calculatorAllowed 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    <Calculator size={12} />
                    {question.calculatorAllowed ? 'Calculator Allowed' : 'No Calculator'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-mono text-[10px] md:text-xs">
                <span>Score: {score}</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="text-xl md:text-2xl font-black text-white prose prose-invert max-w-none flex-grow">
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
                className="my-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex justify-center overflow-auto"
                dangerouslySetInnerHTML={{ __html: question.diagramSvg }}
              />
            )}

            <div className="space-y-6">
              {/* Previous Completed Steps */}
              <AnimatePresence>
                {completedSteps.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <History size={12} />
                       Previous Steps
                    </span>
                    {completedSteps.map((cs, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1"
                      >
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase prose prose-xs dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              p: ({ children }) => <>{children}</>,
                            }}
                          >
                            {`Step ${idx + 1}: ${cs.step.title}`}
                          </ReactMarkdown>
                        </div>
                        <div className="bg-slate-800 inline-block px-3 py-1 rounded-lg border border-slate-700 shadow-sm prose prose-invert prose-p:m-0 prose-code:text-indigo-400 prose-code:bg-transparent">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {wrapMathIfNeeded(cs.answer)}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2">
                <div className="h-px flex-grow bg-slate-100 dark:bg-slate-700"></div>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase">Step {currentStepIndex + 1}</span>
                <div className="h-px flex-grow bg-slate-100 dark:bg-slate-700"></div>
              </div>

              {question.correctSteps[currentStepIndex].diagramSvg && (
                <div 
                  className="p-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex justify-center overflow-auto"
                  dangerouslySetInnerHTML={{ __html: question.correctSteps[currentStepIndex].diagramSvg }}
                />
              )}

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400">
                  {question.type !== 'FREE_RESPONSE' ? 'Choose the correct option:' : "What's the next step? Type the mathematical expression:"}
                </label>
                
                {question.type !== 'FREE_RESPONSE' && question.options ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!feedback?.isCorrect && !loading) {
                              setUserAnswer(option);
                            }
                          }}
                          disabled={loading || feedback?.isCorrect}
                          className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                            userAnswer === option 
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                              userAnswer === option ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white prose prose-invert">
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                  p: ({ children }) => <>{children}</>,
                                }}
                              >
                                {wrapMathIfNeeded(option)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {!feedback?.isCorrect && (
                      <button
                        onClick={handleNextStep}
                        disabled={loading || !userAnswer}
                        className="w-full py-5 bg-indigo-600 dark:bg-indigo-500 text-white font-black text-xl rounded-2xl hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none"
                      >
                        {loading ? <RefreshCcw size={24} className="animate-spin" /> : <Send size={24} />}
                        Submit Answer
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <MathInput
                        value={userAnswer}
                        onChange={setUserAnswer}
                        disabled={feedback?.isCorrect || loading}
                        placeholder="e.g. 2x = 10"
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus-within:border-indigo-500 transition-all font-bold"
                        onEnter={handleNextStep}
                        paddingRight="60px"
                      />
                      <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1 z-10">
                        <button
                          onClick={handleNextStep}
                          disabled={loading || !userAnswer || feedback?.isCorrect}
                          className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 transition-all"
                        >
                          {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-6 rounded-2xl border ${feedback.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                  >
                    <div className="flex gap-4">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="text-rose-500 dark:text-rose-400 shrink-0" />
                      )}
                      <div className="flex-grow space-y-2 prose prose-sm prose-invert max-w-none">
                        <div className={`font-bold ${feedback.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'} flex items-center justify-between gap-2`}>
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
                          <div className="text-sm text-slate-500 dark:text-slate-400 italic flex items-center justify-between gap-2">
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
                            className="mt-4 px-6 py-2 bg-emerald-500 dark:bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                          >
                            Proceed to {(feedback.isFinalAnswer || currentStepIndex === question.correctSteps.length - 1) ? 'Finish' : 'Next Step'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-6">
                {!feedback && (
                  <button
                    onClick={useHint}
                    className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors"
                  >
                    <Lightbulb size={16} />
                    Stuck? Get a Hint
                  </button>
                )}
                
                {question.calculatorAllowed && (
                  <button
                    onClick={() => setShowCalculator(true)}
                    className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold transition-colors"
                  >
                    <Calculator size={16} />
                    Open Calculator
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}

      {showCalculator && (
        <CalculatorModal onClose={() => setShowCalculator(false)} />
      )}

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
          onPlaylistNext={onPlaylistNext}
        />
      )}
    </div>
  );
};

