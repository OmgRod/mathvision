import React, { useState, useMemo, useEffect } from 'react';
import { PRACTICE_TOPICS } from '../constants';
import { Lesson, LessonSection, LessonQuestion, QuizFeedback } from '../types';
import { generateLesson, askLessonClarification, evaluateLessonAnswer } from '../geminiService';
import { 
  ArrowLeft, Search, GraduationCap, ChevronRight, ChevronLeft, 
  MessageCircle, Send, Loader2, BookOpen, CheckCircle2, AlertCircle, 
  Lightbulb, RefreshCcw, Volume2, Sparkles, PenTool
} from 'lucide-react';
import { TTSButton } from './TTSButton';
import { MathKeyboard } from './MathKeyboard';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export const LearnPanel: React.FC = () => {
  const [topic, setTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const levels = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.map(t => t.level)))], []);
  const categories = useMemo<string[]>(() => ['All', ...Array.from(new Set(PRACTICE_TOPICS.map(t => t.category)))], []);

  const filteredTopics = useMemo(() => {
    return PRACTICE_TOPICS.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || t.level === selectedLevel;
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [searchTerm, selectedLevel, selectedCategory]);

  const startLesson = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setLesson(null);
    setCurrentSectionIndex(0);
    setChatHistory([]);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const l = await generateLesson(selectedTopic);
      setLesson(l);
    } catch (err) {
      console.error(err);
      alert("Failed to load lesson. Please try again.");
      setTopic(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTopics = () => {
    setTopic(null);
    setLesson(null);
    setChatHistory([]);
    setCurrentSectionIndex(0);
    setShowCheckpoint(false);
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

  const nextCheckpoint = () => {
    if (!lesson) return;
    if (currentCheckpointIndex < lesson.checkpoints.length - 1) {
      setCurrentCheckpointIndex(prev => prev + 1);
      setUserAnswer('');
      setCheckpointFeedback(null);
    } else {
      // Completed all checkpoints
      alert("Lesson completed! Great job.");
      handleBackToTopics();
    }
  };

  if (!topic) {
    return (
      <div className="space-y-12 py-10 px-4 max-w-5xl mx-auto pb-40">
        <header className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-black text-sm uppercase tracking-widest">
            <GraduationCap size={16} />
            Study Hall
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">Interactive <span className="text-indigo-600">Learning</span></h2>
          <p className="text-lg text-slate-500 font-medium">Choose a topic to start a personalized AI-guided lesson. Learn at your own pace with interactive examples and checkpoints.</p>
        </header>

        <div className="space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-indigo-100/30">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics (e.g., Quadratic Equations, Calculus)..."
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-indigo-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-lg font-black text-indigo-900 mb-1 uppercase tracking-tight">Something else?</h4>
              <p className="text-sm text-indigo-600/70 font-medium italic">Type any math topic and I'll create a custom lesson for you.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. History of Zero..."
                className="flex-grow px-6 py-4 bg-white border-2 border-indigo-200 rounded-2xl focus:border-indigo-600 transition-all font-bold text-slate-900"
              />
              <button
                onClick={() => startLesson(customTopic)}
                disabled={!customTopic.trim()}
                className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400"
              >
                Go
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Level</span>
              <div className="flex flex-wrap gap-2">
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                      selectedLevel === level ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTopics.map((t, idx) => (
                <motion.button
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => startLesson(t.name)}
                  className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 transition-all transform hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-indigo-600 transition-colors"></div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{t.level}</span>
                    <ChevronRight className="text-slate-200 group-hover:text-indigo-600" size={20} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{t.name}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.description}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  function Diagram({ svg }: { svg?: string }) {
    if (!svg) return null;
    return (
      <div 
        className="my-8 p-6 bg-white rounded-[2rem] border border-slate-100 flex justify-center overflow-auto shadow-sm"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={handleBackToTopics}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Topics
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-600" size={64} />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap size={24} className="text-indigo-400" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Preparing Lesson...</h3>
            <p className="text-slate-500 font-medium">AI Tutor is gathering materials for <span className="text-indigo-600 font-bold">{topic}</span></p>
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
                  className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-indigo-100/50"
                >
                  <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
                        {currentSectionIndex + 1}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {lesson.sections[currentSectionIndex].title}
                      </h3>
                    </div>
                    <TTSButton text={`${lesson.sections[currentSectionIndex].title}. ${lesson.sections[currentSectionIndex].content}`} />
                  </div>

                  <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-p:leading-relaxed prose-headings:font-black prose-strong:text-indigo-600">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {lesson.sections[currentSectionIndex].content}
                    </ReactMarkdown>
                  </div>

                  <Diagram svg={lesson.sections[currentSectionIndex].diagramSvg} />

                  <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={nextSection}
                      className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:translate-x-1"
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
                  className="bg-indigo-600 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   
                   <div className="relative z-10 space-y-8">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={32} className="text-indigo-200" />
                          <h3 className="text-2xl font-black uppercase tracking-tight">Checkpoint {currentCheckpointIndex + 1}</h3>
                        </div>
                        <TTSButton text={lesson.checkpoints[currentCheckpointIndex].question} className="bg-white/10 text-white hover:bg-white/20" />
                      </div>

                      <div className="p-8 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20">
                        <div className="text-xl font-medium leading-relaxed prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {lesson.checkpoints[currentCheckpointIndex].question}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {!checkpointFeedback ? (
                        <div className="space-y-4 relative">
                          <MathKeyboard 
                            isOpen={isKeyboardOpen}
                            onClose={() => setIsKeyboardOpen(false)}
                            onInsert={(sym) => {
                              setUserAnswer(prev => prev + sym);
                            }}
                          />
                          <div className="relative">
                            <input 
                              type="text"
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              placeholder="Your answer..."
                              className="w-full pl-8 pr-14 py-5 bg-white text-slate-900 border-2 border-white/20 rounded-[2rem] focus:border-white focus:ring-0 transition-all font-bold text-lg"
                            />
                            <button
                              onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-600 bg-indigo-50 rounded-xl transition-colors"
                              title="Math Keyboard"
                            >
                              <PenTool size={20} />
                            </button>
                          </div>
                          <button
                            onClick={handleCheckpointSubmit}
                            disabled={!userAnswer.trim() || isEvaluating}
                            className="w-full py-5 bg-white text-indigo-600 font-black text-xl rounded-[2rem] hover:bg-indigo-50 transition-all shadow-xl flex items-center justify-center gap-3"
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
                          className={`p-8 rounded-[2rem] border ${
                            checkpointFeedback.isCorrect ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              {checkpointFeedback.isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                              <span className="font-black uppercase tracking-widest">{checkpointFeedback.isCorrect ? 'Correct!' : 'Almost there!'}</span>
                            </div>
                            <TTSButton text={checkpointFeedback.message} className="bg-white/10 text-white hover:bg-white/20" size={14} />
                          </div>
                          
                          <div className="font-medium mb-6 leading-relaxed prose prose-invert prose-p:my-0">
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                              {checkpointFeedback.message}
                            </ReactMarkdown>
                          </div>
                          
                          {checkpointFeedback.improvement && (
                            <div className="mb-8 p-4 bg-black/20 rounded-xl border border-white/10 text-xs font-bold flex gap-3 italic">
                              <Lightbulb size={16} className="text-indigo-300 shrink-0" />
                              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {checkpointFeedback.improvement}
                              </ReactMarkdown>
                            </div>
                          )}

                          <button
                            onClick={checkpointFeedback.isCorrect ? nextCheckpoint : () => setCheckpointFeedback(null)}
                            className="w-full py-4 bg-white text-slate-800 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-lg"
                          >
                            {checkpointFeedback.isCorrect ? (currentCheckpointIndex === lesson.checkpoints.length - 1 ? 'Complete Lesson' : 'Next Checkpoint') : 'Try Again'}
                          </button>
                        </motion.div>
                      )}

                      <button 
                        onClick={() => setShowCheckpoint(false)}
                        className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors text-sm font-bold"
                      >
                        <RefreshCcw size={16} />
                        Review Lesson Content
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Tutor Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
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

              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Progress</h4>
                  <p className="text-lg font-black text-emerald-600">
                    {Math.round(((currentSectionIndex + (showCheckpoint ? 1 : 0)) / (lesson.sections.length + 1)) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
