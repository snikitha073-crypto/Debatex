import React, { useState } from 'react';
import {
  Sparkles,
  Swords,
  PlusCircle,
  CheckCircle2,
  Brain,
  Sliders,
  HelpCircle,
  Infinity as InfinityIcon,
  Zap,
} from 'lucide-react';
import { Character } from '../../types/debate';
import { CustomDebateConfig } from '../arena/DebateArenaView';

interface CreateDebateViewProps {
  characters: Character[];
  onStartCustomDebate: (config: CustomDebateConfig) => void;
}

export const CreateDebateView: React.FC<CreateDebateViewProps> = ({
  characters,
  onStartCustomDebate,
}) => {
  const [topicInput, setTopicInput] = useState('');
  const [userPosition, setUserPosition] = useState<'FOR' | 'AGAINST'>('FOR');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(characters[0].id);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [debateMode, setDebateMode] = useState<'unlimited' | 'quick'>('unlimited');
  const [inputError, setInputError] = useState('');

  const selectedCharacter =
    characters.find((c) => c.id === selectedCharacterId) || characters[0];

  const handleStart = () => {
    if (!topicInput.trim()) {
      setInputError('Please enter a debate topic to get started.');
      return;
    }
    if (topicInput.trim().length < 5) {
      setInputError('Please write a slightly longer topic (at least 5 characters).');
      return;
    }

    setInputError('');
    onStartCustomDebate({
      topic: topicInput.trim(),
      userPosition,
      opponentCharacterId: selectedCharacterId,
      difficulty,
      mode: debateMode,
      rounds: debateMode === 'quick' ? 3 : 999,
    });
  };

  const sampleIdeas = [
    'Should students learn financial budgeting in high school?',
    'Is working four days a week better than five?',
    'Should space exploration take priority over ocean exploration?',
    'Is cooking an essential life skill everyone should master?',
    'Does artificial intelligence improve human creativity?',
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#17203d]">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Custom Debate Studio</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create Your Own Debate
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Enter any motion or question you'd like to debate. Choose your position, pick an AI opponent archetype, and battle with logic.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Enter Topic */}
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">1</span>
              <span>What would you like to debate?</span>
            </h3>
            <span className="text-[11px] text-slate-500">Enter any question or motion</span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => {
                setTopicInput(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="e.g. Should exams be replaced with practical projects?"
              className="w-full px-4 py-3 rounded-2xl bg-[#060913] border border-[#22305e] focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />

            {inputError && (
              <p className="text-xs text-rose-400 pl-1">{inputError}</p>
            )}

            {/* Quick Inspiration Starters */}
            <div className="pt-1 space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">Or pick an inspiration topic:</span>
              <div className="flex flex-wrap gap-1.5">
                {sampleIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => {
                      setTopicInput(idea);
                      setInputError('');
                    }}
                    className="text-[11px] px-3 py-1 rounded-xl bg-[#0e1633] hover:bg-[#16224d] text-slate-300 hover:text-white border border-[#202c57] transition-colors cursor-pointer text-left"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Position (FOR or AGAINST) */}
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono">2</span>
              <span>Choose your position</span>
            </h3>
            <span className="text-[11px] text-slate-500">The AI will automatically take the opposite</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserPosition('FOR')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                userPosition === 'FOR'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'border-[#1b254a] bg-[#0c1228] text-slate-300 hover:border-[#2f3e75]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">FOR (In Favor)</span>
                {userPosition === 'FOR' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400">
                You agree with the topic. Your AI opponent will argue AGAINST it.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUserPosition('AGAINST')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                userPosition === 'AGAINST'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/30'
                  : 'border-[#1b254a] bg-[#0c1228] text-slate-300 hover:border-[#2f3e75]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">AGAINST (Opposed)</span>
                {userPosition === 'AGAINST' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="text-xs text-slate-400">
                You disagree with the topic. Your AI opponent will argue FOR it.
              </p>
            </button>
          </div>
        </div>

        {/* Step 3: Select AI Opponent */}
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">3</span>
              <span>Choose your AI Opponent</span>
            </h3>
            <span className="text-[11px] text-slate-500">Pick their personality</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {characters.map((char) => {
              const isSelected = selectedCharacterId === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharacterId(char.id)}
                  className={`cursor-pointer rounded-2xl p-2.5 border text-center transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-[#121c38] ring-2 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-[#1b254a] bg-[#0c1228] hover:border-[#2f3e75]'
                  }`}
                >
                  <img
                    src={char.avatarUrl}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-square rounded-xl object-cover border border-slate-700 mb-1.5"
                  />
                  <h4 className="font-bold text-xs text-white truncate">
                    {char.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {char.motto}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Opponent Preview Callout */}
          <div className="p-3.5 rounded-2xl bg-[#0e1633] border border-[#22305e] text-xs flex items-center gap-3">
            <img
              src={selectedCharacter.avatarUrl}
              alt={selectedCharacter.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div>
              <p className="text-white font-semibold">
                {selectedCharacter.name} will argue {userPosition === 'FOR' ? 'AGAINST' : 'FOR'} your topic.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Speciality: {selectedCharacter.description}
              </p>
            </div>
          </div>
        </div>

        {/* Step 4 & 5: Difficulty & Debate Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Difficulty */}
          <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono">4</span>
              <span>Select Difficulty</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'border border-cyan-400 bg-cyan-950/50 text-cyan-300'
                      : 'border border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Debate Mode: Unlimited (Default) vs Quick Debate */}
          <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono">5</span>
              <span>Debate Mode</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDebateMode('unlimited')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  debateMode === 'unlimited'
                    ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 ring-1 ring-cyan-500/30'
                    : 'border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <InfinityIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Unlimited (Default)</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1">
                  Debate unlimited rounds as long as you want.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDebateMode('quick')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  debateMode === 'quick'
                    ? 'border-purple-400 bg-purple-950/50 text-purple-300 ring-1 ring-purple-500/30'
                    : 'border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Quick Debate</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1">
                  3 rounds with automatic conclusion.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Start Debate CTA */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Swords className="w-4 h-4" />
            <span>
              {debateMode === 'unlimited' ? 'Start Unlimited Debate' : 'Start Quick Debate'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
