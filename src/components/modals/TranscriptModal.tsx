import React from 'react';
import { X, MessageSquare, Play, Calendar, Volume2, Pause, Square } from 'lucide-react';
import { PastDebate } from '../../types/debate';
import { useDebateSpeech } from '../../hooks/useDebateSpeech';

interface TranscriptModalProps {
  debate: PastDebate | null;
  onClose: () => void;
  onRematch: (characterId: string) => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  debate,
  onClose,
  onRematch,
}) => {
  const speech = useDebateSpeech();

  if (!debate) return null;

  const handleClose = () => {
    speech.stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090f24] border border-[#232e56] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1a254a]">
          <div className="flex items-center gap-3">
            <img
              src={debate.characterAvatar}
              alt={debate.characterName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-purple-400">{debate.category || 'Debate'}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {debate.date}
                </span>
                <span className="text-slate-600">·</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  {debate.outcome}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug mt-0.5">
                {debate.topicTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Short Summary Callout */}
        {debate.summary && (
          <div className="p-3.5 rounded-2xl bg-[#0e1633] border border-[#22305e] text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300 block mb-0.5">Debate Summary:</span>
            <p>{debate.summary}</p>
          </div>
        )}

        {/* Conversation Dialogue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Conversation Transcript
            </span>
            {speech.isPlaying && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan-400 font-mono text-[11px] animate-pulse">Playing voice...</span>
                <button
                  type="button"
                  onClick={speech.stop}
                  className="px-2 py-0.5 rounded-md bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px] cursor-pointer"
                >
                  Stop
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {debate.messages && debate.messages.length > 0 ? (
              debate.messages.map((msg) => {
                if (msg.sender === 'moderator') {
                  return (
                    <div
                      key={msg.id}
                      className="p-3 rounded-2xl bg-[#0e1633]/60 border border-[#1d2950] text-center text-xs text-slate-400"
                    >
                      {msg.text}
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';
                const isSpeakingThis = speech.activeMessageId === msg.id && speech.isPlaying;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <span className="text-[10px] text-slate-400 px-1 font-medium">
                      {isUser ? `You (${debate.userStance || 'Your Side'})` : debate.characterName}
                    </span>

                    <div
                      className={`max-w-lg rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 text-white'
                          : isSpeakingThis
                          ? 'bg-[#0e1633] border border-cyan-400 text-slate-100'
                          : 'bg-[#0e1633] border border-[#22305e] text-slate-200'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {!isUser && (
                        <div className="mt-2 pt-1.5 border-t border-[#1b254a] flex items-center justify-end">
                          {isSpeakingThis ? (
                            <button
                              type="button"
                              onClick={speech.stop}
                              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Square className="w-2.5 h-2.5 fill-rose-400" />
                              <span>Stop Audio</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                speech.play(
                                  msg.text,
                                  msg.id,
                                  debate.characterName,
                                  debate.characterId
                                )
                              }
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 className="w-3 h-3" />
                              <span>Read Aloud</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">
                Full speech transcript not available for this session.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1a254a]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              handleClose();
              onRematch(debate.characterId);
            }}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Debate {debate.characterName} Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
