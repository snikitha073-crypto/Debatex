import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeDashboard } from './components/home/HomeDashboard';
import { CharactersView } from './components/characters/CharactersView';
import { TopicsView } from './components/topics/TopicsView';
import { DebateArenaView, CustomDebateConfig } from './components/arena/DebateArenaView';
import { CreateDebateView } from './components/custom/CreateDebateView';
import { ProfileView } from './components/profile/ProfileView';
import { ProgressView } from './components/progress/ProgressView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { StartDebateModal } from './components/modals/StartDebateModal';
import { TranscriptModal } from './components/modals/TranscriptModal';
import { AuthModal } from './components/auth/AuthModal';
import { FirstTimeProfileSetupModal } from './components/modals/FirstTimeProfileSetupModal';
import { AI_CHARACTERS } from './data/characters';
import { DEBATE_TOPICS } from './data/topics';
import { INITIAL_USER_STATS } from './data/mockUserData';
import { Character, PastDebate, UserStats, UserProfile } from './types/debate';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>(undefined);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(undefined);
  const [preferredSide, setPreferredSide] = useState<string | undefined>(undefined);
  const [customConfig, setCustomConfig] = useState<CustomDebateConfig | undefined>(undefined);

  // Modals state
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTranscriptDebate, setActiveTranscriptDebate] = useState<PastDebate | null>(null);

  // First-time welcoming profile setup modal (shown only to genuinely new users who haven't saved or dismissed)
  const [isFirstTimeSetupOpen, setIsFirstTimeSetupOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('debatex_user');
      const dismissed = localStorage.getItem('debatex_setup_dismissed');
      if (dismissed) return false;
      if (!saved) return true;
      const parsed = JSON.parse(saved);
      const isLegacy =
        (parsed?.username === 'alex' && parsed?.displayName === 'Alex Vance') ||
        parsed?.id === 'user-default-1';
      if (isLegacy) {
        localStorage.removeItem('debatex_user');
        return true;
      }
      if (!parsed?.username && !parsed?.displayName && !parsed?.avatar) {
        return true;
      }
    } catch (e) {}
    return false;
  });

  // Current authenticated user (blank by default for new users; preserved if saved)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('debatex_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If it was the legacy auto-seeded starter "alex" / "Alex Vance", ignore it so genuine new user is blank
          const isLegacyStarter =
            (parsed.username === 'alex' && parsed.displayName === 'Alex Vance') ||
            parsed.id === 'user-default-1';

          if (isLegacyStarter) {
            localStorage.removeItem('debatex_user');
          } else if (parsed.username || parsed.displayName || parsed.avatar) {
            return {
              username: typeof parsed.username === 'string' ? parsed.username : '',
              displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
              avatar: parsed.avatar || null,
              bio: typeof parsed.bio === 'string' ? parsed.bio : '',
            };
          }
        }
      }
    } catch (e) {
      // ignore
    }
    // Genuinely new user starts completely blank: picture null, displayName "", username ""
    return {
      username: '',
      displayName: '',
      avatar: null,
      bio: '',
    };
  });

  // User stats & past debates (starts strictly at 0 - no fake data)
  const [pastDebates, setPastDebates] = useState<PastDebate[]>(() => {
    try {
      const saved = localStorage.getItem('debatex_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('debatex_stats');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_USER_STATS;
  });

  // Fetch initial profile and stats from server if available (only for existing users with username)
  useEffect(() => {
    if (!currentUser.username) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${currentUser.username}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const syncedUser = {
              username: data.user.username,
              displayName: data.user.displayName || '',
              avatar: data.user.avatar || '',
              bio: data.user.bio || '',
            };
            setCurrentUser(syncedUser);
            localStorage.setItem('debatex_user', JSON.stringify(syncedUser));

            if (data.user.stats) {
              setUserStats(data.user.stats);
              localStorage.setItem('debatex_stats', JSON.stringify(data.user.stats));
            }
            if (Array.isArray(data.user.debates)) {
              setPastDebates(data.user.debates);
              localStorage.setItem('debatex_history', JSON.stringify(data.user.debates));
            }
          }
        }
      } catch (err) {
        // Fallback to local storage
      }
    };
    fetchUser();
  }, [currentUser.username]);

  // Handle dedicated Username Update
  // Handle dedicated Username Update
  const handleUpdateUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    const cleanOld = currentUser.username;
    const cleanNew = newUsername.trim().toLowerCase().replace(/[\s\t\n]+/g, '_');

    if (!cleanNew) {
      return { success: false, error: 'Username cannot be empty. Please enter a valid username.' };
    }
    if (cleanNew.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long.' };
    }
    if (!/^[a-z0-9_-]+$/.test(cleanNew)) {
      return { success: false, error: 'Username can only contain letters, numbers, underscores, and hyphens.' };
    }
    if (cleanNew === cleanOld) {
      return { success: true };
    }

    try {
      // If cleanOld is empty (new user saving their username for the first time), use /api/user/save-profile
      // to avoid 404 on /api/user//username!
      const endpoint = cleanOld ? `/api/user/${cleanOld}/username` : '/api/user/save-profile';
      const method = cleanOld ? 'PUT' : 'POST';
      const body = cleanOld
        ? JSON.stringify({ newUsername: cleanNew })
        : JSON.stringify({
            oldUsername: '',
            username: cleanNew,
            displayName: currentUser.displayName,
            avatar: currentUser.avatar || '',
            bio: currentUser.bio,
          });

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update username.' };
      }

      // Update state and persistent storage immediately
      const updatedUser: UserProfile = {
        ...currentUser,
        username: cleanNew,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('debatex_user', JSON.stringify(updatedUser));
      } catch (e) {}

      // Also update userStats if username is stored there
      setUserStats((prev) => {
        const updatedStats = { ...prev, username: cleanNew };
        try {
          localStorage.setItem('debatex_stats', JSON.stringify(updatedStats));
        } catch (e) {}
        return updatedStats;
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating username.' };
    }
  };

  // Handle full Profile Update (display name, bio, avatar, optional username)
  const handleUpdateProfile = async (updated: {
    displayName?: string;
    bio?: string;
    avatar?: string | null;
    username?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const oldUsername = currentUser.username;
    const targetUsername =
      updated.username !== undefined && updated.username.trim()
        ? updated.username.trim().toLowerCase().replace(/[\s\t\n]+/g, '_')
        : oldUsername;

    const newUserData: UserProfile = {
      username: targetUsername,
      displayName: updated.displayName !== undefined ? updated.displayName : currentUser.displayName,
      bio: updated.bio !== undefined ? updated.bio : currentUser.bio,
      avatar: updated.avatar !== undefined ? updated.avatar : currentUser.avatar,
    };

    setCurrentUser(newUserData);
    try {
      localStorage.setItem('debatex_user', JSON.stringify(newUserData));
    } catch (e) {}

    try {
      const res = await fetch('/api/user/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUsername: oldUsername || undefined,
          username: targetUsername || undefined,
          displayName: newUserData.displayName,
          bio: newUserData.bio,
          avatar: newUserData.avatar || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile.' };
      }

      if (data.user) {
        const synced: UserProfile = {
          username: data.user.username || targetUsername,
          displayName: data.user.displayName !== undefined ? data.user.displayName : newUserData.displayName,
          bio: data.user.bio !== undefined ? data.user.bio : newUserData.bio,
          avatar: data.user.avatar !== undefined ? data.user.avatar : newUserData.avatar,
        };
        setCurrentUser(synced);
        try {
          localStorage.setItem('debatex_user', JSON.stringify(synced));
        } catch (e) {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: true };
    }
  };

  const handleRecordCompletedDebate = async (newRecord: PastDebate) => {
    const updatedHistory = [newRecord, ...pastDebates];
    setPastDebates(updatedHistory);
    try {
      localStorage.setItem('debatex_history', JSON.stringify(updatedHistory));
    } catch (e) {
      // ignore
    }

    // Update real user statistics
    const totalDebates = userStats.totalDebates + 1;
    const wins = userStats.wins + (newRecord.outcome === 'Won' ? 1 : 0);
    const xp = userStats.xp + 100;
    const level = Math.floor(xp / 200) + 1;

    // Unique topics explored
    const topicsExplored = userStats.topicsExplored.includes(newRecord.topicTitle)
      ? userStats.topicsExplored
      : [...userStats.topicsExplored, newRecord.topicTitle];

    // Favorite opponent calculation from real history
    const opponentCounts: Record<string, number> = {};
    updatedHistory.forEach((d) => {
      opponentCounts[d.characterName] = (opponentCounts[d.characterName] || 0) + 1;
    });
    let favOpponent = userStats.favoriteOpponent;
    let maxCount = 0;
    Object.entries(opponentCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favOpponent = name;
      }
    });

    // Genuine unlocked achievements
    const achievements = [...userStats.achievements];
    if (totalDebates === 1 && !achievements.some((a) => a.id === 'first-debate')) {
      achievements.push({
        id: 'first-debate',
        title: 'First Debate',
        description: 'Completed your very first debate in the arena!',
        unlockedAt: 'Just now',
        icon: 'Play',
      });
    }
    if (topicsExplored.length >= 3 && !achievements.some((a) => a.id === 'curious-explorer')) {
      achievements.push({
        id: 'curious-explorer',
        title: 'Curious Explorer',
        description: 'Explored 3 different debate topics!',
        unlockedAt: 'Just now',
        icon: 'Compass',
      });
    }
    if (totalDebates >= 3 && !achievements.some((a) => a.id === 'three-debates')) {
      achievements.push({
        id: 'three-debates',
        title: 'Arena Regular',
        description: 'Completed 3 full debates!',
        unlockedAt: 'Just now',
        icon: 'Trophy',
      });
    }

    const updatedStats: UserStats = {
      ...userStats,
      totalDebates,
      wins,
      xp,
      level,
      topicsExplored,
      favoriteOpponent: favOpponent,
      achievements,
    };

    setUserStats(updatedStats);
    try {
      localStorage.setItem('debatex_stats', JSON.stringify(updatedStats));
    } catch (e) {
      // ignore
    }

    // Sync to backend persistent DB if username exists
    if (currentUser.username) {
      try {
        await fetch(`/api/user/${currentUser.username}/debate-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const handleLoginSuccess = (user: any) => {
    const userProfile = {
      username: user.username,
      displayName: user.displayName || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
    };
    setCurrentUser(userProfile);
    try {
      localStorage.setItem('debatex_user', JSON.stringify(userProfile));
    } catch (e) {}

    if (user.stats) {
      setUserStats(user.stats);
      try {
        localStorage.setItem('debatex_stats', JSON.stringify(user.stats));
      } catch (e) {}
    }
    if (Array.isArray(user.debates)) {
      setPastDebates(user.debates);
      try {
        localStorage.setItem('debatex_history', JSON.stringify(user.debates));
      } catch (e) {}
    }
  };

  // Handlers
  const handleOpenStartDebate = (characterId?: string, topicId?: string) => {
    if (characterId) setSelectedCharacterId(characterId);
    if (topicId) setSelectedTopicId(topicId);
    setCustomConfig(undefined);
    setIsStartModalOpen(true);
  };

  const handleConfirmStartDebate = (charId: string, topId: string, side: string) => {
    setSelectedCharacterId(charId);
    setSelectedTopicId(topId);
    setPreferredSide(side);
    setCustomConfig(undefined);
    setCurrentTab('arena');
  };

  const handleStartCustomDebate = (config: CustomDebateConfig) => {
    setCustomConfig(config);
    setCurrentTab('arena');
  };

  const handleSelectCharacterForDebate = (char: Character) => {
    setSelectedCharacterId(char.id);
  };

  const handleStartWithTopic = (topicId: string, side?: string) => {
    setSelectedTopicId(topicId);
    if (side) setPreferredSide(side);
    setCustomConfig(undefined);
    setCurrentTab('arena');
  };

  const handleRematch = (characterId?: string) => {
    if (characterId) setSelectedCharacterId(characterId);
    setCustomConfig(undefined);
    setCurrentTab('arena');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-purple-600/30 selection:text-cyan-300">
      {/* Sidebar with dynamic level and updated username */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'arena') setCustomConfig(undefined);
          setCurrentTab(tab);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userStats={userStats}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onStartDebate={() => handleOpenStartDebate()}
          level={userStats.level}
          debatesCount={userStats.totalDebates}
          userAvatar={currentUser.avatar}
          userName={currentUser.displayName}
          userHandle={currentUser.username}
          onNavigateToProfile={() => setCurrentTab('profile')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <HomeDashboard
              characters={AI_CHARACTERS}
              topics={DEBATE_TOPICS}
              userStats={userStats}
              onStartDebate={(charId, topicId) => {
                if (charId) setSelectedCharacterId(charId);
                if (topicId) setSelectedTopicId(topicId);
                setCustomConfig(undefined);
                setCurrentTab('arena');
              }}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onSelectCharacterDetail={handleSelectCharacterForDebate}
            />
          )}

          {currentTab === 'arena' && (
            <DebateArenaView
              characters={AI_CHARACTERS}
              topics={DEBATE_TOPICS}
              selectedCharacterId={selectedCharacterId}
              selectedTopicId={selectedTopicId}
              preferredSide={preferredSide}
              customConfig={customConfig}
              currentUser={currentUser}
              onRecordCompletedDebate={handleRecordCompletedDebate}
              onGoToCustomCreator={() => setCurrentTab('custom')}
            />
          )}

          {currentTab === 'custom' && (
            <CreateDebateView
              characters={AI_CHARACTERS}
              onStartCustomDebate={handleStartCustomDebate}
            />
          )}

          {currentTab === 'characters' && (
            <CharactersView
              characters={AI_CHARACTERS}
              selectedCharacterId={selectedCharacterId}
              onSelectCharacter={handleSelectCharacterForDebate}
              onStartDebate={(charId) => {
                setSelectedCharacterId(charId);
                setCustomConfig(undefined);
                setCurrentTab('arena');
              }}
            />
          )}

          {currentTab === 'topics' && (
            <TopicsView
              topics={DEBATE_TOPICS}
              onStartDebateWithTopic={handleStartWithTopic}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              userStats={userStats}
              debates={pastDebates}
              onUpdateProfile={handleUpdateProfile}
              onUpdateUsername={handleUpdateUsername}
              onOpenTranscript={(deb) => setActiveTranscriptDebate(deb)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              userStats={userStats}
              onStartDebate={() => setCurrentTab('arena')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              debates={pastDebates}
              onStartDebate={handleRematch}
              onOpenTranscriptModal={(deb) => setActiveTranscriptDebate(deb)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>

        {/* Global Footer with Creator Credit: Made by Snikitha */}
        <Footer />
      </div>

      {/* Modals */}
      <StartDebateModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        characters={AI_CHARACTERS}
        topics={DEBATE_TOPICS}
        initialCharacterId={selectedCharacterId}
        initialTopicId={selectedTopicId}
        onConfirmStart={handleConfirmStartDebate}
      />

      <TranscriptModal
        debate={activeTranscriptDebate}
        onClose={() => setActiveTranscriptDebate(null)}
        onRematch={handleRematch}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Welcoming First-Time Profile Setup Screen for New Users */}
      <FirstTimeProfileSetupModal
        isOpen={isFirstTimeSetupOpen}
        onClose={() => {
          setIsFirstTimeSetupOpen(false);
          try {
            localStorage.setItem('debatex_setup_dismissed', 'true');
          } catch (e) {}
        }}
        onSaveProfile={async (profile) => {
          const res = await handleUpdateProfile({
            displayName: profile.displayName,
            username: profile.username,
            avatar: profile.avatar,
            bio: currentUser.bio || '',
          });
          try {
            localStorage.setItem('debatex_setup_dismissed', 'true');
          } catch (e) {}
          return res;
        }}
      />
    </div>
  );
}
