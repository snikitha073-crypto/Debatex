import { UserStats, PastDebate } from '../types/debate';

export const INITIAL_USER_STATS: UserStats = {
  username: '',
  totalDebates: 0,
  wins: 0,
  topicsExplored: [],
  favoriteOpponent: null,
  xp: 0,
  level: 1,
  achievements: [],
};

export const PAST_DEBATES: PastDebate[] = [];
