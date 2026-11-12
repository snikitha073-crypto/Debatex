import React from 'react';
import {
  MessageSquare,
  Play,
  Calendar,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { PastDebate } from '../../types/debate';

interface HistoryViewProps {
  debates: PastDebate[];
  onStartDebate: (characterId?: string) => void;
  onOpenTranscriptModal: (debate: PastDebate) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  debates,
  onStartDebate,
  onOpenTranscriptModal,
}) => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-[#17203d]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Debate History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View your completed debates and read past conversations.
          </p>
        </div>

        {debates.length > 0 && (
          <button
            onClick={() => onStartDebate()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>New Debate</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {debates.length === 0 ? (
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
              <circle cx="80" cy="80" r="64" stroke="#2b3b72" strokeWidth="1.5" strokeDasharray="4 6" />
              <ellipse cx="80" cy="120" rx="48" ry="12" fill="#131d42" stroke="#38bdf8" strokeWidth="1.5" />
              
              {/* Chat bubbles */}
              <rect x="32" y="44" width="46" height="32" rx="10" fill="#141c40" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="42" y1="56" x2="68" y2="56" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />
              <line x1="42" y1="64" x2="58" y2="64" stroke="#7dd3fc" strokeWidth="2" strokeLinecap="round" />

              <rect x="84" y="56" width="46" height="32" rx="10" fill="#1b173e" stroke="#c084fc" strokeWidth="1.5" />
              <line x1="94" y1="68" x2="120" y2="68" stroke="#e879f9" strokeWidth="2" strokeLinecap="round" />
              <line x1="94" y1="76" x2="110" y2="76" stroke="#e879f9" strokeWidth="2" strokeLinecap="round" />

              <circle cx="80" cy="98" r="3" fill="#38bdf8" />
            </svg>
          </div>

          {/* Exact required prompt message */}
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-white tracking-tight">
              No debates yet. Start your first debate!
            </h3>
            <p className="text-sm text-slate-400">
              When you finish a debate with an AI character, it will be saved here so you can read the conversation anytime.
            </p>
          </div>

          {/* Start First Debate CTA */}
          <div className="pt-2">
            <button
              onClick={() => onStartDebate()}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start a Debate</span>
            </button>
          </div>
        </div>
      ) : (
        /* Clean List of Completed Debates */
        <div className="space-y-4">
          {debates.map((debate) => (
            <div
              key={debate.id}
              className="rounded-2xl bg-[#090e21] border border-[#1b254a] hover:border-[#304179] p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                {/* 1. Topic */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {debate.topicTitle}
                </h3>

                {/* 2. Opponent Character, 3. Date, 4. Outcome */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Opponent */}
                  <div className="flex items-center gap-2">
                    <img
                      src={debate.characterAvatar}
                      alt={debate.characterName}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <span className="font-semibold text-slate-200">
                      {debate.characterName}
                    </span>
                  </div>

                  <span className="text-slate-600">·</span>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{debate.date}</span>
                  </div>

                  <span className="text-slate-600">·</span>

                  {/* Outcome */}
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                      debate.outcome === 'Won'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                        : debate.outcome === 'Draw'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                    }`}
                  >
                    Outcome: {debate.outcome}
                  </span>
                </div>

                {/* Short Summary */}
                {debate.summary && (
                  <p className="text-xs text-slate-300 bg-[#0e1633] rounded-xl p-3 border border-[#1c274d] leading-relaxed">
                    {debate.summary}
                  </p>
                )}
              </div>

              {/* View Conversation Button */}
              <div className="sm:self-center shrink-0">
                <button
                  onClick={() => onOpenTranscriptModal(debate)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#141d3d] hover:bg-[#1e2c5e] text-cyan-300 hover:text-white border border-[#2b3c75] hover:border-cyan-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>View Conversation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
