import type { GameSession } from '../data/types';

// Utility: Format Pinyin
export const formatPinyin = (pinyin: string) => {
  if (pinyin === 'TIMEOUT') return pinyin;
  if (pinyin === 'a1') return 'ā (เสียง 1 ˉ)';
  if (pinyin === 'a2') return 'á (เสียง 2 ˊ)';
  if (pinyin === 'a3') return 'ǎ (เสียง 3 ˇ)';
  if (pinyin === 'a4') return 'à (เสียง 4 ˋ)';
  return pinyin.replace(/v/g, 'ü');
};

// Utility: Fisher-Yates shuffle algorithm
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Utility: Calculate trends from history
export const getPinyinTrends = (historyToAnalyze: GameSession[]) => {
  const counts: Record<string, { total: number, recent: number, past: number }> = {};
  const midPoint = Math.floor(historyToAnalyze.length / 2);
  
  historyToAnalyze.forEach((session, idx) => {
    const isRecent = idx >= midPoint;
    session.mistakes.forEach(p => {
      if (!counts[p]) counts[p] = { total: 0, recent: 0, past: 0 };
      counts[p].total++;
      if (isRecent) counts[p].recent++;
      else counts[p].past++;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([pinyin, data]) => {
       let trend: 'improving' | 'worsening' | 'neutral' = 'neutral';
       if (data.recent > data.past) trend = 'worsening';
       if (data.recent < data.past) trend = 'improving';
       if (historyToAnalyze.length < 2) trend = 'neutral';
       return { pinyin, ...data, trend };
    });
};
