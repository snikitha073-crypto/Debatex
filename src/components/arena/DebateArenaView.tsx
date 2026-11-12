import React, { useState, useEffect } from 'react';
import {
  Swords,
  Timer,
  Send,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Brain,
  Award,
  Play,
  Pause,
  ArrowRight,
  CheckCircle2,
  StopCircle,
  AlertTriangle,
  Infinity as InfinityIcon,
  Zap,
  Volume2,
  VolumeX,
  Sliders,
  AlertCircle,
  Square,
  User,
} from 'lucide-react';
import { Character, Topic, DebateMessage, PastDebate } from '../../types/debate';
import { useDebateSpeech } from '../../hooks/useDebateSpeech';
import { getUserAvatarUrl } from '../../data/userAvatars';

export interface CustomDebateConfig {
  topic: string;
  userPosition: 'FOR' | 'AGAINST';
  opponentCharacterId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mode: 'unlimited' | 'quick';
  rounds?: number;
}

interface DebateArenaViewProps {
  characters: Character[];
  topics: Topic[];
  selectedCharacterId?: string;
  selectedTopicId?: string;
  preferredSide?: string;
  customConfig?: CustomDebateConfig;
  currentUser?: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
  onRecordCompletedDebate?: (result: PastDebate) => void;
  onGoToCustomCreator?: () => void;
}

export const DebateArenaView: React.FC<DebateArenaViewProps> = ({
  characters,
  topics,
  selectedCharacterId,
  selectedTopicId,
  preferredSide,
  customConfig,
  currentUser,
  onRecordCompletedDebate,
  onGoToCustomCreator,
}) => {
  // Opponent character
  const [activeCharacter, setActiveCharacter] = useState<Character>(() => {
    const targetId = customConfig?.opponentCharacterId || selectedCharacterId;
    return characters.find((c) => c.id === targetId) || characters[0];
  });

  // Topic & Stance
  const [activeTopic, setActiveTopic] = useState<Topic>(() => {
    if (customConfig) {
      return {
        id: 'custom-topic',
        category: 'Custom',
        title: customConfig.topic,
        question: customConfig.topic,
        description: `Custom debate motion: ${customConfig.topic}`,
        difficulty: customConfig.difficulty,
        sideA: 'FOR the motion',
        sideB: 'AGAINST the motion',
      };
    }
    return topics.find((t) => t.id === selectedTopicId) || topics[0];
  });

  const [userSide, setUserSide] = useState<string>(() => {
    if (customConfig) {
      return customConfig.userPosition === 'FOR' ? 'FOR the motion' : 'AGAINST the motion';
    }
    if (preferredSide) return preferredSide;
    const initialTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];
    return initialTopic.sideA;
  });

  // Debate Mode: 'unlimited' is the default
  const [debateMode, setDebateMode] = useState<'unlimited' | 'quick'>(() => {
    return customConfig?.mode || 'unlimited';
  });

  const [arenaState, setArenaState] = useState<'setup' | 'active' | 'judging' | 'completed'>('setup');

  // Active debate state
  const [currentRound, setCurrentRound] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isCharacterThinking, setIsCharacterThinking] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);

  // Confirmation modal state for ending debate
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);

  // Audio control bar toggle
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Voice playback hook
  const speech = useDebateSpeech();

  // Constructive evaluation state
  const [evaluation, setEvaluation] = useState<{
    reasoning: string;
    clarity: string;
    evidence: string;
    summary: string;
  } | null>(null);

  // Sync when custom config changes
  useEffect(() => {
    if (customConfig) {
      const matchChar = characters.find((c) => c.id === customConfig.opponentCharacterId);
      if (matchChar) setActiveCharacter(matchChar);

      const customTop: Topic = {
        id: `custom-${Date.now()}`,
        category: 'Custom',
        title: customConfig.topic,
        question: customConfig.topic,
        description: `Custom debate motion: ${customConfig.topic}`,
        difficulty: customConfig.difficulty,
        sideA: 'FOR the motion',
        sideB: 'AGAINST the motion',
      };
      setActiveTopic(customTop);
      const chosenSide = customConfig.userPosition === 'FOR' ? 'FOR the motion' : 'AGAINST the motion';
      setUserSide(chosenSide);
      setDebateMode(customConfig.mode || 'unlimited');

      // Auto start custom debate
      handleStartMatchWithParams(
        customTop,
        chosenSide,
        matchChar || characters[0],
        customConfig.mode || 'unlimited'
      );
    }
  }, [customConfig]);

  // Sync selected props
  useEffect(() => {
    if (selectedCharacterId && !customConfig) {
      const match = characters.find((c) => c.id === selectedCharacterId);
      if (match) setActiveCharacter(match);
    }
  }, [selectedCharacterId, characters, customConfig]);

  useEffect(() => {
    if (selectedTopicId && !customConfig) {
      const match = topics.find((t) => t.id === selectedTopicId);
      if (match) {
        setActiveTopic(match);
        if (preferredSide) {
          setUserSide(preferredSide);
        } else {
          setUserSide(match.sideA);
        }
      }
    }
  }, [selectedTopicId, preferredSide, topics, customConfig]);

  // Round timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  // Stop speech when navigating away or unmounting
  useEffect(() => {
    return () => {
      speech.stop();
    };
  }, []);

  const opponentSide =
    userSide === activeTopic.sideA ? activeTopic.sideB : activeTopic.sideA;

  // Start Match
  const handleStartMatchWithParams = (
    top: Topic,
    uSide: string,
    char: Character,
    mode: 'unlimited' | 'quick'
  ) => {
    speech.stop();
    const oppSide = uSide === top.sideA ? top.sideB : top.sideA;

    const initialModeratorMsg: DebateMessage = {
      id: 'mod-1',
      sender: 'moderator',
      text: `Welcome to the arena! The topic is: "${top.title}". You are defending: "${uSide}". ${char.name} is defending: "${oppSide}". ${
        mode === 'unlimited'
          ? 'Unlimited Debate Mode is active — debate for as many rounds as you wish, then click "End Debate" whenever you want your final constructive report.'
          : 'Quick Debate Mode (3 rounds). Share your opening argument below to begin!'
      }`,
      timestamp: 'Round 1 · Start',
      roundNumber: 1,
      roundName: 'Opening Statements',
    };

    setMessages([initialModeratorMsg]);
    setCurrentRound(1);
    setDebateMode(mode);
    setTimerSeconds(90);
    setIsTimerActive(true);
    setArenaState('active');
  };

  const handleStartMatch = () => {
    handleStartMatchWithParams(activeTopic, userSide, activeCharacter, debateMode);
  };

  // Submit User Argument
  const handleSubmitArgument = async () => {
    if (!userInput.trim() || isCharacterThinking) return;

    speech.stop();

    const t0_userSend = performance.now();
    const sendTimestamp = new Date().toISOString();
    console.log(`[DebateX Perf] 1. User sent message at: ${sendTimestamp} (t=0.0ms)`);

    const userMsg: DebateMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput.trim(),
      timestamp: `Round ${currentRound} · You`,
      roundNumber: currentRound,
      roundName: `Round ${currentRound}`,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setUserInput('');
    setIsCharacterThinking(true);

    const t1_apiStart = performance.now();
    console.log(`[DebateX Perf] 2. API request began at: ${new Date().toISOString()} (+${(t1_apiStart - t0_userSend).toFixed(1)}ms after user send)`);

    try {
      const response = await fetch('/api/debate/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic.title,
          userStance: userSide,
          opponentStance: opponentSide,
          character: activeCharacter,
          roundNumber: currentRound,
          totalRounds: debateMode === 'quick' ? 3 : 999,
          previousMessages: updatedMessages,
          userArgument: userMsg.text,
          difficulty: activeTopic.difficulty,
          isUnlimited: debateMode === 'unlimited',
        }),
      });

      const t2_firstContent = performance.now();
      console.log(`[DebateX Perf] 3. First response content arrived at: ${new Date().toISOString()} (+${(t2_firstContent - t1_apiStart).toFixed(1)}ms API network roundtrip)`);

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        replyText = data.text;
      } else {
        throw new Error('Fallback required');
      }

      const t3_completeResponse = performance.now();
      console.log(`[DebateX Perf] 4. Complete response arrived and parsed at: ${new Date().toISOString()} (+${(t3_completeResponse - t1_apiStart).toFixed(1)}ms total API duration)`);

      const charMsg: DebateMessage = {
        id: `char-${Date.now()}`,
        sender: 'character',
        text: replyText,
        timestamp: `Round ${currentRound} · ${activeCharacter.name}`,
        roundNumber: currentRound,
        roundName: `Round ${currentRound}`,
      };

      const finalMessages = [...updatedMessages, charMsg];
      setMessages(finalMessages);
      setIsCharacterThinking(false);

      const t4_displayed = performance.now();
      console.log(`[DebateX Perf] 5. Response displayed in UI at: ${new Date().toISOString()} (Total time to display: ${((t4_displayed - t0_userSend) / 1000).toFixed(2)}s / ${(t4_displayed - t0_userSend).toFixed(1)}ms)`);

      if (debateMode === 'unlimited') {
        setCurrentRound((prev) => prev + 1);
        setTimerSeconds(90);
      } else {
        if (currentRound < 3) {
          setCurrentRound((prev) => prev + 1);
          setTimerSeconds(90);
        } else {
          finishDebate(finalMessages, 3);
        }
      }
    } catch (err) {
      const fallbackText = `Defending ${opponentSide}, I hear your point regarding "${userSide}". However, when considering the long-term reality, ${opponentSide} remains a much more balanced and justifiable approach.`;
      const charMsg: DebateMessage = {
        id: `char-${Date.now()}`,
        sender: 'character',
        text: fallbackText,
        timestamp: `Round ${currentRound} · ${activeCharacter.name}`,
        roundNumber: currentRound,
        roundName: `Round ${currentRound}`,
      };
      const finalMessages = [...updatedMessages, charMsg];
      setMessages(finalMessages);
      setIsCharacterThinking(false);

      if (debateMode === 'unlimited') {
        setCurrentRound((prev) => prev + 1);
        setTimerSeconds(90);
      } else {
        if (currentRound < 3) {
          setCurrentRound((prev) => prev + 1);
          setTimerSeconds(90);
        } else {
          finishDebate(finalMessages, 3);
        }
      }
    }
  };

  // Finish debate & fetch constructive feedback
  const finishDebate = async (debateMsgs: DebateMessage[], completedRoundsCount?: number) => {
    speech.stop();
    setShowEndConfirmModal(false);
    setArenaState('judging');

    const totalRoundsLogged = completedRoundsCount || currentRound;

    try {
      const evalRes = await fetch('/api/debate/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic.title,
          userStance: userSide,
          opponentStance: opponentSide,
          characterName: activeCharacter.name,
          messages: debateMsgs,
        }),
      });

      let evalData = {
        reasoning: 'You supported your points with clear, practical reasoning and stayed grounded throughout the debate.',
        clarity: 'Your arguments were straightforward, easy to understand, and well structured.',
        evidence: 'You used relatable examples to illustrate your stance effectively.',
        summary: `You had an engaging debate defending "${userSide}" against ${activeCharacter.name} across ${totalRoundsLogged} rounds!`,
      };

      if (evalRes.ok) {
        evalData = await evalRes.json();
      }
      setEvaluation(evalData);

      const now = new Date();
      const dateStr =
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (onRecordCompletedDebate) {
        onRecordCompletedDebate({
          id: `deb-${Date.now()}`,
          date: dateStr,
          characterId: activeCharacter.id,
          characterName: activeCharacter.name,
          characterAvatar: activeCharacter.avatarUrl,
          topicTitle: activeTopic.title,
          category: activeTopic.category,
          userStance: userSide,
          outcome: 'Won',
          summary: `Debated "${activeTopic.title}" defending "${userSide}" against ${activeCharacter.name} for ${totalRoundsLogged} ${totalRoundsLogged === 1 ? 'round' : 'rounds'}.`,
          messages: debateMsgs,
        });
      }
      setArenaState('completed');
    } catch (err) {
      setArenaState('completed');
    }
  };

  // User explicitly clicks "End Debate"
  const handleRequestEndDebate = () => {
    if (messages.length <= 1) {
      speech.stop();
      setArenaState('setup');
      return;
    }
    setShowEndConfirmModal(true);
  };

  const handleConfirmEndDebate = () => {
    finishDebate(messages, currentRound);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {arenaState === 'setup' ? (
        /* ================= SETUP STAGE ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Debate Arena Setup
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pick an AI opponent and topic. Unlimited debate mode is active by default.
              </p>
            </div>

            {onGoToCustomCreator && (
              <button
                type="button"
                onClick={onGoToCustomCreator}
                className="px-4 py-2 rounded-full bg-[#121c38] hover:bg-[#1a2958] text-cyan-300 border border-[#22305e] text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
              >
                + Custom Debate Creator
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Step 1: Opponent */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">1</span>
                <span>Select Opponent</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                {characters.map((char) => {
                  const isSelected = activeCharacter.id === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => setActiveCharacter(char)}
                      className={`cursor-pointer rounded-2xl p-2.5 border transition-all text-center ${
                        isSelected
                          ? 'border-cyan-400 bg-[#121c38] ring-2 ring-cyan-500/30'
                          : 'border-[#1b254a] bg-[#090e21] hover:border-[#2f3e75]'
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

              {/* Opponent Preview & Audio Listen */}
              <div className="p-3.5 rounded-2xl bg-[#090e21] border border-[#1b254a] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{activeCharacter.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        speech.play(
                          `I am ${activeCharacter.name}. My motto is: ${activeCharacter.motto}. ${activeCharacter.signatureQuote}`,
                          'char-preview',
                          activeCharacter.name,
                          activeCharacter.id
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#141e3d] hover:bg-[#1f2e5c] text-cyan-300 hover:text-white border border-[#2b3a6b] text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                      title="Preview AI character's voice tone"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                      <span>Hear Voice</span>
                    </button>
                    <span className="text-[11px] text-cyan-400 font-medium">{activeCharacter.motto}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeCharacter.description}
                </p>
              </div>
            </div>

            {/* Step 2, 3 & 4: Topic, Side, Mode */}
            <div className="lg:col-span-6 space-y-4">
              {/* Select Topic */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono">2</span>
                  <span>Debate Topic</span>
                </h3>

                <select
                  value={activeTopic.id}
                  onChange={(e) => {
                    const match = topics.find((t) => t.id === e.target.value);
                    if (match) {
                      setActiveTopic(match);
                      setUserSide(match.sideA);
                    }
                  }}
                  className="w-full p-3 text-xs rounded-xl bg-[#090e21] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.category}] {t.title}
                    </option>
                  ))}
                </select>

                <div className="p-3 rounded-2xl bg-[#090e21] border border-[#1b254a] space-y-1 text-xs">
                  <p className="font-semibold text-white">"{activeTopic.question}"</p>
                  <p className="text-[11px] text-slate-400">{activeTopic.description}</p>
                </div>
              </div>

              {/* Choose Side */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono">3</span>
                  <span>Your Stance</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUserSide(activeTopic.sideA)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      userSide === activeTopic.sideA
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                        : 'border-[#1b254a] bg-[#090e21] text-slate-300 hover:border-[#2f3e75]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{activeTopic.sideA}</span>
                      {userSide === activeTopic.sideA && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Your Stance</span>
                  </button>

                  <button
                    onClick={() => setUserSide(activeTopic.sideB)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      userSide === activeTopic.sideB
                        ? 'border-purple-400 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                        : 'border-[#1b254a] bg-[#090e21] text-slate-300 hover:border-[#2f3e75]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate">{activeTopic.sideB}</span>
                      {userSide === activeTopic.sideB && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Your Stance</span>
                  </button>
                </div>
              </div>

              {/* Debate Mode Selection: Unlimited (Default) vs Quick Debate */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono">4</span>
                  <span>Debate Mode</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDebateMode('unlimited')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      debateMode === 'unlimited'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30'
                        : 'border-[#1b254a] bg-[#090e21] text-slate-400 hover:border-[#2f3e75]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <InfinityIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-bold text-white">Unlimited (Default)</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Debate as long as you wish. End whenever you want your evaluation.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDebateMode('quick')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      debateMode === 'quick'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                        : 'border-[#1b254a] bg-[#090e21] text-slate-400 hover:border-[#2f3e75]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-white">Quick Debate</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      3 focused rounds for a quick debate session.
                    </p>
                  </button>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartMatch}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Swords className="w-4 h-4" />
                  <span>
                    {debateMode === 'unlimited' ? 'Begin Unlimited Debate' : 'Begin Quick Debate'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : arenaState === 'active' ? (
        /* ================= ACTIVE DEBATE ================= */
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activeCharacter.avatarUrl}
                alt={activeCharacter.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{activeCharacter.name}</span>
                  <span className="text-[10px] text-purple-300 font-medium">({opponentSide})</span>
                </div>
                <p className="text-xs text-slate-300 truncate max-w-sm mt-0.5">
                  Topic: {activeTopic.title} · You: {userSide}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              {/* Audio Controls Toggle */}
              <button
                type="button"
                onClick={() => setShowAudioSettings((prev) => !prev)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  showAudioSettings || speech.isPlaying
                    ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    : 'bg-[#0e1633] border-[#22305e] text-slate-300 hover:text-white'
                }`}
                title="Voice Playback Settings (Speed, Volume, Voices)"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Voice Settings</span>
              </button>

              {/* Round indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1633] border border-[#22305e] text-xs font-mono">
                {debateMode === 'unlimited' ? (
                  <>
                    <InfinityIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-cyan-300">Round {currentRound}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">(Unlimited)</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-purple-300">Round {currentRound} of 3</span>
                  </>
                )}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1633] border border-[#22305e] text-xs font-mono text-white">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span>{formatTimer(timerSeconds)}</span>
              </div>

              {/* Prominent "End Debate" button */}
              <button
                onClick={handleRequestEndDebate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/70 to-red-950/70 text-rose-200 hover:text-white hover:from-rose-900 hover:to-red-900 border border-rose-500/40 text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Conclude debate and generate constructive feedback"
              >
                <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>End Debate</span>
              </button>

              <button
                onClick={() => {
                  speech.stop();
                  setArenaState('setup');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice Audio Settings Panel (Expandable) */}
          {showAudioSettings && (
            <div className="p-4 rounded-2xl bg-[#090e21] border border-[#22305e] text-xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-[#17203d]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>SpeechSynthesis Audio Settings</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {speech.isAvailable ? 'Voice Engine Ready' : 'Voice Not Supported'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Speed */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold flex justify-between">
                    <span>Speed Rate</span>
                    <span className="text-cyan-400 font-mono">{speech.rate}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.1"
                    value={speech.rate}
                    onChange={(e) => speech.setRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold flex justify-between">
                    <span>Volume</span>
                    <span className="text-cyan-400 font-mono">{Math.round(speech.volume * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={speech.volume}
                    onChange={(e) => speech.setVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Voice Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-semibold">Voice Choice</label>
                  <select
                    value={speech.selectedVoiceURI || ''}
                    onChange={(e) => speech.setSelectedVoiceURI(e.target.value || null)}
                    className="w-full p-1.5 text-xs rounded-lg bg-[#060913] border border-[#1b254a] text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer truncate"
                  >
                    <option value="">Default Character Voice</option>
                    {speech.voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Audio Playback Bar if Speaking */}
          {speech.isPlaying && (
            <div className="px-4 py-2.5 rounded-2xl bg-[#0e1633] border border-cyan-500/40 text-xs flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-2.5">
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-1 bg-cyan-400 h-2.5 animate-pulse" />
                  <span className="w-1 bg-purple-400 h-3.5 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 bg-cyan-300 h-1.5 animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 bg-pink-400 h-3 animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
                <span className="text-white font-semibold">
                  {speech.activeSpeakerName || activeCharacter.name} is speaking...
                </span>
                {speech.isPaused && (
                  <span className="text-amber-400 font-mono text-[11px]">(Paused)</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {speech.isPaused ? (
                  <button
                    onClick={speech.resume}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={speech.pause}
                    className="px-2.5 py-1 rounded-lg bg-[#141e3d] hover:bg-[#1e2d5c] border border-[#2b3a6d] text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Pause className="w-3 h-3" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  onClick={speech.stop}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-rose-300" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          )}

          {/* Speech Error Banner */}
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

          {/* Mode banner */}
          {debateMode === 'unlimited' && (
            <div className="px-4 py-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InfinityIcon className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong>Unlimited Debate Mode:</strong> Debate freely for as many rounds as you want. Click "End Debate" when you are ready for your constructive report.
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 hidden sm:inline">
                {currentRound - 1} exchanges completed
              </span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-4 min-h-[320px] max-h-[460px] overflow-y-auto pr-1">
            {messages.map((msg) => {
              if (msg.sender === 'moderator') {
                return (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-2xl bg-[#0e1633]/80 border border-[#22305e] text-center text-xs text-slate-300"
                  >
                    <p>{msg.text}</p>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              const isThisSpeaking = speech.activeMessageId === msg.id && speech.isPlaying;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 px-1">
                    {!isUser && (
                      <img
                        src={activeCharacter.avatarUrl}
                        alt={activeCharacter.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-md object-cover border border-slate-700"
                      />
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isUser
                        ? currentUser?.displayName
                          ? `${currentUser.displayName}${currentUser.username ? ` (@${currentUser.username})` : ''}`
                          : currentUser?.username
                          ? `@${currentUser.username}`
                          : 'You'
                        : `${activeCharacter.name} (${opponentSide})`}
                    </span>
                    {isUser && (
                      getUserAvatarUrl(currentUser?.avatar) ? (
                        <img
                          src={getUserAvatarUrl(currentUser?.avatar)}
                          alt="You"
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover border border-purple-500/50"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                          <User className="w-3 h-3" />
                        </div>
                      )
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-lg rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/40 text-white'
                        : isThisSpeaking
                        ? 'bg-[#0e1633] border border-cyan-400 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-[#0e1633] border border-[#22305e] text-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* AI Voice Playback Controls for Character Messages */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-[#1b254a] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {isThisSpeaking ? (
                            <>
                              {speech.isPaused ? (
                                <button
                                  type="button"
                                  onClick={speech.resume}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Resume</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={speech.pause}
                                  className="px-2.5 py-1 rounded-lg bg-[#152147] hover:bg-[#1d2d61] text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Pause className="w-3 h-3" />
                                  <span>Pause</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={speech.stop}
                                className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Stop speaking"
                              >
                                <Square className="w-2.5 h-2.5 fill-rose-300" />
                                <span>Stop</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                speech.play(
                                  msg.text,
                                  msg.id,
                                  activeCharacter.name,
                                  activeCharacter.id
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-[#141e3d] hover:bg-[#1f2e5c] text-cyan-300 hover:text-white border border-[#263768] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Listen to this argument aloud"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Listen to Argument</span>
                            </button>
                          )}
                        </div>

                        {isThisSpeaking && (
                          <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span>Speaking</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isCharacterThinking && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0e1633] border border-[#22305e] max-w-xs text-xs text-slate-400">
                <Brain className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>{activeCharacter.name} is preparing a counterargument...</span>
              </div>
            )}
          </div>

          {/* Argument Input */}
          <div className="rounded-2xl bg-[#090e21] border border-[#1b254a] p-3.5 space-y-2">
            <div className="relative">
              <textarea
                rows={3}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Round ${currentRound}: Present your arguments defending ${userSide}...`}
                className="w-full p-3 text-xs sm:text-sm text-white bg-[#060913] rounded-xl border border-[#1b254a] focus:outline-none focus:border-cyan-400 placeholder-slate-500 resize-none"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Round {currentRound}</span>
                  {debateMode === 'unlimited' ? (
                    <span className="text-cyan-400 font-medium">· Unlimited Mode</span>
                  ) : (
                    <span>of 3</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRequestEndDebate}
                    className="px-3.5 py-1.5 rounded-full text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    End Debate Now
                  </button>

                  <button
                    disabled={!userInput.trim() || isCharacterThinking}
                    onClick={handleSubmitArgument}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Point</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : arenaState === 'judging' ? (
        /* ================= REVIEWING ================= */
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-12 text-center space-y-3">
          <Brain className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">Analyzing Your Debate...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Synthesizing constructive feedback on your reasoning, clarity, and evidence across all completed rounds.
          </p>
        </div>
      ) : (
        /* ================= COMPLETED & CONSTRUCTIVE FEEDBACK ================= */
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-white">Debate Completed!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              You debated <strong>"{activeTopic.title}"</strong> defending <strong>{userSide}</strong> against {activeCharacter.name} for <strong>{currentRound} {currentRound === 1 ? 'round' : 'rounds'}</strong>.
            </p>
          </div>

          {/* Constructive Feedback Grid: Reasoning, Clarity, Evidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Constructive Feedback on Your Performance
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentRound} Rounds Analyzed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Reasoning */}
              <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] space-y-1">
                <span className="text-xs font-bold text-purple-300 block">
                  1. Reasoning & Logic
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation?.reasoning || 'You supported your points with clear, practical reasoning throughout.'}
                </p>
              </div>

              {/* Clarity */}
              <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] space-y-1">
                <span className="text-xs font-bold text-cyan-300 block">
                  2. Clarity of Speech
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation?.clarity || 'Your points were easy to understand and well organized.'}
                </p>
              </div>

              {/* Evidence */}
              <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] space-y-1">
                <span className="text-xs font-bold text-emerald-300 block">
                  3. Examples & Evidence
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluation?.evidence || 'You brought relatable examples that made your stance believable.'}
                </p>
              </div>
            </div>

            {evaluation?.summary && (
              <p className="text-xs text-slate-300 bg-[#0e1633]/60 p-3 rounded-2xl border border-[#1d2950] italic text-center">
                "{evaluation.summary}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartMatch}
              className="px-5 py-2.5 rounded-full bg-[#141d3d] hover:bg-[#1e2c5e] text-slate-200 text-xs font-semibold border border-[#2b3c75] transition-all cursor-pointer"
            >
              Debate Again
            </button>
            <button
              onClick={() => setArenaState('setup')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Choose New Topic
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Ending Debate */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#090f24] border border-[#22305e] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">End Debate Session?</h3>
                <p className="text-xs text-slate-400">You have completed {currentRound} round(s)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to conclude the debate now? The AI judge will analyze all your arguments and generate your final constructive report on reasoning, clarity, and evidence.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEndConfirmModal(false)}
                className="px-4 py-2 rounded-full bg-[#121c38] hover:bg-[#1a2852] text-slate-300 text-xs font-semibold border border-[#22305e] transition-all cursor-pointer"
              >
                Continue Debating
              </button>

              <button
                type="button"
                onClick={handleConfirmEndDebate}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Confirm & End Debate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
