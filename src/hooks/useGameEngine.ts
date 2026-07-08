import { useState, useEffect, useCallback, useRef } from 'react';
import {
   PINYIN_INITIALS, PINYIN_FINALS, PINYIN_TONES, CONFUSING_PAIRS_INITIALS, CONFUSING_PAIRS_FINALS
} from '../data/pinyin';
import {
   FOCUSED_SETS_INITIALS, FOCUSED_SETS_FINALS
} from '../data/focused-sets';
import {
   TIMER_SECONDS_CORE, TIMER_SECONDS_PAIRS
} from '../data/constants';
import { shuffleArray, getPinyinTrends } from '../lib/utils';
import { playGuzhengClick, playErrorSFX, playCollisionSFX, playSwordSlash, playQiBlast } from '../lib/audio';
import type {
   GameState, GameLevel, ActiveModule, Question, GameSession
} from '../data/types';
import confetti from 'canvas-confetti';

// Import the hook return types to use as prop types
import type { useStorage } from './useStorage';
import type { useAudio } from './useAudio';
import { useGameStore } from '../stores/gameStore';
import { generateQuestion } from '../lib/questionGenerator';
import { useCombatSystem } from './useCombatSystem';

export function useGameEngine(
   storage: ReturnType<typeof useStorage>,
   audio: ReturnType<typeof useAudio>,
   activeModule: ActiveModule,
   inputRef: React.RefObject<HTMLInputElement | null>
) {
   // Game State
   const [gameState, setGameState] = useState<GameState>('idle');
   const [currentLevel, setCurrentLevel] = useState<GameLevel>('level1');
   const [pendingBriefing, setPendingBriefing] = useState<{ level: GameLevel | 'boss', focusSetId?: number | string } | null>(null);
   const [activeFocusSet, setActiveFocusSet] = useState<string[] | null>(null);
   const [currentCategoryId, setCurrentCategoryId] = useState<string>('initials-level1');

   const [quizQueue, setQuizQueue] = useState<string[]>([]);
   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
   const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
   const [baseQuestionCount, setBaseQuestionCount] = useState(21);
   const [totalCorrect, setTotalCorrect] = useState(0);

   const [totalAttempts, setTotalAttempts] = useState(0);
   const [hearts, setHearts] = useState(3);
   const [isPaused, setIsPaused] = useState(false);

   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
   const [typedAnswer, setTypedAnswer] = useState<string>('');
   const [isTransitioning, setIsTransitioning] = useState(false);

   // Timer State
   const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS_CORE);

   // Assassination State
   const [assassinationPhase, setAssassinationPhase] = useState<'stealth' | 'execute' | null>(null);
   const [assassinationTimer, setAssassinationTimer] = useState<number>(0);

   // Gamification State
   const [showPerfect, setShowPerfect] = useState(false);
   const [earnedExp, setEarnedExp] = useState(0);
   const [roundMistakes, setRoundMistakes] = useState<string[]>([]);
   const [talismanSequence, setTalismanSequence] = useState<string[]>([]);
   const [justLostStreak, setJustLostStreak] = useState<boolean>(false);
   const [justGainedStreak, setJustGainedStreak] = useState<boolean>(false);

   // Player State
   const playerHearts = useGameStore(state => state.playerHearts);
   const setPlayerHearts = useGameStore(state => state.setPlayerHearts);

   // Extract Combat System
   const combat = useCombatSystem({
      currentLevel,
      activeModule,
      storage,
      setGameState,
      setEarnedExp,
      playerHearts,
      setPlayerHearts,
      setHearts,
      playErrorSFX,
      playQiBlast,
      playSwordSlash
   });

   // Clear transient overlays when resetting to idle
   // Removed useEffect that called setShowPerfect(false) to fix linting errors
   const { 
      combo, setCombo, 
      questTarget, setQuestTarget,
      questProgress, setQuestProgress, 
      bossDebuffs, setBossDebuffs,
      floatingDamage, setFloatingDamage,
      floatingDamageId, setFloatingDamageId, 
      initCombat, processMistake, processHit 
   } = combat;

   // Scout Physics Engine State
   const scoutPositionsRef = useRef<{ x: number, y: number, vx: number, vy: number }[]>([]);
   const animationRef = useRef<number | null>(null);
   const lastCollisionTimeRef = useRef<number>(0);



   // Handle Briefing Room Transition
   const handleBriefing = (level: GameLevel | 'boss', focusSetId?: number | string) => {
      playGuzhengClick();
      setPendingBriefing({ level, focusSetId });
      setGameState('briefing');
   };

   // Initialize or restart the game
   const startGame = useCallback((level?: GameLevel | 'boss', focusSetId?: number | string) => {
      playGuzhengClick();
      const targetLevel = level || pendingBriefing?.level || 'level1';
      const targetFocusId = focusSetId || pendingBriefing?.focusSetId;

      let initialQueue: string[] = [];
      let focusSetLetters: string[] | null = null;
      let categoryId = `${activeModule}-${targetLevel}`;


      if (['boss', 'horde', 'armored', 'speed', 'clones'].includes(targetLevel)) {
         let qCount = 50;
         if (targetLevel === 'horde' || targetLevel === 'clones') {
            qCount = 999; // Endless
         }

         setPlayerHearts(5);
         const initialQTarget = initCombat(targetLevel);

         const basePool = activeModule === 'initials' ? PINYIN_INITIALS : activeModule === 'finals' ? PINYIN_FINALS : PINYIN_TONES;
         if (targetLevel === 'clones') {
            const trends = getPinyinTrends(storage.gameHistory);
            const filteredTrends = trends.filter(t => basePool.includes(t.pinyin));
            const weakItems = filteredTrends.map(t => t.pinyin);
            const shuffledBase = shuffleArray(basePool.filter(p => !weakItems.includes(p)));
            const pool = [...weakItems, ...shuffledBase];
            initialQueue = shuffleArray(pool.slice(0, initialQTarget));
            setBaseQuestionCount(initialQueue.length);
         } else {
            for (let i = 0; i < qCount; i++) {
               initialQueue.push(basePool[Math.floor(Math.random() * basePool.length)]);
            }
            setBaseQuestionCount(qCount);
         }

         categoryId = `${targetLevel}-${activeModule}`;
      } else if (targetLevel === 'pairs') {
         const pairs = activeModule === 'initials' ? CONFUSING_PAIRS_INITIALS : CONFUSING_PAIRS_FINALS;
         const count = 15;
         setBaseQuestionCount(count);
         for (let i = 0; i < count; i++) {
            const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
            initialQueue.push(`${randomPair[0]}:${randomPair[1]}`);
         }
      } else {
         let count = 15;

         if (targetFocusId && String(targetFocusId).startsWith('focus-')) {
            const numId = Number(String(targetFocusId).replace('focus-', ''));
            const sets = activeModule === 'initials' ? FOCUSED_SETS_INITIALS : FOCUSED_SETS_FINALS;
            const setObj = sets.find(s => s.id === numId);
            if (setObj) {
               focusSetLetters = setObj.letters;
               categoryId = `focus-${numId}`;
               
               count = Math.min(setObj.letters.length * 4, 15);
               initialQueue = [...focusSetLetters];
               
               while (initialQueue.length < count) {
                  initialQueue.push(focusSetLetters[Math.floor(Math.random() * focusSetLetters.length)]);
               }
               initialQueue = shuffleArray(initialQueue);
            }
         }

         setBaseQuestionCount(count);

         if (!focusSetLetters) {
            const basePool = activeModule === 'initials' ? PINYIN_INITIALS : activeModule === 'finals' ? PINYIN_FINALS : PINYIN_TONES;
            const moduleHistory = storage.gameHistory.filter(s => s.module === activeModule || (!s.module && activeModule === 'initials'));
            const trends = getPinyinTrends(moduleHistory);
            
            const top5Mistakes = trends.slice(0, 5).map(t => t.pinyin).filter(p => basePool.includes(p));
            const others = shuffleArray(basePool.filter(p => !top5Mistakes.includes(p)));
            
            initialQueue = shuffleArray([...top5Mistakes, ...others].slice(0, count));
         }
      }

      setActiveFocusSet(focusSetLetters);
      setCurrentCategoryId(categoryId);
      setCurrentLevel(targetLevel as GameLevel);
      setQuizQueue(initialQueue);
      setCurrentQuestionIndex(0);
      setTotalAttempts(0);
      setTotalCorrect(0);
      setHearts(3);
      setIsPaused(false);
      setGameState('playing');
      setSelectedAnswer(null);
      setTypedAnswer('');
      setIsTransitioning(false);

      let initialTime = 3;
      if (targetLevel === 'level1' && !categoryId.startsWith('focus-')) initialTime = 5;
      else if (targetLevel === 'pairs') initialTime = TIMER_SECONDS_PAIRS;
      else if (targetLevel === 'horde') initialTime = 60; // 60 seconds global timer for horde
      else if (targetLevel === 'speed') initialTime = 2; // Strict 2s timer
      else if (targetLevel === 'level2') initialTime = 99; // Handled by assassination phase
      setTimeLeft(initialTime);
      setAssassinationPhase(targetLevel === 'level2' ? 'stealth' : null);

      setRoundMistakes([]);
      setJustLostStreak(false);
      setJustGainedStreak(false);
      setCombo(0);
      setEarnedExp(0);
      audio.setAudioIsPlaying(false);
      audio.setAudioFinishedAt(null);
      setShowPerfect(false);

      setCurrentQuestion(generateQuestion(initialQueue[0], focusSetLetters, targetLevel as GameLevel, activeModule));
   }, [activeModule, storage.gameHistory, storage.bossLevelInitials, storage.bossLevelFinals, pendingBriefing, audio.setAudioIsPlaying, audio.setAudioFinishedAt, initCombat, setCombo, setPlayerHearts, audio]);

   useEffect(() => {
      if (gameState === 'playing' && currentLevel === 'level2' && !isTransitioning && !isPaused && assassinationPhase === 'execute') {
         setTimeout(() => inputRef.current?.focus(), 50);
      }
   }, [currentQuestionIndex, gameState, currentLevel, isTransitioning, isPaused, assassinationPhase, inputRef]);

   const nextQuestion = useCallback(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < quizQueue.length) {
         setCurrentQuestionIndex(nextIndex);
         setCurrentQuestion(generateQuestion(quizQueue[nextIndex], activeFocusSet, currentLevel, activeModule));
         setSelectedAnswer(null);
         setTypedAnswer('');
         setIsTransitioning(false);
         setIsPaused(false);

         let shouldResetTime = true;
         let nextTimeLeft = 3;
         if (currentLevel === 'level1') nextTimeLeft = 5;
         else if (currentLevel === 'pairs') nextTimeLeft = TIMER_SECONDS_PAIRS;
         else if (currentLevel === 'boss' && bossDebuffs.includes('time')) nextTimeLeft = 2;
         else if (currentLevel === 'speed') nextTimeLeft = 2;
         else if (currentLevel === 'horde') shouldResetTime = false; // Horde timer doesn't reset per question
         else if (currentLevel === 'level2') nextTimeLeft = 99;

         if (shouldResetTime) setTimeLeft(nextTimeLeft);
         setAssassinationPhase(currentLevel === 'level2' ? 'stealth' : null);

         audio.setAudioFinishedAt(null);
         setShowPerfect(false);
      } else {
         setGameState('finished');
         setShowPerfect(false);
      }
   }, [currentQuestionIndex, quizQueue, activeFocusSet, currentLevel, bossDebuffs, audio.setAudioFinishedAt, activeModule, audio]);

   // Handle Finish State (EXP, Streaks, Confetti)
   useEffect(() => {
      if (gameState === 'finished') {
         let accuracy = 100;
         if (totalAttempts > 0) {
            const correctAnswers = totalAttempts - roundMistakes.length;
            accuracy = Math.round((correctAnswers / totalAttempts) * 100);
         }
         accuracy = Math.max(0, Math.min(100, accuracy));

         const newSession: GameSession = {
            gameNumber: storage.gameHistory.length + 1,
            accuracy: accuracy,
            totalAttempts: totalAttempts,
            mistakes: roundMistakes,
            level: currentLevel,
            categoryId: currentCategoryId,
            module: activeModule,
            timestamp: Date.now()
         };
         storage.saveHistory([...storage.gameHistory, newSession]);

         // Mark Focus Set Completed
         if (currentCategoryId.startsWith('focus-') && accuracy >= 70) {
            const setId = parseInt(currentCategoryId.replace('focus-', ''), 10);
            if (!isNaN(setId)) {
               storage.markSetCompleted(setId, activeModule);
            }
         }

         // Daily Streak
         const today = new Date().toDateString();
         if (storage.dailyStreak.lastPlayedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const newStreakCount = storage.dailyStreak.lastPlayedDate === yesterday.toDateString()
               ? storage.dailyStreak.count + 1
               : 1;
            const newStreak = { count: newStreakCount, lastPlayedDate: today };
            storage.setDailyStreak(newStreak);
            localStorage.setItem('pinyinDailyStreak', JSON.stringify(newStreak));
         }

         // EXP Final Calculation
         let finalExp = earnedExp;
         finalExp += 20; // Game clear bonus
         if (hearts === 3) finalExp += 50; // Flawless bonus

         const currentExp = activeModule === 'initials'
            ? storage.expInitials
            : storage.expFinals;

         const currentSectPoints = activeModule === 'initials'
            ? storage.sectPointsInitials
            : storage.sectPointsFinals;

         storage.saveExp(currentExp + finalExp, activeModule);
         storage.saveSectPoints(currentSectPoints + finalExp, activeModule); // Sect points equal to EXP gained

         // eslint-disable-next-line react-hooks/set-state-in-effect
         setEarnedExp(finalExp);

         // Confetti logic
         if (hearts === 3) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
               confetti({
                  particleCount: 5,
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                  colors: ['#38bdf8', '#10b981', '#f43f5e', '#fbbf24']
               });
               confetti({
                  particleCount: 5,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                  colors: ['#38bdf8', '#10b981', '#f43f5e', '#fbbf24']
               });

               if (Date.now() < end) {
                  requestAnimationFrame(frame);
               }
            };
            frame();
         }

         // Perfect Streak
         if (currentLevel === 'level1' && !activeFocusSet) {
            const currentStreak = activeModule === 'initials' ? storage.perfectStreakInitials : storage.perfectStreakFinals;
            if (hearts > 0) {
               storage.savePerfectStreak(currentStreak + 1, activeModule);
               setJustGainedStreak(true);
            } else {
               if (currentStreak > 0) setJustLostStreak(true);
               storage.savePerfectStreak(0, activeModule);
            }
         }

         // Grant Raid Keys
         if (hearts > 0 && currentLevel !== 'boss' && !activeFocusSet) {
            let keysGained = 0;
            if (currentLevel === 'level1') keysGained = 1;
            else if (currentLevel === 'pairs') keysGained = 2;
            else if (currentLevel === 'level2') keysGained = 3;
            else if (currentLevel === 'clones') keysGained = 1;

            if (keysGained > 0) {
               storage.setRaidKeys((prev: number) => {
                  const newKeys = Math.min(5, prev + keysGained);
                  localStorage.setItem('pinyinRaidKeys', newKeys.toString());
                  return newKeys;
               });
            }
         }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [gameState]);

   const handleAnswer = (answer: string, _isTimeout: boolean = false, overrideTimeReacted?: number) => {
      if (activeModule === 'tones') playSwordSlash();
      else playGuzhengClick();
      if (isTransitioning || !currentQuestion || isPaused) return;

      if (answer === 'NEXT_QUESTION') {
         if (hearts <= 0) setGameState('finished');
         else nextQuestion();
         return;
      }

      setSelectedAnswer(answer);
      setIsTransitioning(true);
      setTotalAttempts(prev => prev + 1);

      const pinyinToRecord = currentQuestion.correctAnswer;
      const isCorrect = answer === pinyinToRecord;
      const isWrongNoPause = answer === 'WRONG_ANSWER_NO_PAUSE';

      if (!isCorrect || isWrongNoPause) {
         processMistake();

         if (!roundMistakes.includes(pinyinToRecord)) {
            setRoundMistakes(prev => [...prev, pinyinToRecord]);
         }

         if (currentLevel === 'pairs') {
            const wrong = currentQuestion.options.find(o => o !== pinyinToRecord);
            setQuizQueue(prev => [...prev, `${pinyinToRecord}:${wrong}`]);
         } else if (currentLevel === 'clones') {
            setQuizQueue(prev => {
               const next = [...prev];
               // Insert randomly somewhere after the next question
               const minIdx = Math.min(next.length, currentQuestionIndex + 2);
               const maxIdx = next.length;
               const insertIdx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
               next.splice(insertIdx, 0, pinyinToRecord);
               // If it's the very last question, pad with a random character to avoid immediate repetition
               if (currentQuestionIndex + 1 >= next.length - 1) {
                  const basePool = activeModule === 'initials' ? PINYIN_INITIALS : activeModule === 'finals' ? PINYIN_FINALS : PINYIN_TONES;
                  const randomPad = basePool[Math.floor(Math.random() * basePool.length)];
                  next.splice(insertIdx, 0, randomPad);
               }
               return next;
            });
         } else {
            setQuizQueue(prev => [...prev, pinyinToRecord]);
         }

         if (currentLevel === 'talisman' || isWrongNoPause) {
            // Keep isTransitioning true to pause timer without triggering red screen, but for no pause, set it false
            if (isWrongNoPause) setIsTransitioning(false);
         } else if (currentLevel !== 'clones') {
            setTimeout(() => {
               setIsPaused(true);
               setIsTransitioning(false);
            }, 1000);
         } else {
            setIsTransitioning(false);
         }
      } else {
         setTotalCorrect(prev => prev + 1);
         const newCombo = combo + 1;
         setCombo(newCombo);

         let speedBonus = 0;
         let timeReacted = 999;
         if (overrideTimeReacted !== undefined) {
            timeReacted = overrideTimeReacted;
         } else if (audio.audioIsPlaying) {
            timeReacted = 0; // Answered before audio finished (Super fast!)
         } else if (audio.audioFinishedAt !== null) {
            timeReacted = (Date.now() - audio.audioFinishedAt) / 1000;
         }

         if (timeReacted <= 1.5) {
            speedBonus = 5;
            setShowPerfect(true);
         }

         processHit(timeReacted, speedBonus);

         if (currentLevel !== 'clones') {
            setTimeout(() => {
               nextQuestion();
            }, 800);
         } else {
            setIsTransitioning(false);
         }
      }
   };

   const handleTypingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isTransitioning || !currentQuestion || isPaused || timeLeft === 0) return;
      const normalizedInput = typedAnswer.trim().toLowerCase().replace(/ü/g, 'v');
      handleAnswer(normalizedInput);
   };

   // Autoplay sound when question appears
   useEffect(() => {
      if (gameState === 'playing' && currentQuestion && !isTransitioning && !isPaused && currentLevel !== 'guqin') {
         const timer = setTimeout(() => {
            audio.playSound(currentQuestion.correctAnswer);
         }, 300);
         return () => clearTimeout(timer);
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentQuestion, gameState, isTransitioning, isPaused, audio.playSound]);

   // Timer logic
   useEffect(() => {
      if (gameState === 'playing' && !isTransitioning && !isPaused && audio.audioFinishedAt !== null && timeLeft > 0) {
         if (currentLevel === 'level2' && assassinationPhase === 'stealth') return;
         if (currentLevel === 'clones' || currentLevel === 'guqin') return; // No time limit for Clone Shell Game & Guqin

         const timerId = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
         }, 1000);
         return () => clearTimeout(timerId);
      }
   }, [gameState, isTransitioning, isPaused, audio.audioIsPlaying, audio.audioFinishedAt, timeLeft, currentLevel, assassinationPhase]);

   // Timeout logic
   useEffect(() => {
      if (gameState === 'playing' && !isTransitioning && !isPaused && audio.audioFinishedAt !== null && timeLeft === 0) {
         if (currentLevel === 'clones' || currentLevel === 'guqin') return;
         // Delay timeout slightly to allow the CSS progress bar to visually empty
         const t = setTimeout(() => {
            handleAnswer('TIMEOUT', true);
         }, 900);
         return () => clearTimeout(t);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [gameState, isTransitioning, isPaused, audio.audioIsPlaying, audio.audioFinishedAt, timeLeft]);

   // Assassination Phase Trigger Logic
   useEffect(() => {
      if (gameState === 'playing' && currentLevel === 'level2' && assassinationPhase === 'stealth' && !isPaused && !isTransitioning && !audio.audioIsPlaying && audio.audioFinishedAt !== null) {
         const delay = 1000 + Math.random() * 3000;

         const timer = setTimeout(() => {
            setAssassinationPhase('execute');
            try {
               const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
               const oscillator = audioCtx.createOscillator();
               const gainNode = audioCtx.createGain();
               oscillator.connect(gainNode);
               gainNode.connect(audioCtx.destination);
               oscillator.type = 'square';
               oscillator.frequency.value = 880;
               gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
               gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
               oscillator.start(audioCtx.currentTime);
               oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (e) { console.error("Beep sound failed", e); }

            const ansLen = currentQuestion?.correctAnswer.length || 1;
            const execTime = ansLen <= 2 ? 2 : 3;
            setTimeLeft(execTime);

         }, delay);

         return () => clearTimeout(timer);
      }
   }, [gameState, currentLevel, assassinationPhase, isPaused, isTransitioning, audio.audioIsPlaying, audio.audioFinishedAt, currentQuestion]);

   // Stealth Phase Fail on Early Keypress
   useEffect(() => {
      if (gameState === 'playing' && currentLevel === 'level2' && assassinationPhase === 'stealth' && !isPaused && !isTransitioning) {
         const handleEarlyPress = (e: KeyboardEvent) => {
            if (['Meta', 'Control', 'Shift', 'Alt', 'Tab', 'Escape'].includes(e.key)) return;
            handleAnswer('COVER_BLOWN');
         };
         window.addEventListener('keydown', handleEarlyPress);
         return () => window.removeEventListener('keydown', handleEarlyPress);
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [gameState, currentLevel, assassinationPhase, isPaused, isTransitioning]);

   // Scout Physics Engine Initialization
   useEffect(() => {
      if (gameState === 'playing' && currentLevel === 'level1' && selectedAnswer === null && !currentCategoryId.startsWith('focus-')) {
         const numItems = currentQuestion?.options.length || 4;
         scoutPositionsRef.current = Array.from({ length: numItems }).map((_, i) => {
            // Distribute evenly in a circle (e.g. 4 buttons = 0°, 90°, 180°, 270°) + small random offset
            const baseAngle = (i / numItems) * Math.PI * 2;
            const angle = baseAngle + (Math.random() * 0.5 - 0.25); // ±15° jitter
            const speed = 1.5 + Math.random() * 2; // Each button gets its own speed 1.5-3.5
            // Start at the center (subtracting half button size 70/50)
            const centerX = window.innerWidth / 2 - 70;
            const centerY = window.innerHeight / 2 - 50;
            return {
               x: centerX + Math.cos(angle) * 5,
               y: centerY + Math.sin(angle) * 5,
               vx: Math.cos(angle) * speed,
               vy: Math.sin(angle) * speed,
            };
         });
      } else {
         scoutPositionsRef.current = [];
      }
   }, [currentQuestion, gameState, currentLevel, selectedAnswer, currentCategoryId]);

   // Scout Physics Loop (Direct DOM Manipulation for 60fps)
   useEffect(() => {
      if (gameState !== 'playing' || currentLevel !== 'level1' || selectedAnswer !== null || currentCategoryId.startsWith('focus-')) return;

      let lastTime: number | null = null;

      const update = (time: number) => {
         if (!lastTime) lastTime = time;
         let dt = (time - lastTime) / 16.66;
         lastTime = time;

         // Cap dt to avoid huge jumps if tab was backgrounded
         if (dt > 3) dt = 3;

         const positions = scoutPositionsRef.current;
         if (!positions || positions.length === 0) return;

         const buttonWidth = 140;
         const buttonHeight = 100;
         const padding = 10;

         for (let i = 0; i < positions.length; i++) {
            const p = positions[i];

            // Move
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Edge collision
            if (p.x < padding) { p.x = padding; p.vx *= -1; }
            if (p.x > window.innerWidth - buttonWidth - padding) { p.x = window.innerWidth - buttonWidth - padding; p.vx *= -1; }
            if (p.y < padding) { p.y = padding; p.vy *= -1; }
            if (p.y > window.innerHeight - buttonHeight - padding) { p.y = window.innerHeight - buttonHeight - padding; p.vy *= -1; }

            // Object collision
            for (let j = i + 1; j < positions.length; j++) {
               const p2 = positions[j];
               const dx = (p.x + buttonWidth / 2) - (p2.x + buttonWidth / 2);
               const dy = (p.y + buttonHeight / 2) - (p2.y + buttonHeight / 2);
               const dist = Math.sqrt(dx * dx + dy * dy);
               const minDist = (buttonWidth + buttonHeight) / 2 * 0.8;

               if (dist < minDist && dist > 0) {
                  const nx = dx / dist;
                  const ny = dy / dist;

                  const overlap = minDist - dist;
                  p.x += nx * overlap * 0.5;
                  p.y += ny * overlap * 0.5;
                  p2.x -= nx * overlap * 0.5;
                  p2.y -= ny * overlap * 0.5;

                  const p1vx = p.vx; const p1vy = p.vy;
                  p.vx = p2.vx; p.vy = p2.vy;
                  p2.vx = p1vx; p2.vy = p1vy;

                  const now = Date.now();
                  if (now - lastCollisionTimeRef.current > 150) {
                     playCollisionSFX();
                     lastCollisionTimeRef.current = now;
                  }
               }
            }

            // Update DOM directly
            const el = document.getElementById(`scout-btn-${i}`);
            if (el) {
               el.style.left = `${p.x}px`;
               el.style.top = `${p.y}px`;
            }
         }

         animationRef.current = requestAnimationFrame(update);
      };

      animationRef.current = requestAnimationFrame(update);
      return () => {
         if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
   }, [gameState, currentLevel, selectedAnswer, currentCategoryId]);

  return {
    gameState, setGameState,
    currentLevel, setCurrentLevel,
    pendingBriefing, setPendingBriefing,
    activeFocusSet, setActiveFocusSet,
    currentCategoryId, setCurrentCategoryId,
    quizQueue, setQuizQueue,
    currentQuestionIndex, setCurrentQuestionIndex,
    currentQuestion, setCurrentQuestion,
    baseQuestionCount, setBaseQuestionCount,
    totalAttempts, setTotalAttempts,
    totalCorrect, setTotalCorrect,
    hearts, setHearts,
    isPaused, setIsPaused,
    selectedAnswer, setSelectedAnswer,
    typedAnswer, setTypedAnswer,
    isTransitioning, setIsTransitioning,
    timeLeft, setTimeLeft,
    assassinationPhase, setAssassinationPhase,
    assassinationTimer, setAssassinationTimer,
    combo, setCombo,
    showPerfect, setShowPerfect,
    earnedExp, setEarnedExp,
    roundMistakes, setRoundMistakes,
    justLostStreak, setJustLostStreak,
    justGainedStreak, setJustGainedStreak,
    questTarget, setQuestTarget,
    questProgress, setQuestProgress,
    playerHearts, setPlayerHearts,
    bossDebuffs, setBossDebuffs,
    floatingDamage, setFloatingDamage,
    floatingDamageId, setFloatingDamageId,
    talismanSequence,
    setTalismanSequence,
    handleBriefing,
    startGame,
    nextQuestion,
    handleAnswer,
    handleTypingSubmit
  };
}
