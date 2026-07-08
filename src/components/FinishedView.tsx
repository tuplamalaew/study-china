'use client';

import React from 'react';
import type { GameState, GameLevel, ActiveModule, GameSession } from '../data/types';
import { FOCUSED_SETS_INITIALS, FOCUSED_SETS_FINALS } from '../data/focused-sets';
import { formatPinyin } from '../lib/utils';
import { MiniChart } from './MiniChart';

interface FinishedViewProps {
  hearts: number;
  earnedExp: number;
  totalCorrect: number;
  totalAttempts: number;
  roundMistakes: string[];
  currentLevel: GameLevel;
  currentCategoryId: string;
  activeFocusSet: string[] | null;
  activeModule: ActiveModule;
  justLostStreak: boolean;
  justGainedStreak: boolean;
  playSound: (pinyin: string) => void;
  startGame: (level?: GameLevel | 'boss', focusSetId?: number | string) => void;
  setGameState: (state: GameState) => void;
  gameHistory: any[];
}

export function FinishedView({
  hearts, earnedExp, totalCorrect, totalAttempts, roundMistakes,
  currentLevel, currentCategoryId, activeFocusSet, activeModule,
  justLostStreak, justGainedStreak,
  playSound, startGame, setGameState, gameHistory
}: FinishedViewProps) {
  return (
    <div className="text-center space-y-8 animate-fade-in mx-auto max-w-xl">
      
      <h2 className={`text-5xl font-black ${hearts === 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-lg' : 'text-white'}`}>
         {hearts === 3 ? 'FLAWLESS VICTORY!' : 'Training Complete!'}
      </h2>
      
      {/* EXP REWARD SECTION */}
      <div className="bg-slate-900/50 rounded-3xl p-6 border-2 border-slate-700 relative overflow-hidden">
         {hearts === 3 && <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>}
         <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">EXP Gained</h3>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-cyan-500 drop-shadow-md mb-2">
               +{earnedExp}
            </div>
            <div className="flex justify-center gap-2 text-sm font-bold text-slate-500">
               <span className="bg-slate-800 px-2 py-1 rounded">Clear: +20</span>
               {hearts === 3 && <span className="bg-yellow-900/50 text-yellow-500 px-2 py-1 rounded border border-yellow-700/50">Flawless: +50</span>}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="py-4 bg-slate-900/50 rounded-2xl border border-slate-800">
           <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</div>
           <div className="text-4xl font-black text-white">
             {totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%
           </div>
         </div>
         <div className="py-4 bg-slate-900/50 rounded-2xl border border-slate-800">
           <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Attempts</div>
           <div className="text-4xl font-black text-white">{totalAttempts}</div>
         </div>
      </div>

      {roundMistakes.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Words you missed</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {roundMistakes.map((pinyin, index) => (
              <button
                key={index}
                onClick={() => playSound(pinyin)}
                title="Click to hear this sound again"
                className="px-5 py-2.5 bg-rose-500/20 text-rose-400 font-bold text-xl rounded-xl border-2 border-rose-500/30 hover:bg-rose-500/40"
              >
                🔊 {formatPinyin(pinyin)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full text-left mt-8">
         <MiniChart categoryId={currentCategoryId} title="📈 แนวโน้มความแม่นยำของคุณ (โหมดนี้)" gameHistory={gameHistory} />
      </div>

      <div className="space-y-4 pt-4">
        <button 
          onClick={() => {
             if (currentLevel === 'pairs') {
               startGame('pairs');
             } else if (['horde', 'armored', 'speed', 'boss', 'clones', 'talisman'].includes(currentLevel)) {
               startGame(currentLevel);
             } else {
               const focusId = currentCategoryId.startsWith('focus-') ? currentCategoryId : undefined;
               startGame(currentLevel, focusId);
             }
          }}
          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transform hover:-translate-y-1"
        >
          Play Again
        </button>
        <button 
          onClick={() => setGameState('idle')}
          className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white text-lg font-bold rounded-2xl"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
