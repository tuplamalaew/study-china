import { useState, useEffect, useRef, useCallback } from 'react';
import { BATTLER_VOCABS, BattlerUnitDef, FALLBACK_UNIT } from '../data/vocabBattler';

export interface BoardSlot {
  id: string; // row-col
  unit: BattlerUnitDef & { star: number } | null; // Added star rating
  lastFired: number;
}

export interface Enemy {
  id: number;
  row: number;
  x: number; // 0 to 100
  hp: number;
  maxHp: number;
  speed: number;
  icon: string;
}

export interface Projectile {
  id: number;
  row: number;
  startX: number;
  currentX: number;
  targetId: number;
  damage: number;
  color: string;
}

export type BattlerPhase = 'prep' | 'combat';

export const useAutoBattler = (unlockedVocabs: string[]) => {
  const [board, setBoard] = useState<Record<string, BoardSlot>>({});
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  
  const [battlerPhase, setBattlerPhase] = useState<BattlerPhase>('prep');
  const [wave, setWave] = useState<number>(1);
  const [gold, setGold] = useState<number>(10);
  
  const [runDeck, setRunDeck] = useState<string[]>([]);
  const [shopCards, setShopCards] = useState<string[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  
  const [playerHp, setPlayerHp] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  const cardCost = 3;

  const gameStateRef = useRef({
    board,
    enemies,
    projectiles,
    battlerPhase,
    // eslint-disable-next-line react-hooks/purity
    lastTick: performance.now(),
    projectileIdCounter: 0,
    waveFailed: false,
    enemiesToSpawn: 0,
    enemySpawnTimer: 0,
    spawnedCount: 0,
    waveScore: 0
  });

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current.board = board;
    gameStateRef.current.enemies = enemies;
    gameStateRef.current.projectiles = projectiles;
    gameStateRef.current.battlerPhase = battlerPhase;
  }, [board, enemies, projectiles, battlerPhase]);

  const initGame = useCallback(() => {
    const initialBoard: Record<string, BoardSlot> = {};
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        initialBoard[`${r}-${c}`] = { id: `${r}-${c}`, unit: null, lastFired: 0 };
      }
    }
    setBoard(initialBoard);
    setEnemies([]);
    setProjectiles([]);
    setPlayerHp(3);
    setGold(10);
    setWave(1);
    setBattlerPhase('prep');
    setIsGameOver(false);
    
    // Create Run Deck (15 cards)
    const pool = unlockedVocabs.length > 0 ? unlockedVocabs : Object.keys(BATTLER_VOCABS);
    const newRunDeck: string[] = [];
    for (let i = 0; i < 15; i++) {
      newRunDeck.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    setRunDeck(newRunDeck);
    
    // Initial shop setup (4 cards from Run Deck)
    const initialCards: string[] = [];
    for (let i = 0; i < 4; i++) {
      initialCards.push(newRunDeck[Math.floor(Math.random() * newRunDeck.length)]);
    }
    setShopCards(initialCards);
    setSelectedCardIndex(null);
  }, [unlockedVocabs]);

  const handlePlaceUnit = (row: number, col: number, isSuccess: boolean) => {
    if (selectedCardIndex === null) return;
    
    if (!isSuccess) {
      // Penalty for wrong guess
      setGold(g => Math.max(0, g - 1));
      setSelectedCardIndex(null);
      return;
    }

    if (gold < cardCost) {
      setSelectedCardIndex(null);
      return;
    }

    const vocabKey = shopCards[selectedCardIndex];
    const unitDef = BATTLER_VOCABS[vocabKey] || FALLBACK_UNIT;
    
    setGold(g => g - cardCost);
    
    setBoard(prev => {
      const next = { ...prev };
      
      // Auto-Upgrade Logic (3 copies -> 2 star)
      // For simplicity, if they place on an existing SAME unit, we upgrade it.
      // If we wanted exact TFT logic, it would scan the whole board. Let's do simple:
      // If placing on same unit name -> upgrade to 2 star.
      const existing = next[`${row}-${col}`].unit;
      let star = 1;
      if (existing && existing.name === unitDef.name && existing.star === 1) {
        star = 2; // Upgraded!
      } else if (existing && existing.name === unitDef.name && existing.star === 2) {
        star = 3; // Upgraded!
      }

      next[`${row}-${col}`] = {
        ...next[`${row}-${col}`],
        unit: { 
          ...unitDef, 
          star,
          // Boost stats based on star
          hp: unitDef.hp * (star === 1 ? 1 : star === 2 ? 2.5 : 5),
          atk: unitDef.atk * (star === 1 ? 1 : star === 2 ? 2 : 4)
        },
        lastFired: performance.now(),
      };
      return next;
    });
    
    // Refill shop slot from Run Deck
    setShopCards(prev => {
      const next = [...prev];
      next[selectedCardIndex] = runDeck[Math.floor(Math.random() * runDeck.length)];
      return next;
    });
    setSelectedCardIndex(null);
  };

  const startCombat = () => {
    if (battlerPhase === 'combat') return;
    setBattlerPhase('combat');
    gameStateRef.current.enemiesToSpawn = 3 + wave * 2; // e.g. Wave 1 = 5 enemies
    gameStateRef.current.spawnedCount = 0;
    gameStateRef.current.enemySpawnTimer = 0;
    gameStateRef.current.waveFailed = false;
    gameStateRef.current.waveScore = 0;
  };

  // Game Loop
  useEffect(() => {
    if (isGameOver) return;
    
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const tick = (now: number) => {
      const state = gameStateRef.current;
      const delta = now - lastTime;
      lastTime = now;
      
      if (state.battlerPhase !== 'combat') {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }
      
      let newEnemies = [...state.enemies];
      let newProjectiles = [...state.projectiles];
      const newBoard = { ...state.board };
      let boardChanged = false;

      // 1. Spawn Enemies
      if (state.spawnedCount < state.enemiesToSpawn) {
        state.enemySpawnTimer += delta;
        if (state.enemySpawnTimer > 2000 - (wave * 50)) { // Spawn faster later
          state.enemySpawnTimer = 0;
          state.spawnedCount++;
          
          // Determine enemy type based on wave
          const typeRand = Math.random();
          let eHp = 80 + wave * 20;
          let eSpeed = 15;
          let eIcon = '👾';
          
          if (typeRand > 0.8 && wave > 1) { // Boss/Tank
            eHp *= 3;
            eSpeed = 8;
            eIcon = '👹';
          } else if (typeRand > 0.5) { // Fast
            eHp *= 0.6;
            eSpeed = 25;
            eIcon = '🦇';
          }

          newEnemies.push({
            id: Date.now() + state.spawnedCount,
            row: Math.floor(Math.random() * 2),
            x: 100,
            hp: eHp,
            maxHp: eHp,
            speed: eSpeed,
            icon: eIcon,
          });
        }
      }

      // 2. Move & Attack (Enemies vs Units)
      newEnemies.forEach(e => {
        // Find if there's a defending unit in the same row, slightly to the left of the enemy
        // Slots are at approx: col0=10%, col1=18%, col2=26%, col3=34%, col4=42%
        // Let's find the rightmost unit that is <= enemy.x
        let blockingSlot: string | null = null;
        // let blockingX = -1;
        
        for (let c = 4; c >= 0; c--) {
          const s = newBoard[`${e.row}-${c}`];
          if (s && s.unit) {
            const slotX = 10 + c * 8; // approx percentage
            if (e.x > slotX && e.x - slotX < 10) { // Enemy is right in front of unit
              blockingSlot = `${e.row}-${c}`;
              // blockingX = slotX;
              break;
            }
          }
        }

        if (blockingSlot) {
          // Enemy is blocked! Stop moving, attack unit!
          // Simple damage over time
          const s = newBoard[blockingSlot];
          if (s && s.unit) {
            s.unit.hp -= 20 * (delta / 1000); // Enemy DPS
            boardChanged = true;
            if (s.unit.hp <= 0) {
              s.unit = null; // Unit destroyed
            }
          }
        } else {
          // Move
          e.x -= e.speed * (delta / 1000);
          if (e.x <= 0) {
            state.waveFailed = true;
            e.hp = 0; // Despawn
          }
        }
      });

      // 3. Units Attack
      Object.keys(newBoard).forEach(key => {
        const slot = newBoard[key];
        if (slot.unit) {
          if (now - slot.lastFired >= slot.unit.cooldownMs) {
            const [r, c] = key.split('-').map(Number);
            const target = newEnemies.find(e => e.row === r && e.x > (c * 8) && e.hp > 0);
            
            if (target) {
              slot.lastFired = now;
              boardChanged = true;
              
              if (slot.unit.type === 'melee' || slot.unit.type === 'tank') {
                target.hp -= slot.unit.atk;
              } else {
                newProjectiles.push({
                  id: state.projectileIdCounter++,
                  row: r,
                  startX: (c * 8) + 10,
                  currentX: (c * 8) + 10,
                  targetId: target.id,
                  damage: slot.unit.atk,
                  color: slot.unit.projectileColor || '#fff'
                });
              }
            }
          }
        }
      });

      // 4. Move Projectiles
      newProjectiles = newProjectiles.filter(p => {
        p.currentX += 60 * (delta / 1000); // fast projectile
        const target = newEnemies.find(e => e.id === p.targetId);
        
        if (!target || target.hp <= 0) return false; 
        
        if (p.currentX >= target.x) {
          target.hp -= p.damage;
          return false; 
        }
        return true;
      });

      // 5. Cleanup dead enemies
      newEnemies = newEnemies.filter(e => {
        if (e.hp <= 0 && e.x > 0) {
          state.waveScore += 10;
          return false;
        }
        return e.hp > 0;
      });

      if (boardChanged) setBoard(newBoard);
      setEnemies(newEnemies);
      setProjectiles(newProjectiles);

      // Check wave end
      if (state.spawnedCount === state.enemiesToSpawn && newEnemies.length === 0) {
        // Wave over!
        setBattlerPhase('prep');
        setWave(w => w + 1);
        setGold(g => g + 10 + Math.floor(state.waveScore / 20)); // Base 10 + bonus
        
        if (state.waveFailed) {
          setPlayerHp(prev => {
            const next = prev - 1;
            if (next <= 0) setIsGameOver(true);
            return next;
          });
        }
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isGameOver, wave]); // Re-bind when wave changes so dependencies refresh safely

  return {
    board,
    enemies,
    projectiles,
    shopCards,
    selectedCardIndex,
    setSelectedCardIndex,
    gold,
    cardCost,
    playerHp,
    battlerPhase,
    wave,
    isGameOver,
    handlePlaceUnit,
    startCombat,
    initGame
  };
};
