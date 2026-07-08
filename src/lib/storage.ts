import type { GameSession, DailyStreak } from '../data/types';

export const loadGameHistory = (): GameSession[] => {
  try {
    const saved = localStorage.getItem('pinyinGameHistory');
    if (saved) {
      let parsed: GameSession[] = JSON.parse(saved);
      let needsSave = false;
      parsed = parsed.map((s, index) => {
        if (!s.timestamp) {
          needsSave = true;
          return { ...s, timestamp: Date.now() - ((parsed.length - index) * 60 * 60 * 1000) };
        }
        return s;
      });
      if (needsSave) {
        saveGameHistory(parsed);
      }
      return parsed;
    }
  } catch(_e) {
    console.error("Failed to load history", _e);
  }
  return [];
};

export const saveGameHistory = (history: GameSession[]) => {
  localStorage.setItem('pinyinGameHistory', JSON.stringify(history));
};

export const loadDailyStreak = (): DailyStreak => {
  try {
    const saved = localStorage.getItem('pinyinDailyStreak');
    if (saved) return JSON.parse(saved);
  } catch(_e) {}
  return { count: 0, lastPlayedDate: '' };
};

export const saveDailyStreak = (streak: DailyStreak) => {
  localStorage.setItem('pinyinDailyStreak', JSON.stringify(streak));
};

export const loadNumberItem = (key: string, defaultValue: number = 0): number => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return parseInt(saved, 10);
  } catch(_e) {}
  return defaultValue;
};

export const saveNumberItem = (key: string, value: number) => {
  localStorage.setItem(key, value.toString());
};

export const loadUnlockedVocabs = (): string[] => {
  try {
    const saved = localStorage.getItem('pinyinUnlockedVocabs');
    if (saved) return JSON.parse(saved);
  } catch(_e) {}
  return [];
};

export const saveUnlockedVocabs = (vocabs: string[]) => {
  localStorage.setItem('pinyinUnlockedVocabs', JSON.stringify(vocabs));
};
