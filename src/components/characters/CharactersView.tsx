import React, { useState } from 'react';
import {
  Volume2,
  Swords,
  ChevronRight,
  Brain,
  Shield,
  Zap,
  Target,
  Sparkles,
  X,
  Atom,
  Flame,
  Cpu,
  Scale,
  Palette,
  Microscope,
  CheckCircle2,
  Pause,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react';
import { Character } from '../../types/debate';
import { useDebateSpeech } from '../../hooks/useDebateSpeech';

interface CharactersViewProps {
  characters: Character[];
  selectedCharacterId?: string;
  onSelectCharacter: (character: Character) => void;
  onStartDebate: (characterId: string) => void;
}

export const CharactersView: React.FC<CharactersViewProps> = ({
  characters,
  selectedCharacterId,
  onSelectCharacter,
  onStartDebate,
}) => {
  const [activeDetailModal, setActiveDetailModal] = useState<Character | null>(null);
  const speech = useDebateSpeech();

  const handleVoiceToggle = (char: Character) => {
    if (speech.activeMessageId === char.id && speech.isPlaying) {
      if (speech.isPaused) {
        speech.resume();
      } else {
        speech.pause();
      }
    } else {
      speech.play(
        `Greetings. I am ${char.name}. My core motto is: "${char.motto}". ${char.signatureQuote}`,
        char.id,
        char.name,
        char.id
      );
    }
  };

  const getIconForCharacter = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-blue-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-emerald-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-fuchsia-400" />;
      case 'Microscope':
        return <Microscope className="w-5 h-5 text-cyan-400" />;
      default:
        return <Brain className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          AI Debate Characters
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Meet your 6 distinct AI debate opponents. Each character has their own personality, specialized expertise, and voice tone.
        </p>
      </div>

      {/* Global Error Banner */}
      {speech.errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{speech.errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={speech.clearError}
            className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => {
          const isSelected = selectedCharacterId === char.id;
          const isThisCharSpeaking = speech.activeMessageId === char.id && speech.isPlaying;

          return (
            <div
              key={char.id}
              className={`group relative rounded-3xl bg-[#090e21] overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
                  : 'border-[#1b254a] hover:border-[#32437e] hover:shadow-lg'
              }`}
            >
              {/* Image & Header */}
              <div className="relative">
                <div className="aspect-[16/11] w-full overflow-hidden bg-slate-900">
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e21] via-[#090e21]/40 to-transparent" />
                </div>

                <div className="absolute top-4 left-4 p-2 rounded-xl bg-[#0c1228]/80 backdrop-blur-md border border-slate-700/60 shadow-md">
                  {getIconForCharacter(char.iconName)}
                </div>

                {/* Speaking Badge Overlay */}
                {isThisCharSpeaking && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>{speech.isPaused ? 'Paused' : 'Speaking'}</span>
                  </div>
                )}
              </div>

              {/* Character Details Body */}
              <div className="p-5 pt-0 -mt-6 relative z-10 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {char.name}
                    </h3>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{char.motto}</span>
                  </div>

                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {char.tagline}
                  </p>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {char.description}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Specialty:</span>
                    <span className="text-white font-medium truncate max-w-[170px]">{char.speciality}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Voice Tone:</span>
                    <span className="text-cyan-300 font-medium">{char.voiceTone}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-[#070b18] border-t border-[#1a254a] grid grid-cols-12 gap-2 items-center">
                {/* Voice Playback Toggle */}
                <div className="col-span-5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle(char)}
                    title="Listen to character's voice and motto"
                    className={`flex-1 py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isThisCharSpeaking
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-950/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-[#22305e] text-slate-400 hover:text-white hover:bg-[#121c3d]'
                    }`}
                  >
                    {isThisCharSpeaking ? (
                      speech.isPaused ? (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      )
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Voice Tone</span>
                      </>
                    )}
                  </button>

                  {isThisCharSpeaking && (
                    <button
                      type="button"
                      onClick={speech.stop}
                      title="Stop audio"
                      className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:text-white cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-rose-300" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDetailModal(char)}
                  className="col-span-3 py-2 px-2 rounded-xl bg-[#121c3d] hover:bg-[#1a2958] text-slate-200 text-xs font-semibold text-center transition-colors cursor-pointer"
                >
                  Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    speech.stop();
                    onSelectCharacter(char);
                    onStartDebate(char.id);
                  }}
                  className="col-span-4 py-2 px-2 rounded-xl bg-gradient-to-r from-[#d946ef] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Debate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090f24] border border-[#22305e] p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={() => {
                speech.stop();
                setActiveDetailModal(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={activeDetailModal.avatarUrl}
                alt={activeDetailModal.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <h3 className="text-xl font-bold text-white">{activeDetailModal.name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">{activeDetailModal.tagline}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeDetailModal.motto}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">Voice Tone & Cadence</span>
                <button
                  type="button"
                  onClick={() => handleVoiceToggle(activeDetailModal)}
                  className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Voice</span>
                </button>
              </div>
              <p className="text-slate-300 italic">"{activeDetailModal.signatureQuote}"</p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white">Debate Specialization:</h4>
              <p className="text-slate-300 leading-relaxed">{activeDetailModal.description}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  speech.stop();
                  setActiveDetailModal(null);
                }}
                className="px-4 py-2 rounded-full bg-[#121c38] text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  speech.stop();
                  const target = activeDetailModal;
                  setActiveDetailModal(null);
                  onSelectCharacter(target);
                  onStartDebate(target.id);
                }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white text-xs font-bold cursor-pointer"
              >
                Start Debate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
