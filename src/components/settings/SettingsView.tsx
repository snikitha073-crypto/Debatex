import React, { useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  Volume2,
  Save,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  currentUser?: {
    username: string;
    displayName: string;
    avatar: string | null;
    bio: string;
  };
  onUpdateProfile?: (updated: {
    displayName: string;
    bio: string;
    avatar: string | null;
    username?: string;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
  onSaveNotification?: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onUpdateProfile,
  onSaveNotification,
}) => {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [tagline, setTagline] = useState('Curious Thinker');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [roundTimer, setRoundTimer] = useState<number>(90);
  const [roundCount, setRoundCount] = useState<number>(3);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (onUpdateProfile && currentUser) {
      onUpdateProfile({
        displayName: displayName.trim(),
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
        username: currentUser.username,
      });
    }
    setSavedSuccess(true);
    if (onSaveNotification) {
      onSaveNotification('Preferences saved successfully.');
    }
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize your debate timer, difficulty, and debater profile.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Your preferences have been saved.</span>
        </div>
      )}

      {/* Profile Section */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Your Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your preferred display name (e.g. Alex Vance)"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Debater Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* Debate Arena Dynamics */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Debate Settings</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Difficulty Preset */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Debate Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold ring-2 ring-cyan-500/20'
                      : 'border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {difficulty === 'Beginner' && 'Easy everyday language with friendly encouragement.'}
              {difficulty === 'Intermediate' && 'Balanced points with thoughtful counter-examples.'}
              {difficulty === 'Advanced' && 'More detailed reasoning and deeper discussions.'}
            </p>
          </div>

          {/* Round Timer Duration */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Round Timer Limit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[60, 90, 120].map((secs) => (
                <button
                  key={secs}
                  onClick={() => setRoundTimer(secs)}
                  className={`py-2 rounded-xl border text-center font-mono transition-all cursor-pointer ${
                    roundTimer === secs
                      ? 'border-purple-400 bg-purple-950/40 text-purple-300 font-bold'
                      : 'border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                  }`}
                >
                  {secs} seconds ({secs / 60}m)
                </button>
              ))}
            </div>
          </div>

          {/* Total Rounds */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Number of Rounds per Debate
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[3, 5].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setRoundCount(cnt)}
                  className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    roundCount === cnt
                      ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'border-[#1b254a] bg-[#0c1228] text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt} Rounds ({cnt === 3 ? 'Standard' : 'Extended'})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Audio */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span>Sound & Speech</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0c1228] border border-[#1b254a] text-xs">
          <div>
            <p className="font-semibold text-white">Voice Tone Previews</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enable simulated voice tone audio samples on AI character cards
            </p>
          </div>
          <input
            type="checkbox"
            checked={audioFeedback}
            onChange={(e) => setAudioFeedback(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};
