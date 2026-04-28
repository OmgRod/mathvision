
import React from 'react';
import { Sigma, Sun, Moon } from 'lucide-react';
import { UserStatus } from './UserStatus';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => scrollToSection('hero')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sigma size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            MathVision<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <UserStatus />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</button>
          <button 
            onClick={() => window.dispatchEvent(new Event('show_help'))}
            className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all"
          >
            Support
          </button>
        </div>
      </div>
    </div>
  </header>
  );
};
