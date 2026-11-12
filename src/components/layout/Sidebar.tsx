import React from 'react';
import {
  Home,
  Swords,
  Bot,
  ListTodo,
  BarChart2,
  Clock,
  Settings,
  Star,
  Zap,
  ChevronRight,
  X,
  PlusCircle,
  User,
} from 'lucide-react';
import { UserStats } from '../../types/debate';
import { getUserAvatarUrl } from '../../data/userAvatars';

export type NavTab =
  | 'home'
  | 'arena'
  | 'custom'
  | 'characters'
  | 'topics'
  | 'profile'
  | 'progress'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userStats: UserStats;
  currentUser?: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userStats,
  currentUser,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'arena', label: 'Debate Arena', icon: Swords },
    { id: 'custom', label: 'Create Debate', icon: PlusCircle },
    { id: 'characters', label: 'AI Opponents', icon: Bot },
    { id: 'topics', label: 'Topics', icon: ListTodo },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'progress', label: 'Your Progress', icon: BarChart2 },
    { id: 'history', label: 'Debate History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#060913] border-r border-[#151c36] text-slate-300 p-4 select-none">
      <div>
        {/* Logo and Tagline */}
        <div className="flex items-center justify-between px-2 pt-2 pb-6">
          <div
            onClick={() => {
              onSelectTab('home');
              onCloseMobile();
            }}
            className="cursor-pointer group"
          >
            <div className="flex items-center">
              <span className="text-2xl font-black italic tracking-tight text-white">
                Debate
              </span>
              <span className="text-2xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                X
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide mt-0.5">
              Think. Challenge. Debate.
            </p>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6e3ff3] via-[#7c3aed] to-[#8b5cf6] text-white shadow-[0_0_25px_rgba(124,58,237,0.45)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar Cards */}
      <div className="space-y-3 pt-4">
        {/* Dynamic User Profile Card (Shows username immediately on change) */}
        {currentUser && (
          <div
            onClick={() => {
              onSelectTab('profile');
              onCloseMobile();
            }}
            className="rounded-2xl p-3 bg-[#0d142d] hover:bg-[#141f45] border border-[#202b54] hover:border-cyan-500/40 transition-all cursor-pointer flex items-center gap-2.5 group"
            title="View or Edit Your Profile"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-500/50 shrink-0 bg-slate-900 flex items-center justify-center">
              {getUserAvatarUrl(currentUser.avatar) ? (
                <img
                  src={getUserAvatarUrl(currentUser.avatar)}
                  alt={currentUser.displayName || 'User Profile'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-cyan-300 transition-colors">
                {currentUser.displayName || <span className="text-slate-400 font-normal italic">Set up profile</span>}
              </p>
              <p className="text-[11px] font-mono text-cyan-400 truncate leading-tight mt-0.5">
                {currentUser.username ? `@${currentUser.username}` : <span className="text-slate-500 italic">@username</span>}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        )}

        {/* Dynamic User Level Card */}
        <div
          onClick={() => {
            onSelectTab('progress');
            onCloseMobile();
          }}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-[#101830]/90 to-[#0c1224]/90 border border-[#202b54] hover:border-purple-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-white">Level {userStats.level}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span>{userStats.xp} XP</span>
            <span className="text-slate-500">{userStats.level * 200} XP</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#172140] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((userStats.xp / (userStats.level * 200)) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Keep debating motivation card */}
        <div className="rounded-2xl p-3.5 bg-gradient-to-r from-[#121935] to-[#0c1224] border border-[#1e294b] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200 leading-tight">
              {userStats.totalDebates === 0 ? 'Start your journey!' : 'Keep debating!'}
            </p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              {userStats.totalDebates === 0 ? 'Pick an opponent to begin' : "You're improving!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
