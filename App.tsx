
import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MathSolution } from './components/MathSolution';
import { CameraInput } from './components/CameraInput';
import { PracticePanel } from './components/PracticePanel';
import { ProcessingState } from './types';
import { solveMathEquation } from './geminiService';
import { Loader2, Trash2, RefreshCw, Camera, AlertCircle, Sparkles, BookOpen, PenTool, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [mode, setMode] = useState<'solver' | 'practice'>('solver');
  const [image, setImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [mimeType, setMimeType] = useState<string>('');
  const [showCamera, setShowCamera] = useState(false);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    result: null,
  });

  const handleImageUpload = (base64: string, type: string) => {
    setImage(base64);
    setMimeType(type);
    setState({ isProcessing: false, error: null, result: null });
  };

  const clearInput = () => {
    setImage(null);
    setTextInput('');
    setMimeType('');
    setState({ isProcessing: false, error: null, result: null });
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
    <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
      <Header />

      {/* Mode Switcher */}
      <div className="container mx-auto px-4 mt-8 flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-[1.5rem] flex gap-2">
          <button
            onClick={() => setMode('solver')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.25rem] text-sm font-black transition-all ${
              mode === 'solver' 
                ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PenTool size={18} />
            Solver
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`flex items-center gap-2 px-8 py-3 rounded-[1.25rem] text-sm font-black transition-all ${
              mode === 'practice' 
                ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Brain size={18} />
            Practice
          </button>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {mode === 'solver' ? (
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
                    className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight"
                  >
                    Solve Math with <span className="text-indigo-600">AI Precision</span>
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-500 max-w-2xl mx-auto"
                  >
                    Snap a photo or type in your equation. Get instant, step-by-step solutions in two modes: Easy for quick understanding or Essay for deep learning.
                  </motion.p>
                </section>
              )}

              {/* Input Section */}
              <section id="solve" className="flex flex-col items-center">
                {!image ? (
                  <div className="w-full max-w-2xl space-y-8">
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Type your question</label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="e.g. What is the derivative of x^2 + 5x?"
                        className="w-full h-32 px-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:ring-0 transition-all font-medium text-lg resize-none shadow-sm"
                      />
                    </div>

                    {!textInput && (
                      <>
                        <div className="flex items-center gap-4 text-slate-300">
                          <div className="h-px flex-grow bg-slate-200"></div>
                          <span className="text-sm font-bold uppercase tracking-widest">or upload image</span>
                          <div className="h-px flex-grow bg-slate-200"></div>
                        </div>

                        <ImageUploader onUpload={handleImageUpload} />
                        
                        <div className="flex items-center gap-4 text-slate-300">
                          <div className="h-px flex-grow bg-slate-200"></div>
                          <span className="text-sm font-bold uppercase tracking-widest">or use camera</span>
                          <div className="h-px flex-grow bg-slate-200"></div>
                        </div>

                        <button
                          onClick={() => setShowCamera(true)}
                          className="w-full py-6 bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center gap-3 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
                        >
                          <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <Camera size={32} />
                          </div>
                          <span className="font-bold text-slate-700">Open Camera</span>
                        </button>
                      </>
                    )}

                    {(textInput || image) && !state.result && (
                      <div className="flex flex-col items-center gap-4 pt-4">
                        <button
                          onClick={handleSolve}
                          disabled={state.isProcessing}
                          className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 hover:translate-y-[-4px] active:translate-y-[0px]"
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
                      className="relative group rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-200"
                    >
                      <img 
                        src={image} 
                        alt="Uploaded math problem" 
                        className="w-full object-contain max-h-[400px]"
                      />
                      <div className="absolute top-6 right-6 flex gap-2">
                        <button 
                          onClick={clearInput}
                          className="p-3 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
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
                          className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 hover:translate-y-[-4px] active:translate-y-[0px]"
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
                          className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-full font-black transition-all text-sm shadow-sm"
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
                  className="max-w-2xl mx-auto p-8 bg-red-50 border border-red-100 text-red-700 rounded-[2rem] shadow-xl shadow-red-50"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <AlertCircle className="shrink-0" size={24} />
                    <p className="font-black text-lg">Processing Error</p>
                  </div>
                  <p className="text-sm opacity-80 mb-6 leading-relaxed">{state.error}</p>
                  <button 
                    onClick={handleSolve}
                    className="w-full py-4 bg-red-100 hover:bg-red-200 rounded-2xl text-sm font-black tracking-wide uppercase transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Result Section */}
              {state.result && (
                <div id="result-section">
                  <MathSolution result={state.result} />
                </div>
              )}

              {!image && !state.result && !textInput && (
                <>
                  {/* Features Section */}
                  <section id="features" className="grid md:grid-cols-3 gap-6 py-12">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <Camera size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Capture</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Use your camera or upload images. Our AI recognizes handwriting and complex symbols instantly.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <Sparkles size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Dual Modes</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Choose between "Easy Mode" for quick card-based steps or "Essay Mode" for detailed mathematical proofs.</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Word Questions</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Type your math questions or describe problems. Our AI understands plain language and solves it.</p>
                    </div>
                  </section>

                  {/* How it works Section */}
                  <section id="how-it-works" className="py-12 bg-indigo-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 max-w-2xl">
                      <h2 className="text-3xl font-black mb-6 tracking-tight">Master Math Step-by-Step</h2>
                      <div className="space-y-8">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black shrink-0">1</div>
                          <p className="text-indigo-100 font-medium">Input your problem via photo, camera, or text box.</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black shrink-0">2</div>
                          <p className="text-indigo-100 font-medium">Our advanced AI model analyzes the logic and builds a calculation path.</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black shrink-0">3</div>
                          <p className="text-indigo-100 font-medium">Navigate through the steps interactively and verify your understanding.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PracticePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <div className="flex justify-center gap-6 mb-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-indigo-600 font-medium">Home</button>
          <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 font-medium">Features</button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-indigo-600 font-medium">How it works</button>
          <a href="mailto:support@mathvision.ai" className="hover:text-indigo-600 font-medium">Contact</a>
        </div>
        <p className="font-medium">Simple solutions for complex problems. &copy; {new Date().getFullYear()} MathVision AI.</p>
      </footer>

      <AnimatePresence>
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
