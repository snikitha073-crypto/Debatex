import React from 'react';
import {
  Trophy,
  Play,
  Compass,
  Bot,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserStats } from '../../types/debate';

interface ProgressViewProps {
  userStats: UserStats;
  onStartDebate: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userStats,
  onStartDebate,
}) => {
  const hasActivity = userStats.totalDebates > 0;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#17203d]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Your Progress
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track the debates you have finished and the topics you have explored.
          </p>
        </div>

        {hasActivity && (
          <button
            onClick={onStartDebate}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Debate Again</span>
          </button>
        )}
      </div>

      {!hasActivity ? (
        /* Empty State */
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-8 sm:p-14 text-center flex flex-col items-center justify-center space-y-6">
          {/* Custom Illustration */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-cyan-400/20 rounded-full blur-2xl" />

            <svg
              viewBox="0 0 160 160"
              className="w-full h-full relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer ring */}
              <circle
                cx="80"
                cy="80"
                r="64"
                stroke="#2b3b72"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />

              {/* Glowing base */}
              <ellipse cx="80" cy="120" rx="48" ry="12" fill="#131d42" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Trophy silhouette */}
              <path
                d="M 64 50 L 96 50 L 96 70 C 96 82 88 88 80 88 C 72 88 64 82 64 70 Z"
                fill="#1b2554"
                stroke="#a855f7"
                strokeWidth="2"
              />
              <path
                d="M 64 56 C 54 56 50 64 54 74 C 57 80 64 80 64 80"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 96 56 C 106 56 110 64 106 74 C 103 80 96 80 96 80"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="76" y="88" width="8" height="18" fill="#a855f7" />
              <rect x="68" y="106" width="24" height="6" rx="2" fill="#38bdf8" />

              {/* Sparkles */}
              <circle cx="80" cy="40" r="3" fill="#38bdf8" />
              <circle cx="112" cy="50" r="2" fill="#c084fc" />
              <circle cx="48" cy="90" r="2" fill="#38bdf8" />
            </svg>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Your debate journey starts here!
            </h3>
            <p className="text-sm text-slate-400">
              Start your first friendly debate with any AI character to see your progress, topics explored, and achievements.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onStartDebate}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start Your First Debate</span>
            </button>
          </div>
        </div>
      ) : (
        /* Real User Stats (Only real data) */
        <div className="space-y-6">
          {/* 4 Core Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Debates Completed */}
            <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-mono">
                  {userStats.totalDebates}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Total Debates Completed
                </p>
              </div>
            </div>

            {/* 2. Topics Explored */}
            <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-mono">
                  {userStats.topicsExplored.length}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Topics Explored
                </p>
              </div>
            </div>

            {/* 3. Favourite AI Opponent */}
            <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-bold text-white truncate mt-1">
                  {userStats.favoriteOpponent || 'None yet'}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Favourite AI Opponent
                </p>
              </div>
            </div>

            {/* 4. Recent Achievements Count */}
            <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white font-mono">
                  {userStats.achievements.length}
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Achievements Earned
                </p>
              </div>
            </div>
          </div>

          {/* Topics Explored List */}
          <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Topics You Have Explored</span>
            </h3>

            {userStats.topicsExplored.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {userStats.topicsExplored.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#0e1633] text-cyan-300 border border-[#22305e] text-xs font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{topic}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                You haven't debated any topics yet.
              </p>
            )}
          </div>

          {/* Recent Achievements Section */}
          <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Recent Achievements</span>
            </h3>

            {userStats.achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userStats.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="rounded-2xl p-4 bg-[#0e1633] border border-[#22305e] flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
                        Unlocked: {ach.unlockedAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#1c274d] text-center text-xs text-slate-400">
                Complete debates to unlock achievements like "First Debate", "Curious Explorer", and more!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
