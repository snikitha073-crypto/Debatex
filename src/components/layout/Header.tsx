import React from 'react';
import { Menu, Zap, User } from 'lucide-react';
import { NavTab } from './Sidebar';
import { getUserAvatarUrl } from '../../data/userAvatars';

interface HeaderProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onStartDebate: () => void;
  level: number;
  debatesCount: number;
  userAvatar?: string | null;
  userName?: string;
  userHandle?: string;
  onNavigateToProfile: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  home: {
    title: 'Command Center',
    subtitle: 'DebateX Dialectic Arena',
  },
  arena: {
    title: 'Debate Arena',
    subtitle: 'Live Interactive Dialectical Ring',
  },
  custom: {
    title: 'Create Your Own Debate',
    subtitle: 'Custom Motion Studio',
  },
  characters: {
    title: 'AI Opponents',
    subtitle: 'Distinct Cognitive Archetypes',
  },
  topics: {
    title: 'Debate Topics',
    subtitle: 'Relatable Everyday Debates',
  },
  profile: {
    title: 'Debater Profile',
    subtitle: 'Your Account & Achievements',
  },
  progress: {
    title: 'Your Progress',
    subtitle: 'Real Debate Statistics',
  },
  history: {
    title: 'Debate History',
    subtitle: 'Completed Sessions',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Debate Preferences & Profile',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onStartDebate,
  level,
  debatesCount,
  userAvatar,
  userName,
  userHandle,
  onNavigateToProfile,
}) => {
  const currentInfo = TAB_TITLES[currentTab];

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#060913]/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between border-b border-[#141b36]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
            {currentInfo.title}
          </h1>
          <span className="hidden sm:inline-block text-slate-600">/</span>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
            {currentInfo.subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1226] border border-[#1e2a52] text-xs">
          <span className="text-slate-400 font-medium">Level {level}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono font-bold text-cyan-400 tabular-nums">
            {debatesCount} {debatesCount === 1 ? 'Debate' : 'Debates'}
          </span>
        </div>

        {/* Start Debate CTA */}
        <button
          onClick={onStartDebate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Start Debate</span>
        </button>

        {/* Top-Right Profile Pill with updated username & avatar */}
        <div
          onClick={onNavigateToProfile}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#0c1226] border border-[#1e2a52] hover:border-cyan-400/80 transition-all cursor-pointer group"
          title="Account & Profile Settings"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8b5cf6] via-[#6366f1] to-[#06b6d4] p-[1.5px] shrink-0 shadow-sm">
            <div className="w-full h-full rounded-full bg-[#0a0e20] overflow-hidden flex items-center justify-center">
              {getUserAvatarUrl(userAvatar) ? (
                <img
                  src={getUserAvatarUrl(userAvatar)}
                  alt="User Profile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1 min-w-0">
            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-none truncate max-w-[120px]">
              {userName || <span className="text-slate-400 font-normal italic">Add Name</span>}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 leading-none mt-0.5 truncate max-w-[120px]">
              {userHandle ? `@${userHandle}` : <span className="text-slate-500 italic">@username</span>}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
