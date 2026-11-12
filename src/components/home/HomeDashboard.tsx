import React from 'react';
import {
  Play,
  ArrowRight,
  Sparkles,
  Flame,
  BarChart2,
  Trophy,
  Star,
  BookOpen,
  Laptop,
  Heart,
  Utensils,
  Leaf,
  Atom,
  Cpu,
  Scale,
  Palette,
  Microscope,
  CheckCircle2,
} from 'lucide-react';
import { Character, Topic, UserStats } from '../../types/debate';

interface HomeDashboardProps {
  characters: Character[];
  topics: Topic[];
  userStats: UserStats;
  onStartDebate: (characterId?: string, topicId?: string) => void;
  onNavigateToTab: (tab: any) => void;
  onSelectCharacterDetail: (character: Character) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  characters,
  topics,
  userStats,
  onStartDebate,
  onNavigateToTab,
  onSelectCharacterDetail,
}) => {
  const getIconForCharacter = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-4 h-4 text-blue-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-emerald-400" />;
      case 'Palette':
        return <Palette className="w-4 h-4 text-fuchsia-400" />;
      case 'Microscope':
        return <Microscope className="w-4 h-4 text-cyan-400" />;
      default:
        return <Atom className="w-4 h-4 text-indigo-400" />;
    }
  };

  // Trending relatable topics
  const trendingTopics = [
    {
      id: 'books-vs-tablets',
      title: 'Books vs Tablets',
      question: 'Which is better for learning?',
      icon: <BookOpen className="w-4 h-4 text-purple-400" />,
      bg: 'bg-purple-500/15',
    },
    {
      id: 'homework-necessary-or-not',
      title: 'Homework',
      question: 'Is it necessary or not?',
      icon: <Laptop className="w-4 h-4 text-cyan-400" />,
      bg: 'bg-cyan-500/15',
    },
    {
      id: 'ai-vs-human-creativity',
      title: 'AI vs Creativity',
      question: 'Can machines create true art?',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      bg: 'bg-indigo-500/15',
    },
  ];

  const hasDebated = userStats.totalDebates > 0;
  const winRatePercent = hasDebated
    ? Math.round((userStats.wins / userStats.totalDebates) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* ================= HERO BANNER ================= */}
      <section className="relative overflow-hidden rounded-3xl border border-[#232d56] bg-[#070b18] shadow-[0_0_40px_rgba(13,18,38,0.8)]">
        {/* Background Arena Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/debate_arena_hero_1794295888810.jpg"
            alt="DebateX Holographic Arena"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060914] via-[#060914]/85 to-[#060914]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060914] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12 flex flex-col justify-between min-h-[310px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left text */}
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight text-white leading-tight">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e879f9] via-[#c084fc] to-[#38bdf8]">
                  DebateX
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base font-normal tracking-wide">
                Think deeper. Speak stronger. Win with logic.
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onStartDebate()}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Start a Debate</span>
                </button>

                <button
                  onClick={() => onNavigateToTab('topics')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#0d152d]/90 hover:bg-[#152147] text-slate-200 border border-[#2b396b] hover:border-cyan-400 font-semibold text-sm transition-all cursor-pointer"
                >
                  <span>Explore Topics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right quote callout */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="relative rounded-2xl p-4 sm:p-5 bg-[#090f24]/80 backdrop-blur-md border border-[#263566]/80 text-xs text-slate-300 max-w-xs shadow-lg">
                <Sparkles className="w-4 h-4 text-cyan-400 absolute top-3 right-3 animate-pulse" />
                <p className="leading-relaxed font-normal pr-4">
                  "A platform where ideas clash, and better arguments rise."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CHOOSE YOUR OPPONENT ================= */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Choose Your Opponent
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pick an AI character with a unique perspective...
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('characters')}
            className="text-xs font-semibold text-purple-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* All 6 Illustrated AI Character Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {characters.map((char) => (
            <div
              key={char.id}
              onClick={() => {
                onSelectCharacterDetail(char);
                onStartDebate(char.id);
              }}
              className="group relative rounded-2xl overflow-hidden bg-[#0c1228] border border-[#1e2a52] hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Character Avatar */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-900">
                <img
                  src={char.avatarUrl}
                  alt={char.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1228] via-[#0c1228]/40 to-transparent" />
              </div>

              {/* Character Details */}
              <div className="p-3 pt-0 -mt-5 relative z-10 space-y-1">
                <div className="w-6 h-6 rounded-lg bg-[#141d3d] border border-[#2b3a6e] flex items-center justify-center mb-1.5 shadow-md">
                  {getIconForCharacter(char.iconName)}
                </div>

                <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                  {char.name}
                </h3>

                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {char.motto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM ROW: TRENDING TOPICS & REAL STATS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Everyday Trending Topics */}
        <section className="lg:col-span-7 rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                <Flame className="w-4 h-4 fill-rose-400 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Trending Topics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Explore popular debate topics...
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('topics')}
              className="text-xs font-semibold text-purple-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3 Relatable Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => onStartDebate(undefined, topic.id)}
                className="rounded-2xl p-3.5 bg-[#0e1633] border border-[#22305e] hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className={`w-7 h-7 rounded-xl ${topic.bg} flex items-center justify-center mb-2.5`}>
                  {topic.icon}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white leading-tight">
                    {topic.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {topic.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: REAL Debate Stats (Never fake) */}
        <section className="lg:col-span-5 rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Your Debate Stats
              </h3>
              <p className="text-[11px] text-slate-400">
                {hasDebated
                  ? 'Track your real progress as you debate!'
                  : 'Your stats will update as you complete debates.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {/* Real KPI Blocks */}
            <div className="grid grid-cols-3 gap-2.5 flex-1">
              {/* Total Debates */}
              <div className="rounded-2xl p-3 bg-[#0e1633] border border-[#22305e] flex items-center gap-2">
                <div className="text-amber-400 shrink-0">
                  <Trophy className="w-5 h-5 fill-amber-400/20 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold font-mono text-white leading-none">
                    {userStats.totalDebates}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Debates
                  </p>
                </div>
              </div>

              {/* Win Rate */}
              <div className="rounded-2xl p-3 bg-[#0e1633] border border-[#22305e] flex items-center gap-2">
                <div className="text-amber-400 shrink-0">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold font-mono text-white leading-none">
                    {hasDebated ? `${winRatePercent}%` : '0%'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Win Rate
                  </p>
                </div>
              </div>

              {/* Level */}
              <div className="rounded-2xl p-3 bg-[#0e1633] border border-[#22305e] flex items-center gap-2">
                <div className="text-cyan-400 shrink-0">
                  <BarChart2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold font-mono text-white leading-none">
                    Level {userStats.level}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {hasDebated ? 'Debate Explorer' : 'Beginner'}
                  </p>
                </div>
              </div>
            </div>

            {/* Glowing trend vector */}
            <div className="relative w-14 h-10 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 60 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M 5 32 Q 22 30, 32 18 T 55 8"
                  fill="none"
                  stroke="url(#purpleGlow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <polyline
                  points="47,8 55,8 55,16"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
