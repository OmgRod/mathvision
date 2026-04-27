
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
  Plus
} from 'lucide-react';
import { generateQuizQuestion, evaluateStep } from '../geminiService';
import { QuizQuestion, Step, QuizFeedback } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const TOPICS = [
  'Algebraic Equations',
  'Calculus: Derivatives',
  'Calculus: Integrals',
  'Geometry: Area & Volume',
  'Trigonometry',
  'Linear Algebra',
  'Probability & Statistics'
];

export const PracticePanel: React.FC = () => {
  const [topic, setTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const startPractice = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setLoading(true);
    try {
      const q = await generateQuizQuestion(selectedTopic);
      setQuestion(q);
      setCurrentStepIndex(0);
      setUserAnswer('');
      setFeedback(null);
      setIsFinished(false);
      setScore(0);
      setHintsUsed(0);
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
      const result = await evaluateStep(question.question, expectedStep.math, userAnswer);
      setFeedback(result);
      
      if (result.isCorrect) {
        if (currentStepIndex === question.correctSteps.length - 1) {
          setIsFinished(true);
          setScore(prev => prev + 10);
        } else {
          setScore(prev => prev + 5);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const proceedToNext = () => {
    if (currentStepIndex < (question?.correctSteps.length || 0) - 1) {
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

  if (!topic) {
    return (
      <div className="space-y-8 py-8 px-4 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <Brain size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Choose a Topic to Master</h2>
          <p className="text-slate-500">Select a subject area where you want to test your skills step-by-step.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => startPractice(t)}
              className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-100 transition-all text-left flex items-center justify-between group"
            >
              <span className="text-lg font-bold text-slate-800">{t}</span>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
          ))}
          
          <div className="md:col-span-2">
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-center flex items-center justify-center gap-2 group"
              >
                <Plus size={20} className="text-slate-400 group-hover:text-indigo-500" />
                <span className="text-lg font-bold text-slate-500 group-hover:text-indigo-600">Other / Custom Topic</span>
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white border-2 border-indigo-100 rounded-3xl shadow-xl shadow-indigo-50 space-y-4"
              >
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Specify your topic</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. Quadractic Equations with complex roots"
                    className="flex-grow px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && customTopic && startPractice(customTopic)}
                    autoFocus
                  />
                  <button
                    onClick={() => customTopic && startPractice(customTopic)}
                    disabled={!customTopic || loading}
                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    Start
                  </button>
                </div>
                <button 
                  onClick={() => setShowCustomInput(false)}
                  className="text-sm text-slate-400 hover:text-slate-600 font-bold"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <button 
        onClick={() => setTopic(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Change Topic
      </button>

      {loading && !question && (
        <div className="text-center py-20 space-y-4">
          <div className="animate-spin text-indigo-600 inline-block">
            <RefreshCcw size={48} />
          </div>
          <p className="text-slate-500 font-medium tracking-wide">Generating your practice session...</p>
        </div>
      )}

      {question && !isFinished && (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-50"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {topic}
              </span>
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                <span>Score: {score}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {question.question}
            </h3>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-px flex-grow bg-slate-100"></div>
                <span className="text-xs font-bold text-slate-300 uppercase">Step {currentStepIndex + 1}</span>
                <div className="h-px flex-grow bg-slate-100"></div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-500">What's the next step? Type the mathematical expression:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={feedback?.isCorrect}
                    placeholder="e.g. 2x = 10"
                    className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all font-mono text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  />
                  <button
                    onClick={handleNextStep}
                    disabled={loading || !userAnswer || feedback?.isCorrect}
                    className="absolute right-3 top-3 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                  >
                    {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
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
                      <div className="space-y-2">
                        <p className={`font-bold ${feedback.isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {feedback.message}
                        </p>
                        {feedback.improvement && (
                          <p className="text-sm text-slate-500 italic">Tip: {feedback.improvement}</p>
                        )}
                        {feedback.isCorrect && (
                          <button
                            onClick={proceedToNext}
                            className="mt-4 px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all"
                          >
                            Proceed to {currentStepIndex === question.correctSteps.length - 1 ? 'Finish' : 'Next Step'}
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

      {isFinished && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 py-12"
        >
          <div className="mx-auto w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-50">
            <Trophy size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900">Topic Mastered!</h2>
            <p className="text-slate-500">You successfully finished the step-by-step challenge.</p>
          </div>
          <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-xs mx-auto">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Final Score</span>
            <span className="text-6xl font-black text-indigo-600">{score}</span>
            <span className="text-xs text-slate-400">Hints used: {hintsUsed}</span>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => startPractice(topic)}
              className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Another Question
            </button>
            <button
              onClick={() => setTopic(null)}
              className="px-10 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Back to Topics
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
