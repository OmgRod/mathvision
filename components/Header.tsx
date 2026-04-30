
import React from 'react';
import { Sigma } from 'lucide-react';
import { UserStatus } from './UserStatus';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => scrollToSection('hero')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Sigma size={24} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            MathVision<span className="text-indigo-400">AI</span>
          </h1>
        </div>

      <div className="flex items-center gap-4">
        <UserStatus />
      </div>
    </div>
  </header>
  );
};
