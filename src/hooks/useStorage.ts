import { useState, useEffect } from 'react';
import type { GameSession, DailyStreak, ActiveModule, WeeklyReport } from '../data/types';

// In-memory cache to replace localStorage synchronous behavior
const storageCache: Record<string, string> = {};

// Helper to save entire cache to disk
const syncToDisk = () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    window.electronAPI.saveData(JSON.stringify(storageCache));
  } else if (typeof window !== 'undefined') {
    // Fallback to localStorage if running in browser
    Object.keys(storageCache).forEach(key => {
      localStorage.setItem(key, storageCache[key]);
    });
  }
};

const diskSetItem = (key: string, value: string) => {
  storageCache[key] = value;
  syncToDisk();
};

const diskGetItem = (key: string) => {
  return storageCache[key] || null;
};

const diskRemoveItem = (key: string) => {
  delete storageCache[key];
  syncToDisk();
};

export function useStorage() {
  const [gameHistory, setGameHistory] = useState<GameSession[]>([]);
  const [perfectStreakInitials, setPerfectStreakInitials] = useState(0);
  const [perfectStreakFinals, setPerfectStreakFinals] = useState(0);
  const [perfectStreakTones, setPerfectStreakTones] = useState(0);
  const [dailyStreak, setDailyStreak] = useState<DailyStreak>({ count: 0, lastPlayedDate: '' });
  
  const [expInitials, setExpInitials] = useState(0);
  const [sectPointsInitials, setSectPointsInitials] = useState(0);
  const [expFinals, setExpFinals] = useState(0);
  const [sectPointsFinals, setSectPointsFinals] = useState(0);
  const [expTones, setExpTones] = useState(0);
  const [sectPointsTones, setSectPointsTones] = useState(0);
  const [completedSetsInitials, setCompletedSetsInitials] = useState<number[]>([]);
  const [completedSetsFinals, setCompletedSetsFinals] = useState<number[]>([]);
  const [completedSetsTones, setCompletedSetsTones] = useState<number[]>([]);
  
  const [bossLevelInitials, setBossLevelInitials] = useState(1);
  const [bossLevelFinals, setBossLevelFinals] = useState(1);
  const [bossLevelTones, setBossLevelTones] = useState(1);
  const [raidKeys, setRaidKeys] = useState(0);
  
  const [unlockedVocabs, setUnlockedVocabs] = useState<string[]>([]);

  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Expose this so page.tsx can trigger the check
  const checkWeeklyPopup = (history: GameSession[], calculateWeeklyReports: (h: GameSession[]) => WeeklyReport[]) => {
    const lastPopup = diskGetItem('lastWeeklyReportWeek');
    const reports = calculateWeeklyReports(history);
    if (reports.length > 0) {
       const latestWeek = reports[0].weekNumber;
       if (reports.length > 1 && lastPopup !== latestWeek.toString()) {
          setShowWeeklyPopup(true);
          diskSetItem('lastWeeklyReportWeek', latestWeek.toString());
       }
    }
  };

  useEffect(() => {
    const loadFromDisk = async () => {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          const result = await window.electronAPI.loadData();
          if (result && result.success && result.data) {
            try {
              Object.assign(storageCache, JSON.parse(result.data));
            } catch {
              console.warn("Corrupted save file detected, starting fresh.");
              // Overwrite the corrupted file immediately with empty cache
              window.electronAPI.saveData(JSON.stringify({}));
            }
          }
        } else if (typeof window !== 'undefined') {
           // Fallback loading from localStorage
           for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) storageCache[key] = localStorage.getItem(key) || '';
           }
        }

        let parsedHistory: GameSession[] = [];
        const savedHistory = diskGetItem('pinyinGameHistory');
        if (savedHistory) {
          try {
            let parsed: GameSession[] = JSON.parse(savedHistory);
            let needsSave = false;
            parsed = parsed.map((s, index) => {
              if (!s.timestamp) {
                needsSave = true;
                return { ...s, timestamp: Date.now() - ((parsed.length - index) * 60 * 60 * 1000) };
              }
              return s;
            });
            setGameHistory(parsed);
            if (needsSave) diskSetItem('pinyinGameHistory', JSON.stringify(parsed));
            parsedHistory = parsed;
          } catch {
            console.warn("Corrupted game history detected, resetting history.");
          }
        }
        
        const savedStreakInitials = diskGetItem('pinyinPerfectStreakInitials');
        if (savedStreakInitials) setPerfectStreakInitials(parseInt(savedStreakInitials, 10));

        const savedStreakFinals = diskGetItem('pinyinPerfectStreakFinals');
        if (savedStreakFinals) setPerfectStreakFinals(parseInt(savedStreakFinals, 10));
        
        const savedStreakTones = diskGetItem('pinyinPerfectStreakTones');
        if (savedStreakTones) setPerfectStreakTones(parseInt(savedStreakTones, 10));
        
        const savedDaily = diskGetItem('pinyinDailyStreak');
        if (savedDaily) setDailyStreak(JSON.parse(savedDaily));
        
        let initialCompletedInitials: number[] = [];
        const savedCompletedInitials = diskGetItem('pinyinCompletedSetsInitials');
        if (savedCompletedInitials) initialCompletedInitials = JSON.parse(savedCompletedInitials);
        
        let initialCompletedFinals: number[] = [];
        const savedCompletedFinals = diskGetItem('pinyinCompletedSetsFinals');
        if (savedCompletedFinals) initialCompletedFinals = JSON.parse(savedCompletedFinals);

        let initialCompletedTones: number[] = [];
        const savedCompletedTones = diskGetItem('pinyinCompletedSetsTones');
        if (savedCompletedTones) initialCompletedTones = JSON.parse(savedCompletedTones);
      
        const savedUnlockedVocabs = diskGetItem('pinyinUnlockedVocabs');
        if (savedUnlockedVocabs) setUnlockedVocabs(JSON.parse(savedUnlockedVocabs));
      
      // MIGRATION: Restore completed focus sets from gameHistory if they are missing
      const initialsSet = new Set<number>(initialCompletedInitials);
      const finalsSet = new Set<number>(initialCompletedFinals);
      const tonesSet = new Set<number>(initialCompletedTones);
      let needsCompletedSave = false;

      parsedHistory.forEach(s => {
         if (s.categoryId && s.categoryId.startsWith('focus-') && s.accuracy >= 60) {
            const setId = parseInt(s.categoryId.replace('focus-', ''), 10);
            if (!isNaN(setId)) {
               if (s.module === 'initials' && !initialsSet.has(setId)) {
                  initialsSet.add(setId);
                  needsCompletedSave = true;
               } else if (s.module === 'finals' && !finalsSet.has(setId)) {
                  finalsSet.add(setId);
                  needsCompletedSave = true;
               } else if (s.module === 'tones' && !tonesSet.has(setId)) {
                  tonesSet.add(setId);
                  needsCompletedSave = true;
               }
            }
         }
      });

      const finalCompletedInitials = Array.from(initialsSet);
      const finalCompletedFinals = Array.from(finalsSet);
      const finalCompletedTones = Array.from(tonesSet);
      
      setCompletedSetsInitials(finalCompletedInitials);
      setCompletedSetsFinals(finalCompletedFinals);
      setCompletedSetsTones(finalCompletedTones);

      if (needsCompletedSave) {
         diskSetItem('pinyinCompletedSetsInitials', JSON.stringify(finalCompletedInitials));
         diskSetItem('pinyinCompletedSetsFinals', JSON.stringify(finalCompletedFinals));
         diskSetItem('pinyinCompletedSetsTones', JSON.stringify(finalCompletedTones));
      }
      
      let loadedExpInitials = 0;
      let loadedExpFinals = 0;
      let loadedExpTones = 0;

      const savedExpI = diskGetItem('pinyinExpInitials');
      if (savedExpI) loadedExpInitials = parseInt(savedExpI, 10);
      
      const savedExpF = diskGetItem('pinyinExpFinals');
      if (savedExpF) loadedExpFinals = parseInt(savedExpF, 10);

      const savedExpT = diskGetItem('pinyinExpTones');
      if (savedExpT) loadedExpTones = parseInt(savedExpT, 10);

      // MIGRATION: If old core/focus exp exists, merge them into the main exp and delete old keys
      const savedCoreI = diskGetItem('pinyinExpCoreInitials');
      const savedFocusI = diskGetItem('pinyinExpFocusInitials');
      if (savedCoreI || savedFocusI) {
         loadedExpInitials += (parseInt(savedCoreI || '0', 10) + parseInt(savedFocusI || '0', 10));
         diskSetItem('pinyinExpInitials', loadedExpInitials.toString());
         diskRemoveItem('pinyinExpCoreInitials');
         diskRemoveItem('pinyinExpFocusInitials');
      }

      const savedCoreF = diskGetItem('pinyinExpCoreFinals');
      const savedFocusF = diskGetItem('pinyinExpFocusFinals');
      if (savedCoreF || savedFocusF) {
         loadedExpFinals += (parseInt(savedCoreF || '0', 10) + parseInt(savedFocusF || '0', 10));
         diskSetItem('pinyinExpFinals', loadedExpFinals.toString());
         diskRemoveItem('pinyinExpCoreFinals');
         diskRemoveItem('pinyinExpFocusFinals');
      }

      setExpInitials(loadedExpInitials);
      setExpFinals(loadedExpFinals);
      setExpTones(loadedExpTones);

      const savedSectI = diskGetItem('pinyinSectPointsInitials');
      if (savedSectI) setSectPointsInitials(parseInt(savedSectI, 10));

      const savedSectF = diskGetItem('pinyinSectPointsFinals');
      if (savedSectF) setSectPointsFinals(parseInt(savedSectF, 10));

      const savedSectT = diskGetItem('pinyinSectPointsTones');
      if (savedSectT) setSectPointsTones(parseInt(savedSectT, 10));
      
      const bInit = diskGetItem('bossLevelInitials');
      if (bInit) setBossLevelInitials(parseInt(bInit, 10));
      const bFin = diskGetItem('bossLevelFinals');
      if (bFin) setBossLevelFinals(parseInt(bFin, 10));
      const bTon = diskGetItem('bossLevelTones');
      if (bTon) setBossLevelTones(parseInt(bTon, 10));
      

      const savedKeys = diskGetItem('pinyinRaidKeys');
      if (savedKeys) setRaidKeys(parseInt(savedKeys, 10));
      
      setHasLoaded(true);
    } catch (e) {
      console.error("Failed to load stats from disk/storage", e);
    }
  };
  
  loadFromDisk();
  }, []);

  const saveExp = (newExp: number, module: ActiveModule) => {
    if (module === 'initials') {
      setExpInitials(newExp);
      diskSetItem('pinyinExpInitials', newExp.toString());
    } else if (module === 'finals') {
      setExpFinals(newExp);
      diskSetItem('pinyinExpFinals', newExp.toString());
    } else {
      setExpTones(newExp);
      diskSetItem('pinyinExpTones', newExp.toString());
    }
  };

  const saveSectPoints = (newPoints: number, module: ActiveModule) => {
    if (module === 'initials') {
      setSectPointsInitials(newPoints);
      diskSetItem('pinyinSectPointsInitials', newPoints.toString());
    } else if (module === 'finals') {
      setSectPointsFinals(newPoints);
      diskSetItem('pinyinSectPointsFinals', newPoints.toString());
    } else {
      setSectPointsTones(newPoints);
      diskSetItem('pinyinSectPointsTones', newPoints.toString());
    }
  };

  const saveHistory = (newHistory: GameSession[]) => {
    setGameHistory(newHistory);
    diskSetItem('pinyinGameHistory', JSON.stringify(newHistory));
  };

  const savePerfectStreak = (newStreak: number, module: ActiveModule) => {
    if (module === 'initials') {
      setPerfectStreakInitials(newStreak);
      diskSetItem('pinyinPerfectStreakInitials', newStreak.toString());
    } else if (module === 'finals') {
      setPerfectStreakFinals(newStreak);
      diskSetItem('pinyinPerfectStreakFinals', newStreak.toString());
    } else {
      setPerfectStreakTones(newStreak);
      diskSetItem('pinyinPerfectStreakTones', newStreak.toString());
    }
  };

  const markSetCompleted = (setId: number, module: ActiveModule) => {
    if (module === 'initials') {
      if (!completedSetsInitials.includes(setId)) {
        const newSets = [...completedSetsInitials, setId];
        setCompletedSetsInitials(newSets);
        diskSetItem('pinyinCompletedSetsInitials', JSON.stringify(newSets));
      }
    } else if (module === 'finals') {
      if (!completedSetsFinals.includes(setId)) {
        const newSets = [...completedSetsFinals, setId];
        setCompletedSetsFinals(newSets);
        diskSetItem('pinyinCompletedSetsFinals', JSON.stringify(newSets));
      }
    } else {
      if (!completedSetsTones.includes(setId)) {
        const newSets = [...completedSetsTones, setId];
        setCompletedSetsTones(newSets);
        diskSetItem('pinyinCompletedSetsTones', JSON.stringify(newSets));
      }
    }
  };


  const saveRaidKeys = (k: number) => {
    setRaidKeys(k);
    diskSetItem('pinyinRaidKeys', k.toString());
  };

  const addUnlockedVocab = (vocabKey: string) => {
    setUnlockedVocabs(prev => {
      if (prev.includes(vocabKey)) return prev;
      const next = [...prev, vocabKey];
      diskSetItem('pinyinUnlockedVocabs', JSON.stringify(next));
      return next;
    });
  };

  return {
    gameHistory,
    setGameHistory,
    perfectStreakInitials,
    setPerfectStreakInitials,
    perfectStreakFinals,
    setPerfectStreakFinals,
    perfectStreakTones,
    setPerfectStreakTones,
    dailyStreak,
    setDailyStreak,
    expInitials,
    setExpInitials,
    sectPointsInitials,
    setSectPointsInitials,
    expFinals,
    setExpFinals,
    sectPointsFinals,
    setSectPointsFinals,
    expTones,
    setExpTones,
    sectPointsTones,
    setSectPointsTones,
    bossLevelInitials,
    setBossLevelInitials,
    bossLevelFinals,
    setBossLevelFinals,
    bossLevelTones,
    setBossLevelTones,
    raidKeys,
    setRaidKeys,
    showWeeklyPopup,
    setShowWeeklyPopup,
    hasLoaded,
    saveHistory,
    saveExp,
    saveSectPoints,
    savePerfectStreak,
    checkWeeklyPopup,
    completedSetsInitials,
    completedSetsFinals,
    completedSetsTones,
    markSetCompleted,
    diskSetItem,
    saveRaidKeys,
    unlockedVocabs,
    addUnlockedVocab
  };
}
