'use client';

import { useMemo, useCallback, useEffect } from 'react';
import type { GameSession, WeeklyReport, DailyReport } from '../data/types';

// Helper to get local ISO date string
const getLocalISOString = (date: Date) => {
   const yyyy = date.getFullYear();
   const mm = String(date.getMonth() + 1).padStart(2, '0');
   const dd = String(date.getDate()).padStart(2, '0');
   return `${yyyy}-${mm}-${dd}`;
};

export function useStats(
  gameHistory: GameSession[],
  hasLoaded: boolean,
  checkWeeklyPopup: (history: GameSession[], calcFn: (h: GameSession[]) => WeeklyReport[]) => void,
  calendarWeekOffset: number
) {
  // Calculate weekly reports from game history
  const calculateWeeklyReports = useCallback((history: GameSession[]): WeeklyReport[] => {
    if (history.length === 0) return [];
    
    const sorted = [...history].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    const firstDate = new Date(sorted[0].timestamp || Date.now());
    const day = firstDate.getDay(); 
    const diffToMonday = firstDate.getDate() - day + (day === 0 ? -6 : 1);
    const firstMonday = new Date(firstDate.setDate(diffToMonday));
    firstMonday.setHours(0,0,0,0);
    const firstGameTime = firstMonday.getTime();
    const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    const weeksData: Record<number, GameSession[]> = {};
    sorted.forEach(session => {
      const ts = session.timestamp || Date.now();
      const weekIndex = Math.floor((ts - firstGameTime) / MS_PER_WEEK) + 1;
      if (!weeksData[weekIndex]) weeksData[weekIndex] = [];
      weeksData[weekIndex].push(session);
    });
    
    const reports: WeeklyReport[] = [];
    const weekNumbers = Object.keys(weeksData).map(Number).sort((a,b)=>a-b);
    const currentTs = Date.now();
    const currentWeekIndex = Math.floor((currentTs - firstGameTime) / MS_PER_WEEK) + 1;
    
    for (let i = 0; i < weekNumbers.length; i++) {
      const weekNum = weekNumbers[i];
      const sessions = weeksData[weekNum];
      const prevSessions = i > 0 ? weeksData[weekNumbers[i-1]] : null;
      
      const acc = sessions.length > 0 ? sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length : 0;
      const prevAcc = prevSessions && prevSessions.length > 0 ? prevSessions.reduce((acc, s) => acc + s.accuracy, 0) / prevSessions.length : null;
      
      const mistakesCount: Record<string, number> = {};
      sessions.forEach(s => s.mistakes.forEach(m => {
         mistakesCount[m] = (mistakesCount[m] || 0) + 1;
      }));
      
      const sortedMistakes = Object.entries(mistakesCount).sort((a, b) => b[1] - a[1]);
      const archNemesis = sortedMistakes.length > 0 ? sortedMistakes[0] : null;
      
      let mostImproved = null;
      if (prevSessions) {
         const prevMistakesCount: Record<string, number> = {};
         prevSessions.forEach(s => s.mistakes.forEach(m => {
            prevMistakesCount[m] = (prevMistakesCount[m] || 0) + 1;
         }));
         
         let maxImprovement = 0;
         for (const pinyin in prevMistakesCount) {
            const pastMisses = prevMistakesCount[pinyin];
            const currentMisses = mistakesCount[pinyin] || 0;
            const improvement = pastMisses - currentMisses;
            if (improvement > maxImprovement && pastMisses > 1) { 
               maxImprovement = improvement;
               mostImproved = { pinyin, improvement, pastMisses, currentMisses };
            }
         }
      }
      
      reports.push({
         weekNumber: weekNum,
         totalGames: sessions.length,
         accuracy: Math.round(acc),
         accuracyChange: prevAcc ? Math.round(acc - prevAcc) : null,
         archNemesis,
         mostImproved,
         sessions,
         isCurrentWeek: weekNum === currentWeekIndex
      });
    }
    return reports.reverse();
  }, []);

  // Trigger weekly popup check
  useEffect(() => {
    if (hasLoaded && gameHistory.length > 0) {
      checkWeeklyPopup(gameHistory, calculateWeeklyReports);
    }
  }, [hasLoaded, gameHistory, checkWeeklyPopup, calculateWeeklyReports]);

  // Daily reports map (keyed by ISO date string)
  const dailyReportsMap = useMemo(() => {
    const map: Record<string, DailyReport> = {};
    if (gameHistory.length === 0) return map;
    
    const today = new Date();
    const todayStr = getLocalISOString(today);
    const todayTs = today.getTime();
    gameHistory.forEach(session => {
      const ts = session.timestamp || todayTs;
      const date = new Date(ts);
      const isoString = getLocalISOString(date);
      
      if (!map[isoString]) {
        map[isoString] = {
           isoString,
           displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
           isToday: isoString === todayStr,
           totalGames: 0,
           accuracy: 0,
           sessions: [],
           timestamp: ts
        };
      }
      map[isoString].sessions.push(session);
    });
    
    Object.keys(map).forEach(key => {
       const sessions = map[key].sessions;
       map[key].totalGames = sessions.length;
       const sumAcc = sessions.reduce((acc, s) => acc + s.accuracy, 0);
       map[key].accuracy = Math.round(sumAcc / sessions.length);
    });
    return map;
  }, [gameHistory]);

  // Calendar week dates
  const getWeekDates = (offset: number) => {
     const today = new Date();
     today.setHours(0,0,0,0);
     const day = today.getDay(); 
     const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
     
     const monday = new Date(today.setDate(diffToMonday));
     monday.setDate(monday.getDate() + (offset * 7));
     
     const weekDays = [];
     for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isoString = getLocalISOString(d);
        weekDays.push({
           date: d,
           isoString,
           dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
           dateNum: d.getDate(),
           isToday: isoString === getLocalISOString(new Date())
        });
     }
     return weekDays;
  };

  const currentWeekDates = useMemo(() => getWeekDates(calendarWeekOffset), [calendarWeekOffset]);
  const weeklyChartData = useMemo(() => {
     return currentWeekDates.map(wd => {
        const report = dailyReportsMap[wd.isoString];
        return {
           name: wd.dayName,
           fullDate: wd.isoString,
           accuracy: report ? report.accuracy : 0,
           hasData: !!report
        };
     });
  }, [currentWeekDates, dailyReportsMap]);

  // Get accuracy for a specific category
  const getCategoryAccuracy = (categoryId: string) => {
    const rawId = categoryId.replace('focus-', '');
    const games = gameHistory.filter(g => String(g.categoryId) === categoryId || String(g.categoryId) === rawId);
    if (games.length === 0) return null;
    const totalAccuracy = games.reduce((acc, curr) => acc + curr.accuracy, 0);
    return Math.round(totalAccuracy / games.length);
  };
  
  // Get play count for a specific category
  const getCategoryPlayCount = (categoryId: string) => {
    const rawId = categoryId.replace('focus-', '');
    const games = gameHistory.filter(g => String(g.categoryId) === categoryId || String(g.categoryId) === rawId);
    return games.length;
  };

  // Check if training is complete for a specific module
  const isTrainingComplete = useCallback((activeModule: string, focusedSets: Array<{ id: number | string }>) => {
     let isComplete = true;
     const totalRequired = focusedSets.length;
     let completed = 0;
     
     for (const set of focusedSets) {
        const focusId = `focus-${set.id}`;
        const playCount = getCategoryPlayCount(focusId);
        const accuracy = getCategoryAccuracy(focusId);
        
        if (playCount >= 2 && accuracy !== null && accuracy >= 70) {
           completed++;
        } else {
           isComplete = false;
        }
     }
     
     return {
        isComplete,
        completed,
        totalRequired
     };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameHistory, getCategoryPlayCount, getCategoryAccuracy]);

  // Get daily mistakes analysis for a specific date
  const getDailyMistakesAnalysis = (isoString: string) => {
     const report = dailyReportsMap[isoString];
     if (!report || report.sessions.length === 0) return null;
     
     const currentMistakes: Record<string, number> = {};
     report.sessions.forEach(s => s.mistakes.forEach(m => {
        currentMistakes[m] = (currentMistakes[m] || 0) + 1;
     }));
     
     const d = new Date(isoString);
     d.setDate(d.getDate() - 1);
     const yesterdayIso = getLocalISOString(d);
     const yesterdayReport = dailyReportsMap[yesterdayIso];
     
     const prevMistakes: Record<string, number> = {};
     if (yesterdayReport) {
        yesterdayReport.sessions.forEach(s => s.mistakes.forEach(m => {
           prevMistakes[m] = (prevMistakes[m] || 0) + 1;
        }));
     }
     
     return Object.entries(currentMistakes)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5)
       .map(([pinyin, count]) => {
          const prevCount = prevMistakes[pinyin] || 0;
          let trend = 'neutral';
          if (prevCount > 0) {
             if (count < prevCount) trend = 'better';
             else if (count > prevCount) trend = 'worse';
          } else if (count > 0 && yesterdayReport) {
             trend = 'worse'; 
          }
          return { pinyin, count, prevCount, trend };
       });
  };

  const weeklyReports = calculateWeeklyReports(gameHistory);

  return {
    getLocalISOString,
    calculateWeeklyReports,
    dailyReportsMap,
    currentWeekDates,
    weeklyChartData,
    getCategoryAccuracy,
    getCategoryPlayCount,
    isTrainingComplete,
    getDailyMistakesAnalysis,
    weeklyReports
  };
}
