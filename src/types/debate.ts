export type TopicCategory =
  | 'Education'
  | 'Technology'
  | 'Lifestyle'
  | 'Food'
  | 'Environment'
  | 'Custom';

export interface CharacterColorTheme {
  primary: string;
  accent: string;
  glow: string;
  bgGlow: string;
  badge: string;
  border: string;
}

export interface Character {
  id: string;
  name: string;
  motto: string;
  tagline: string;
  iconName: 'Atom' | 'Flame' | 'Cpu' | 'Scale' | 'Palette' | 'Microscope';
  speciality: string;
  description: string;
  avatarUrl: string;
  colorTheme: CharacterColorTheme;
  stats: {
    winRate: number;
    totalDebates: number;
    analyticalDepth: number;
    rhetoricalForce: number;
    adaptability: number;
  };
  philosophicalArchetype: string;
  signatureQuote: string;
  preferredTopics: TopicCategory[];
  debateStyle: string;
  voiceTone: string;
}

export interface Topic {
  id: string;
  category: TopicCategory;
  title: string;
  question: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sideA: string;
  sideB: string;
  trending?: boolean;
}

export interface DebateMessage {
  id: string;
  sender: 'user' | 'character' | 'moderator';
  text: string;
  timestamp: string;
  roundNumber: number;
  roundName: string;
}

export interface PastDebate {
  id: string;
  date: string;
  characterId: string;
  characterName: string;
  characterAvatar: string;
  topicTitle: string;
  category?: TopicCategory;
  userStance?: string;
  outcome: 'Won' | 'Completed' | 'Draw';
  summary: string;
  messages?: DebateMessage[];
}

export interface UserStats {
  username: string;
  totalDebates: number;
  wins: number;
  topicsExplored: string[];
  favoriteOpponent: string | null;
  xp: number;
  level: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
    icon: string;
  }>;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
}

