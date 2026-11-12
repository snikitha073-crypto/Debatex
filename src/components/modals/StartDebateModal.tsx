import React, { useState } from 'react';
import {
  X,
  Swords,
  Zap,
  CheckCircle2,
  Shuffle,
} from 'lucide-react';
import { Character, Topic } from '../../types/debate';

interface StartDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  topics: Topic[];
  initialCharacterId?: string;
  initialTopicId?: string;
  onConfirmStart: (characterId: string, topicId: string, side: string) => void;
}

export const StartDebateModal: React.FC<StartDebateModalProps> = ({
  isOpen,
  onClose,
  characters,
  topics,
  initialCharacterId,
  initialTopicId,
  onConfirmStart,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialCharacterId || characters[0].id
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || topics[0].id
  );

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
  const [chosenSide, setChosenSide] = useState<string>(selectedTopic.sideA);

  if (!isOpen) return null;

  const selectedChar = characters.find((c) => c.id === selectedCharId) || characters[0];

  const handleRandomize = () => {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    setSelectedCharId(randomChar.id);
    setSelectedTopicId(randomTopic.id);
    setChosenSide(Math.random() > 0.5 ? randomTopic.sideA : randomTopic.sideB);
  };

  const handleLaunch = () => {
    onConfirmStart(selectedCharId, selectedTopicId, chosenSide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-card p-6 md:p-8 border border-cyan-500/30 bg-[#090f24] space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Match</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Start a Debate
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-2.5 py-1.5 rounded-xl bg-[#0e1633] hover:bg-[#16224d] text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors border border-[#22305e] cursor-pointer"
              title="Pick random opponent & topic"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Randomize</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step 1: Opponent */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            1. Select AI Opponent
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {characters.map((char) => {
              const isSelected = char.id === selectedCharId;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/60 ring-2 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-square rounded-lg object-cover border border-slate-700 mb-1"
                  />
                  <span className="text-[10px] font-bold text-white block truncate">
                    {char.name.split(' ')[1] || char.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-300 italic pt-1">
            "{selectedChar.signatureQuote}"
          </p>
        </div>

        {/* Step 2: Topic */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            2. Choose Topic
          </label>
          <select
            value={selectedTopicId}
            onChange={(e) => {
              setSelectedTopicId(e.target.value);
              const match = topics.find((t) => t.id === e.target.value);
              if (match) setChosenSide(match.sideA);
            }}
            className="w-full p-3 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.category}] {t.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-cyan-300 font-medium italic border-l-2 border-cyan-500/40 pl-2 mt-1">
            "{selectedTopic.question}"
          </p>
        </div>

        {/* Step 3: Choose Side */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            3. Choose Your Side
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setChosenSide(selectedTopic.sideA)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                chosenSide === selectedTopic.sideA
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-white truncate">{selectedTopic.sideA}</span>
                {chosenSide === selectedTopic.sideA && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">Defend this side</p>
            </button>

            <button
              onClick={() => setChosenSide(selectedTopic.sideB)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                chosenSide === selectedTopic.sideB
                  ? 'border-purple-400 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-white truncate">{selectedTopic.sideB}</span>
                {chosenSide === selectedTopic.sideB && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">Defend this side</p>
            </button>
          </div>
        </div>

        {/* Launch */}
        <div className="pt-2">
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Enter Debate Arena</span>
          </button>
        </div>
      </div>
    </div>
  );
};
