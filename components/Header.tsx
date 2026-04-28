
import React from 'react';
import { Sigma } from 'lucide-react';
import { UserStatus } from './UserStatus';

export const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => scrollToSection('hero')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sigma size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            MathVision<span className="text-indigo-600">AI</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <UserStatus />
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600 transition-colors">How it works</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600 transition-colors">Features</button>
          <button 
            onClick={() => window.dispatchEvent(new Event('show_help'))}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            Support
          </button>
        </div>
      </div>
    </div>
  </header>
  );
};
