import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 md:px-8 border-t border-[#141b36] bg-[#050811]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">Debate<span className="text-cyan-400">X</span></span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">Interactive AI Debate Arena</span>
        </div>

        {/* Creator Credit: Made by Snikitha */}
        <div className="text-[11px] font-medium tracking-wide flex items-center gap-1.5 text-slate-400">
          <span>Made by</span>
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] via-[#a855f7] to-[#38bdf8] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            Snikitha
          </span>
        </div>
      </div>
    </footer>
  );
};
