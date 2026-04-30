
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MathSolution } from './components/MathSolution';
import { CameraInput } from './components/CameraInput';
import { PracticePanel } from './components/PracticePanel';
import { LearnPanel } from './components/LearnPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { Toast } from './components/Toast';
import { HelpModal } from './components/HelpModal';
import { ProcessingState, HistoryItem } from './types';
import { solveMathEquation, inferBestLearningTopic } from './geminiService';
import { saveToHistory } from './historyService';
import { updateGenericStats, incrementHelpOpened, incrementPhotoInputsUsed } from './userService';
import { checkAchievements } from './achievementService';
import { Loader2, Trash2, RefreshCw, Camera, AlertCircle, Sparkles, BookOpen, PenTool, Brain, GraduationCap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'solver' | 'practice' | 'learn' | 'history' | 'profile'>('solver');
  const [image, setImage] = useState<string | null>(null);

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  React.useEffect(() => {
    const handleXPNavigate = () => setMode('profile');
    const handleLearnTopic = (e: any) => {
      setPreLoadedLesson({ topic: e.detail });
      setMode('learn');
    };

    const handlePracticeTopic = (e: any) => {
      setPreLoadedPractice({ topic: e.detail });
      setPreLoadedLesson(null);
      setMode('practice');
    };
    
    window.addEventListener('navigate_profile', handleXPNavigate);
    window.addEventListener('learn_topic', handleLearnTopic);
    window.addEventListener('practice_topic', handlePracticeTopic);
    return () => {
      window.removeEventListener('navigate_profile', handleXPNavigate);
      window.removeEventListener('learn_topic', handleLearnTopic);
      window.removeEventListener('practice_topic', handlePracticeTopic);
    };
  }, []);
  const [textInput, setTextInput] = useState('');
  const [mimeType, setMimeType] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    result: null,
  });

  const [preLoadedPractice, setPreLoadedPractice] = useState<{ topic: string, data?: any } | null>(null);
  const [preLoadedLesson, setPreLoadedLesson] = useState<any>(null);
  const [recommendedLearnTopic, setRecommendedLearnTopic] = useState<string | null>(null);
  const [toast, setToast] = useState<{ achievement: any } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  React.useEffect(() => {
    const handleAchievement = (e: any) => {
      setToast({ achievement: e.detail });
      setTimeout(() => setToast(null), 5000);
    };
    const handleShowHelp = () => {
      incrementHelpOpened();
      checkAchievements();
      setShowHelp(true);
    };
    
    window.addEventListener('achievement_unlocked', handleAchievement);
    window.addEventListener('show_help', handleShowHelp);
    
    // Background sync on startup
    const syncAchievements = () => {
      console.log('Background Sync: Checking for missed achievements...');
      checkAchievements();
    };
    
    // Run after a short delay to not affect initial render performance
    const timer = setTimeout(syncAchievements, 2000);
    
    return () => {
      window.removeEventListener('achievement_unlocked', handleAchievement);
      window.removeEventListener('show_help', handleShowHelp);
      clearTimeout(timer);
    };
  }, []);

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.type === 'solution') {
      setState({ isProcessing: false, error: null, result: item.data });
      setMode('solver');
    } else if (item.type === 'practice') {
      setPreLoadedPractice({ topic: item.topic, data: item.data });
      setMode('practice');
    } else if (item.type === 'lesson') {
      // For lessons, check if the data contains checkpoint progress info
      setPreLoadedLesson(item.data);
      setMode('learn');
    }
  };

  const handleImageUpload = (base64: string, type: string) => {
    setImage(base64);
    setMimeType(type);
    setState({ isProcessing: false, error: null, result: null });
    incrementPhotoInputsUsed();
  };

  const clearInput = () => {
    setImage(null);
    setTextInput('');
    setMimeType('');
    setState({ isProcessing: false, error: null, result: null });
    setRecommendedLearnTopic(null);
  };

  const goToLearnTopic = (topic: string) => {
    window.dispatchEvent(new CustomEvent('learn_topic', { detail: topic }));
  };

  const handleSolve = async () => {
    if (!image && !textInput) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await solveMathEquation({ 
        image: image || undefined, 
        text: textInput || undefined, 
        mimeType: mimeType || undefined 
      });
      setState({ isProcessing: false, error: null, result });
      setRecommendedLearnTopic(inferBestLearningTopic(textInput || '', result));
      
      // Update stats and check achievements
      updateGenericStats({ totalQuestionsSolved: 1 });
      checkAchievements();
      
      // Save to history
      saveToHistory('solution', textInput || 'Visual Equation', result);
      // Scroll to result
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setState({ isProcessing: false, error: err.message, result: null });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Header />

      {/* Mode Switcher */}
      <div className="container mx-auto px-4 mt-8 flex justify-center overflow-x-auto no-scrollbar pb-2">
        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.5rem] flex gap-1 md:gap-2 whitespace-nowrap min-w-max transition-colors">
          <button
            onClick={() => {
              setMode('solver');
              setPreLoadedPractice(null);
              setPreLoadedLesson(null);
            }}
            className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-[1.25rem] text-xs md:text-sm font-black transition-all ${
              mode === 'solver' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-none' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <PenTool size={18} />
            Solver
          </button>
          <button
            onClick={() => {
              setMode('practice');
              setPreLoadedPractice(null);
              setPreLoadedLesson(null);
            }}
            className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-[1.25rem] text-xs md:text-sm font-black transition-all ${
              mode === 'practice' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-none' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Brain size={18} />
            Practice
          </button>
          <button
            onClick={() => {
              setMode('learn');
              setPreLoadedPractice(null);
              setPreLoadedLesson(null);
            }}
            className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-[1.25rem] text-xs md:text-sm font-black transition-all ${
              mode === 'learn' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-none' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap size={18} />
            Learn
          </button>
          <button
            onClick={() => {
              setMode('history');
              setPreLoadedPractice(null);
              setPreLoadedLesson(null);
            }}
            className={`flex items-center gap-2 px-5 md:px-8 py-3 rounded-[1.25rem] text-xs md:text-sm font-black transition-all ${
              mode === 'history' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100/50 dark:shadow-none' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock size={18} />
            History
          </button>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {mode === 'solver' && (
            <motion.div 
              key="solver"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              {!image && !state.result && !textInput && (
                <section id="hero" className="text-center space-y-4 py-12">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight"
                  >
                    Solve Math with <span className="text-indigo-600 dark:text-indigo-400">AI Precision</span>
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
                  >
                    Snap a photo or type in your equation. Get instant, step-by-step solutions in two modes: Easy for quick understanding or Essay for deep learning.
                  </motion.p>
                </section>
              )}

              {/* Input Section */}
              <section id="solve" className="flex flex-col items-center bg-slate-950/70 border border-slate-800 rounded-[3rem] p-8 shadow-2xl shadow-slate-950/40">
                {!image ? (
                  <div className="w-full max-w-3xl space-y-8 bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-950/20">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Type your question</label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="e.g. What is the derivative of x^2 + 5x?"
                        className="w-full h-36 px-8 py-6 bg-slate-950 border-2 border-slate-800 rounded-[2rem] focus:border-indigo-500 focus:ring-0 transition-all font-medium text-lg resize-none text-slate-100 placeholder:text-slate-500"
                      />
                      <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-400 mt-2">
                        <span className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">Handwritten math</span>
                        <span className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">Symbolic equations</span>
                        <span className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">Word problems + proofs</span>
                      </div>
                    </div>

                    {!textInput && (
                      <>
                        <div className="flex items-center gap-4 text-slate-400">
                          <div className="h-px flex-grow bg-slate-800"></div>
                          <span className="text-sm font-bold uppercase tracking-widest">or upload image</span>
                          <div className="h-px flex-grow bg-slate-800"></div>
                        </div>

                        <ImageUploader onUpload={handleImageUpload} />
                        
                        <div className="flex items-center gap-4 text-slate-400">
                          <div className="h-px flex-grow bg-slate-800"></div>
                          <span className="text-sm font-bold uppercase tracking-widest">or use camera</span>
                          <div className="h-px flex-grow bg-slate-800"></div>
                        </div>

                        <button
                          onClick={() => setShowCamera(true)}
                          className="w-full py-6 bg-slate-900 border-2 border-slate-800 rounded-3xl flex flex-col items-center gap-3 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group"
                        >
                          <div className="p-4 bg-slate-800 rounded-2xl text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <Camera size={32} />
                          </div>
                          <span className="font-bold text-slate-200">Open Camera</span>
                        </button>
                      </>
                    )}

                    {(textInput || image) && !state.result && (
                      <div className="flex flex-col items-center gap-4 pt-4">
                        <button
                          onClick={handleSolve}
                          disabled={state.isProcessing}
                          className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 dark:shadow-none hover:translate-y-[-4px] active:translate-y-[0px]"
                        >
                          {state.isProcessing ? (
                            <>
                              <Loader2 className="animate-spin" size={28} />
                              Thinking...
                            </>
                          ) : (
                            'Analyze & Solve'
                          )}
                        </button>
                        {textInput && (
                          <button onClick={clearInput} className="text-sm text-slate-400 hover:text-rose-500 font-bold transition-colors">
                            Clear and start over
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-lg space-y-6">
                    <motion.div 
                      layoutId="image-preview"
                      className="relative group rounded-[2.5rem] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/40"
                    >
                      <img 
                        src={image} 
                        alt="Uploaded math problem" 
                        className="w-full object-contain max-h-[400px]"
                      />
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button 
                          onClick={clearInput}
                          className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-red-500 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                          title="Remove image"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </motion.div>

                    {!state.result && (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={handleSolve}
                          disabled={state.isProcessing}
                          className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 dark:shadow-none hover:translate-y-[-4px] active:translate-y-[0px]"
                        >
                          {state.isProcessing ? (
                            <>
                              <Loader2 className="animate-spin" size={28} />
                              Analyzing Image...
                            </>
                          ) : (
                            'Solve Image'
                          )}
                        </button>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase px-2">Powered by Antigravity Math Core</p>
                      </div>
                    )}

                    {state.result && (
                       <div className="flex justify-center">
                        <button
                          onClick={clearInput}
                          className="flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full font-black transition-all text-sm shadow-sm"
                        >
                          <RefreshCw size={16} />
                          Solve Another Word Problem
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {state.error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto p-8 bg-slate-950/90 border border-red-900/30 text-red-200 rounded-[2rem] shadow-xl shadow-slate-950/40"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <AlertCircle className="shrink-0" size={24} />
                    <p className="font-black text-lg">Processing Error</p>
                  </div>
                  <p className="text-sm opacity-80 mb-6 leading-relaxed text-red-600 dark:text-red-400/80">{state.error}</p>
                  <button 
                    onClick={handleSolve}
                    className="w-full py-4 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 rounded-2xl text-sm font-black tracking-wide uppercase transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Result Section */}
              {state.result && (
                <div id="result-section">
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={clearInput}
                      className="text-sm text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300 font-bold transition-colors"
                    >
                      Reset solver
                    </button>
                  </div>
                  <MathSolution result={state.result} />
                  {recommendedLearnTopic && (
                    <div className="mt-8 p-6 rounded-[2rem] bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 shadow-2xl shadow-indigo-100/30 dark:shadow-none">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] font-black text-indigo-600 dark:text-indigo-400 mb-2">Keep learning</p>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Want a similar topic to practice?</h3>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">Start with a matching lesson in Learn, then complete a same-topic challenge when you finish.</p>
                        </div>
                        <button
                          onClick={() => goToLearnTopic(recommendedLearnTopic)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-indigo-600 text-white px-6 py-4 font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
                        >
                          Explore {recommendedLearnTopic}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!image && !state.result && !textInput && (
                <>
                  {/* Features Section */}
                  <section id="features" className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] py-12">
                    <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 shadow-2xl shadow-slate-950/30">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 text-indigo-200 text-xs font-black uppercase tracking-[0.3em]">AI-powered math</span>
                      <h2 className="mt-6 text-4xl font-black text-white tracking-tight">A solver built for learning, not just answers.</h2>
                      <p className="mt-5 text-slate-400 leading-8 max-w-2xl">MathVision blends instant problem solving with intuitive reasoning, walkthroughs, and follow-up guidance so every answer becomes a lesson.</p>
                      <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                          <h3 className="text-lg font-bold text-white">Step-by-step clarity</h3>
                          <p className="mt-3 text-slate-400 text-sm">See each step broken down in plain language so you can understand the how and why.</p>
                        </div>
                        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6">
                          <h3 className="text-lg font-bold text-white">Full notation support</h3>
                          <p className="mt-3 text-slate-400 text-sm">Works with handwritten math, LaTeX-style symbols, and English word problems.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-200 mb-4">
                          <Sparkles size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Instant support</h3>
                        <p className="mt-3 text-slate-400 text-sm">Get lightning-fast answers without losing the teaching moment.</p>
                      </div>
                      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-200 mb-4">
                          <BookOpen size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Learn by doing</h3>
                        <p className="mt-3 text-slate-400 text-sm">Practice with real examples and immediately understand why each method works.</p>
                      </div>
                      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-200 mb-4">
                          <Camera size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Multi-input workflow</h3>
                        <p className="mt-3 text-slate-400 text-sm">Type, snap, or upload — the solver adapts to your workflow and workflow preferences.</p>
                      </div>
                    </div>
                  </section>

                  <section id="how-it-works" className="py-12">
                    <div className="bg-slate-950 border border-slate-800 rounded-[3rem] p-12 shadow-2xl shadow-slate-950/30">
                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-200 mb-5">1</div>
                          <h3 className="text-xl font-bold text-white">Instant problem capture</h3>
                          <p className="mt-3 text-slate-400 text-sm">Upload images, paste screenshots, or type any equation and the model reads it instantly.</p>
                        </div>
                        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-200 mb-5">2</div>
                          <h3 className="text-xl font-bold text-white">AI-powered reasoning</h3>
                          <p className="mt-3 text-slate-400 text-sm">Every solution includes logical step progression so you learn instead of just copy answers.</p>
                        </div>
                        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600/10 text-amber-200 mb-5">3</div>
                          <h3 className="text-xl font-bold text-white">Review & improve</h3>
                          <p className="mt-3 text-slate-400 text-sm">Use follow-up prompts to ask “Why?”, “Explain again”, or “Show a simpler method.”</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}
          
          {mode === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PracticePanel initialData={preLoadedPractice ?? undefined} />
            </motion.div>
          )}

          {mode === 'learn' && (
             <motion.div
              key="learn"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LearnPanel
                initialData={preLoadedLesson}
                onChallenge={(topic) => {
                  setPreLoadedPractice({ topic });
                  setPreLoadedLesson(null);
                  setMode('practice');
                }}
              />
            </motion.div>
          )}

          {mode === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <HistoryPanel onSelectItem={handleSelectHistoryItem} />
            </motion.div>
          )}

          {mode === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProfilePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm transition-colors">
        <div className="flex justify-center gap-6 mb-6">
          <button onClick={() => setMode('solver')} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Solver</button>
          <button onClick={() => setShowHelp(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Support & Learn More</button>
        </div>
        <p className="font-medium">Simple solutions for complex problems. &copy; {new Date().getFullYear()} MathVision AI.</p>
      </footer>

      <AnimatePresence>
        {toast && (
          <Toast 
            achievement={toast.achievement} 
            onClose={() => setToast(null)} 
          />
        )}
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
        {showCamera && (
          <CameraInput 
            onCapture={handleImageUpload} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
