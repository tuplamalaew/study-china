import { useState, useCallback } from 'react';
import { GameLevel, ActiveModule, GameState } from '../data/types';
import type { useStorage } from './useStorage';

interface CombatSystemProps {
   currentLevel: GameLevel;
   activeModule: ActiveModule;
   storage: ReturnType<typeof useStorage>;
   setGameState: (state: GameState) => void;
   setEarnedExp: React.Dispatch<React.SetStateAction<number>>;
   playerHearts: number;
   setPlayerHearts: (hearts: number) => void;
   setHearts: React.Dispatch<React.SetStateAction<number>>;
   playErrorSFX: () => void;
   playQiBlast: () => void;
   playSwordSlash: () => void;
}

export function useCombatSystem({
   currentLevel, activeModule, storage, setGameState, setEarnedExp,
   playerHearts, setPlayerHearts, setHearts,
   playErrorSFX, playQiBlast, playSwordSlash
}: CombatSystemProps) {
   const [combo, setCombo] = useState(0);
   const [questTarget, setQuestTarget] = useState(0);
   const [questProgress, setQuestProgress] = useState(0);
   const [bossDebuffs, setBossDebuffs] = useState<string[]>([]);
   const [floatingDamage, setFloatingDamage] = useState<{ id: number, text: string, type: 'normal' | 'critical' | 'damage' }[]>([]);
   const [floatingDamageId, setFloatingDamageId] = useState(0);

   const initCombat = useCallback((targetLevel: GameLevel) => {
      let qTarget = 1000;
      const debuffs: string[] = [];

      if (targetLevel === 'boss') {
         const bLevel = activeModule === 'initials' ? storage.bossLevelInitials : storage.bossLevelFinals;
         qTarget = 1000 + (bLevel - 1) * 800;
         if (bLevel >= 2) debuffs.push('smoke');
         if (bLevel >= 4) debuffs.push('time');
         if (bLevel >= 7) debuffs.push('illusion');
      } else if (targetLevel === 'horde') {
         qTarget = 30; // 30 HP per monster, respawns
      } else if (targetLevel === 'armored') {
         qTarget = 500;
      } else if (targetLevel === 'speed') {
         qTarget = 200;
      } else if (targetLevel === 'clones') {
         qTarget = Math.random() < 0.5 ? 10 : 15;
      }

      setQuestTarget(qTarget);
      setQuestProgress(qTarget);
      setBossDebuffs(debuffs);
      setCombo(0);
      setFloatingDamage([]);
      
      return qTarget;
   }, [activeModule, storage.bossLevelInitials, storage.bossLevelFinals]);

   const processMistake = useCallback(() => {
      playErrorSFX();
      setCombo(0);

      if (['boss', 'horde', 'armored', 'speed'].includes(currentLevel)) {
         const h = playerHearts - 1;
         setPlayerHearts(h);
         if (h <= 0) setTimeout(() => setGameState('finished'), 1000);
         
         const fdId = Date.now();
         if (currentLevel === 'armored') {
            setQuestProgress((prev) => Math.min(500, prev + 50)); // Heals on mistake
            setFloatingDamageId(fdId);
            setFloatingDamage(prev => [...prev, { id: fdId, text: `+50 ❤️`, type: 'normal' }]); // Healing text
         } else {
            setFloatingDamageId(fdId);
            setFloatingDamage(prev => [...prev, { id: fdId, text: `-1 ❤️`, type: 'damage' }]);
         }
         setTimeout(() => setFloatingDamage(prev => prev.filter(d => d.id !== fdId)), 1000);
      } else {
         setHearts(prev => {
            const h = Math.max(0, prev - 1);
            if (h <= 0 && currentLevel === 'clones') setTimeout(() => setGameState('finished'), 1000);
            return h;
         });
      }
   }, [currentLevel, playerHearts, setPlayerHearts, setGameState, playErrorSFX, setHearts]);

   const processHit = useCallback((timeReacted: number, speedBonus: number) => {
      const newCombo = combo + 1;
      setCombo(newCombo);

      if (['boss', 'horde', 'armored', 'speed', 'clones'].includes(currentLevel)) {
         let damage = 0;
         if (currentLevel === 'boss') {
            const baseDamage = 100;
            const comboMult = 1 + (newCombo * 0.1);
            const timeBonus = (timeReacted <= 1.5) ? 1.5 : 1;
            damage = Math.round(baseDamage * comboMult * timeBonus);
         } else if (currentLevel === 'horde') {
            damage = 30; // Always one-shot
         } else if (currentLevel === 'armored') {
            damage = Math.max(1, newCombo * 2); // Damage scales with combo
         } else if (currentLevel === 'speed') {
            damage = 40; // 5 hits to kill
         } else if (currentLevel === 'clones') {
            damage = 1; // 1 damage per correct answer
         }

         setQuestProgress(prev => {
            const newHp = Math.max(0, prev - damage);
            if (newHp === 0) {
               if (currentLevel === 'horde') {
                  return 30; // Respawn monster immediately
               } else if (currentLevel === 'clones') {
                  // Do not respawn, let it finish the round
               }
               setTimeout(() => {
                  if (currentLevel === 'boss') {
                     const nextLevel = (activeModule === 'initials' ? storage.bossLevelInitials : storage.bossLevelFinals) + 1;
                     // Handled by disk storage in useStorage
                     if (activeModule === 'initials') {
                        storage.setBossLevelInitials(nextLevel);
                        if(typeof window !== 'undefined') localStorage.setItem('bossLevelInitials', nextLevel.toString());
                     } else {
                        storage.setBossLevelFinals(nextLevel);
                        if(typeof window !== 'undefined') localStorage.setItem('bossLevelFinals', nextLevel.toString());
                     }
                     setEarnedExp(prevExp => prevExp + (nextLevel * 500));
                  } else {
                     setEarnedExp(prevExp => prevExp + 200); // Fixed reward for other quests
                  }
                  setGameState('finished');
               }, 1000);
            }
            return newHp;
         });
         
         const fdId = Date.now();
         setFloatingDamageId(fdId);
         setFloatingDamage(prev => [...prev, { id: fdId, text: `-${damage}`, type: timeReacted <= 1.5 ? 'critical' : 'normal' }]);

         if (timeReacted <= 1.5) {
            playQiBlast();
         } else {
            playSwordSlash();
         }

         setTimeout(() => setFloatingDamage(prev => prev.filter(d => d.id !== fdId)), 1000);
      }

      // Calculate EXP Gained
      const baseExp = 5;
      const multiplier = Math.min(newCombo, 2);
      const expGained = (baseExp + speedBonus) * multiplier;
      setEarnedExp(prev => prev + expGained);

   }, [combo, currentLevel, activeModule, storage, setGameState, setEarnedExp, playQiBlast, playSwordSlash]);

   return {
      combo, setCombo,
      questTarget, setQuestTarget,
      questProgress, setQuestProgress,
      bossDebuffs, setBossDebuffs,
      floatingDamage, setFloatingDamage,
      floatingDamageId, setFloatingDamageId,
      initCombat,
      processMistake,
      processHit
   };
}
