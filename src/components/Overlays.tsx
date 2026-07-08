'use client';

import React from 'react';
import type { ActiveModule, WeeklyReport } from '../data/types';
import { INITIALS_RANKS, FINALS_RANKS, TONES_RANKS } from '../data/ranks';

interface OverlaysProps {
  showPerfect: boolean;
  rankModalType: 'total' | 'core' | 'focus' | null;
  setRankModalType: (type: 'total' | 'core' | 'focus' | null) => void;
  activeModule: ActiveModule;
  totalRankInfo: { level: number, rank: { emoji: string, name: string } };
  gameState: string;
  combo: number;
  isPaused: boolean;
  showWeeklyPopup: boolean;
  weeklyReports: WeeklyReport[];
  setShowWeeklyPopup: (show: boolean) => void;
  showShopModal: boolean;
  setShowShopModal: (show: boolean) => void;
  currentSectPoints: number;
  handleExchangeKey: () => void;
}

export function Overlays({
  showPerfect, rankModalType, setRankModalType, activeModule,
  totalRankInfo,
  gameState, combo, isPaused,
  showWeeklyPopup, weeklyReports, setShowWeeklyPopup,
  showShopModal, setShowShopModal, currentSectPoints, handleExchangeKey
}: OverlaysProps) {
  return (
    <>
      {/* PERFECT BURST OVERLAY */}
      {showPerfect && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100] animate-fade-in-out overflow-visible">
           <span className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-rose-500 drop-shadow-[0_0_30px_rgba(251,191,36,0.8)] italic transform -rotate-12 scale-150 animate-pulse pr-8 py-4 leading-normal whitespace-nowrap">
             PERFECT!
           </span>
        </div>
      )}

      {/* RANK MODAL */}
      {rankModalType !== null && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setRankModalType(null)}>
          <div className="bg-slate-800 border border-slate-600 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6 sticky -top-6 md:-top-8 bg-slate-800 z-10 py-4 border-b border-slate-700">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                   {activeModule === 'initials' 
                      ? '⚔️ ทำเนียบยอดฝีมือลมปราณ' 
                      : activeModule === 'finals'
                      ? '🪄 ทำเนียบมหาเวทมนตร์'
                      : '⚔️ ทำเนียบเพลงกระบี่ 4 ทิศ'
                   }
                </h2>
                <button onClick={() => setRankModalType(null)} className="text-slate-400 hover:text-white text-xl p-2">✕</button>
             </div>
             
             <div className="space-y-3">
                {(() => {
                    const rankArray = activeModule === 'initials' ? INITIALS_RANKS : activeModule === 'finals' ? FINALS_RANKS : TONES_RANKS;
                    const modalCurrentRankInfo = totalRankInfo;

                   return rankArray.map((r: { emoji: string, name: string, maxExp: number }, i: number) => {
                     const isCurrent = modalCurrentRankInfo.level === i + 1;
                     const isLocked = modalCurrentRankInfo.level < i + 1;
                     return (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isCurrent ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.02]' : isLocked ? 'bg-slate-900/20 border-slate-800 opacity-40 grayscale' : 'bg-slate-800 border-slate-700'}`}>
                           <div className={`text-4xl drop-shadow-md bg-slate-900 p-2 rounded-xl ${isLocked ? 'opacity-50' : ''}`}>{r.emoji}</div>
                           <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                 <span className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>Lv.{i + 1}</span>
                                 {isCurrent && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">ยศปัจจุบัน</span>}
                              </div>
                              <h3 className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-slate-300'}`}>{r.name}</h3>
                              <span className="text-xs text-slate-400 font-bold">{r.maxExp === Infinity ? 'MAX LEVEL' : `ต้องการ ${r.maxExp} EXP`}</span>
                           </div>
                        </div>
                     )
                   });
                })()}
             </div>
          </div>
        </div>
      )}

      {/* COMBO COUNTER */}
      {gameState === 'playing' && combo > 1 && !isPaused && (
         <div className="fixed top-8 right-8 z-40 animate-bounce">
            <div className={`flex flex-col items-end ${combo >= 5 ? 'animate-pulse' : ''}`}>
               <span className="text-xl font-bold uppercase tracking-widest text-slate-400">Combo</span>
               <span className={`text-6xl font-black ${combo >= 5 ? 'text-transparent bg-clip-text bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 drop-shadow-[0_0_20px_rgba(251,146,60,0.8)]' : 'text-orange-400 drop-shadow-md'}`}>
                 x{combo}
               </span>
            </div>
         </div>
      )}

      {/* WEEKLY REPORT POPUP */}
      {showWeeklyPopup && weeklyReports.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-800 border border-slate-600 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
             <div className="text-center space-y-6">
               <h2 className="text-3xl font-black text-emerald-400">Weekly Report!</h2>
               <button onClick={() => setShowWeeklyPopup(false)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl">ลุยต่อเลย 🚀</button>
             </div>
          </div>
        </div>
      )}

      {/* EXCHANGE SHOP MODAL */}
      {showShopModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShopModal(false)}>
          <div className="bg-slate-800 border border-slate-600 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                   🏮 ร้านค้าหอตำรา
                </h2>
                <button onClick={() => setShowShopModal(false)} className="text-slate-400 hover:text-white text-xl p-2">✕</button>
             </div>
             
             <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-6 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">แต้มผลงานปัจจุบัน:</span>
                <span className="text-lg font-black text-amber-400">💰 {currentSectPoints}</span>
             </div>

             <div className="space-y-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex gap-4 items-center transition-all hover:bg-slate-700/50">
                   <div className="text-4xl drop-shadow-md bg-slate-900 p-3 rounded-xl border border-slate-700">🗝️</div>
                   <div className="flex-1">
                      <h3 className="text-lg font-black text-white mb-1">กุญแจมหาศึก (Raid Key)</h3>
                      <p className="text-xs text-slate-400 mb-2">ใช้สำหรับปลดล็อคเพื่อเข้าท้าทายบอส</p>
                      <button
                         onClick={handleExchangeKey}
                         disabled={currentSectPoints < 500}
                         className={`w-full py-2 rounded-xl font-bold transition-all text-sm flex justify-center items-center gap-2 ${
                           currentSectPoints >= 500
                           ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)] active:scale-95 cursor-pointer'
                           : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                         }`}
                      >
                         <span>แลกด้วย 500 💰</span>
                      </button>
                   </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-4 items-center opacity-60 grayscale">
                   <div className="text-4xl drop-shadow-md bg-slate-900 p-3 rounded-xl border border-slate-700">🧪</div>
                   <div className="flex-1">
                      <h3 className="text-lg font-black text-white mb-1">น้ำยาฟื้นพลัง (Coming Soon)</h3>
                      <p className="text-xs text-slate-400 mb-2">เพิ่มเลือด 1 ดวงในการต่อสู้</p>
                      <button disabled className="w-full py-2 rounded-xl font-bold bg-slate-700 text-slate-500 cursor-not-allowed text-sm">
                         ยังไม่เปิดขาย
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
