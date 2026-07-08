export type GameState = 'idle' | 'briefing' | 'playing' | 'finished' | 'stats' | 'reports' | 'autobattler' | 'vocabLearning' | 'vocabCollection';
export type GameLevel = 'level1' | 'level2' | 'pairs' | 'horde' | 'armored' | 'speed' | 'boss' | 'focus' | 'clones' | 'talisman' | 'guqin';
export type StatsViewMode = 'all' | 'single';
export type ActiveModule = 'initials' | 'finals' | 'tones';

export interface Question {
  correctAnswer: string;
  options: string[];
}

export interface MonsterState {
  hp: number;
  maxHp: number;
  name: string;
  type: 'horde' | 'armored' | 'speed' | 'boss' | 'clones' | 'talisman';
}

export interface GameSession {
  gameNumber: number;
  accuracy: number;
  totalAttempts: number;
  mistakes: string[];
  level: GameLevel;
  categoryId?: string;
  module?: ActiveModule;
  timestamp?: number;
}

export interface DailyStreak {
  count: number;
  lastPlayedDate: string;
}

export interface WeeklyReport {
  weekNumber: number;
  totalGames: number;
  accuracy: number;
  accuracyChange: number | null;
  archNemesis: [string, number] | null;
  mostImproved: { pinyin: string, improvement: number, pastMisses: number, currentMisses: number } | null;
  sessions: GameSession[];
  isCurrentWeek: boolean;
}

export interface DailyReport {
  isoString: string;
  displayDate: string;
  isToday: boolean;
  totalGames: number;
  accuracy: number;
  sessions: GameSession[];
  timestamp: number;
}

export interface ElectronAPI {
  saveData: (data: string) => void;
  loadData: () => Promise<{ success: boolean; data: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    webkitAudioContext?: typeof AudioContext;
  }
}

