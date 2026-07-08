'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import type { ActiveModule, GameState, StatsViewMode, GameLevel } from '../data/types';
import { REQUIRED_STREAK } from '../data/constants';
import { playBambooKnock } from '../lib/audio';
import { formatPinyin } from '../lib/utils';

interface DashboardViewProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  isStreakActive: boolean;
  dailyStreak: { count: number, lastPlayedDate: string };
  totalRankInfo: any;
  setRankModalType: (type: 'total' | 'core' | 'focus' | null) => void;
  currentExp: number;
  currentSectPoints: number;
  handleBriefing: (level: GameLevel | 'boss') => void;
  handleExchangeKey: () => void;
  setShowShopModal: (show: boolean) => void;
  isLevel2Unlocked: boolean;
  activePerfectStreak: number;
  raidKeys: number;
  setRaidKeys: (keys: number) => void;
  bossLevelInitials: number;
  bossLevelFinals: number;
  bossLevelTones: number;
  currentFocusedSets: any[];
  completedSetsInitials: number[];
  completedSetsFinals: number[];
  completedSetsTones: number[];
  getCategoryAccuracy: (categoryId: string) => number | null;
  getCategoryPlayCount: (categoryId: string) => number;
  unlockedVocabs: string[];

  startGame: (level?: GameLevel | 'boss', focusSetId?: number | string) => void;
  setStatsViewMode: (mode: StatsViewMode) => void;
  setGameState: (state: GameState) => void;
  dashboardMode: 'main' | 'basic' | 'vocab';
  setDashboardMode: (mode: 'main' | 'basic' | 'vocab') => void;
}

export function DashboardView({
  activeModule, setActiveModule, isStreakActive, dailyStreak,
  totalRankInfo, setRankModalType, currentExp, currentSectPoints, handleBriefing, 
  handleExchangeKey, setShowShopModal,
  isLevel2Unlocked, activePerfectStreak, raidKeys, setRaidKeys,
  bossLevelInitials, bossLevelFinals, bossLevelTones,
  currentFocusedSets,
  completedSetsInitials, completedSetsFinals, completedSetsTones,
  getCategoryAccuracy, getCategoryPlayCount, unlockedVocabs, startGame, setStatsViewMode, setGameState,
  dashboardMode, setDashboardMode
}: DashboardViewProps) {
  
  const completedArr = activeModule === 'initials' ? completedSetsInitials : activeModule === 'finals' ? completedSetsFinals : completedSetsTones;
  const isQuestsUnlocked = activeModule === 'tones' || completedArr.length >= currentFocusedSets.length;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center mx-auto w-full relative"
    >
      
      <div className="absolute -top-4 -right-4 md:-top-4 md:-right-4 flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 shadow-sm cursor-help bg-slate-900" title={isStreakActive ? "You trained today!" : "Complete a game today to keep your streak!"}>
        <span className={`text-2xl ${isStreakActive ? 'animate-pulse' : 'opacity-50 grayscale'}`}>🔥</span>
        <span className={`font-bold text-sm ${isStreakActive ? 'text-orange-400' : 'text-slate-500'}`}>
          {dailyStreak.count} Day{dailyStreak.count !== 1 && 's'}
        </span>
      </div>

      <div className="mb-8 mt-4">
        <h1 className="text-5xl md:text-6xl font-wuxia tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          China is Calling
        </h1>
        <p className="text-emerald-400/80 font-bold tracking-[0.3em] uppercase text-sm font-serif">
          Pinyin Mastery
        </p>
      </div>

      <AnimatePresence mode="wait">
        {dashboardMode === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto mt-12 px-4"
          >
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDashboardMode('basic')}
              className="w-full py-8 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-3xl border-2 border-amber-900/50 hover:border-amber-500 shadow-lg hover:shadow-amber-500/20 transition-all flex flex-col items-center gap-3 group"
            >
              <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📜</span>
              <span className="text-3xl font-bold font-wuxia tracking-widest">โหมดฝึกพื้นฐาน</span>
              <span className="text-slate-400 text-sm font-medium">ฝึกฝนพยัญชนะ สระ และวรรณยุกต์ เพื่อสะสมลมปราณ</span>
            </motion.button>
            
            <motion.button 
              disabled={true}
              className="w-full py-8 bg-slate-900 opacity-80 text-cyan-700 rounded-3xl border-2 border-cyan-900/30 cursor-not-allowed flex flex-col items-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay"></div>
              <span className="text-6xl grayscale opacity-50">✨</span>
              <span className="text-3xl font-bold font-wuxia tracking-widest text-slate-500">โหมดฝึกคำศัพท์</span>
              <span className="text-slate-400 text-sm font-medium mb-2">ค่ายกลอักขระเวท - ต่อสู้อัตโนมัติด้วยคำศัพท์ภาษาจีน</span>
              <div className="mt-2 px-6 py-2 bg-cyan-900/50 border border-cyan-500/50 rounded-lg relative z-10 animate-pulse">
                <p className="text-cyan-300 text-sm font-bold uppercase tracking-widest">🚀 Coming to Unity 3D</p>
              </div>
            </motion.button>
          </motion.div>
        )}

        {dashboardMode === 'vocab' && (
          <motion.div 
            key="vocab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6 max-w-3xl mx-auto mt-8 px-4"
          >
          <div className="flex justify-start mb-2">
            <button 
              onClick={() => setDashboardMode('main')}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full font-bold text-slate-300 flex items-center gap-2 transition-all"
            >
              <span>🔙</span> กลับหน้าหลัก
            </button>
          </div>
          
          <h2 className="text-3xl font-bold text-cyan-400 mb-4 drop-shadow-md">โหมดเรียนรู้คำศัพท์ (Vocab)</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">เรียนรู้คำศัพท์เพื่อปลดล็อกตัวละคร แล้วนำไปใช้ป้องกันฐานในสมรภูมิ</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Study Mode */}
            <button
              disabled={true}
              className="group p-8 rounded-2xl border-2 bg-slate-900 opacity-80 cursor-not-allowed border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
              <span className="text-6xl mb-4 filter drop-shadow-md relative z-10 grayscale">📚</span>
              <h3 className="text-2xl font-bold text-slate-500 mb-2 relative z-10 font-wuxia">หอตำราเวท</h3>
              <p className="text-slate-400 text-sm relative z-10 mb-4">ฝึกจดจำคำศัพท์และปลดล็อกขุนพล</p>
              
              <div className="mt-auto px-4 py-2 bg-purple-900/50 border border-purple-500/50 rounded-lg relative z-10 w-full animate-pulse">
                <p className="text-purple-300 text-xs font-bold uppercase tracking-widest">🚀 Coming to Unity 3D</p>
              </div>
            </button>

            {/* Collection Mode */}
            <button
              onClick={() => setGameState('vocabCollection')}
              className="group p-8 rounded-2xl border-2 bg-slate-800 hover:bg-slate-700 border-blue-900/50 hover:border-blue-500 transition-all hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-6xl mb-4 filter drop-shadow-md relative z-10">📖</span>
              <h3 className="text-2xl font-bold text-blue-300 mb-2 relative z-10 font-wuxia">คลังคำศัพท์</h3>
              <p className="text-slate-400 text-sm relative z-10">ดูศัพท์ทั้งหมดที่ปลดล็อกแล้ว พร้อมทบทวนความจำ</p>
            </button>

            {/* Battle Mode */}
            <button
              disabled={true}
              className="group p-8 rounded-2xl border-2 bg-slate-900 opacity-80 cursor-not-allowed border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
              <span className="text-6xl mb-4 filter drop-shadow-md relative z-10 grayscale">⚔️</span>
              <h3 className="text-2xl font-bold text-slate-500 mb-2 relative z-10 font-wuxia">ค่ายกลอักขระเวท</h3>
              <p className="text-slate-400 text-sm relative z-10 mb-2">วางตัวละครจากคำศัพท์ที่ปลดล็อกแล้วเพื่อสู้ศัตรู</p>
              
              <div className="mt-auto px-4 py-2 bg-cyan-900/50 border border-cyan-500/50 rounded-lg relative z-10 w-full animate-pulse">
                <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest">🚀 Coming to Unity 3D</p>
              </div>
            </button>
          </div>
        </motion.div>
        )}

        {dashboardMode === 'basic' && (
          <motion.div 
            key="basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-8 w-full max-w-6xl mt-4"
          >
            <div className="flex justify-start mb-2 px-4">
              <button 
                onClick={() => setDashboardMode('main')}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-colors border border-slate-600 text-slate-300 flex items-center gap-2 hover:scale-105"
              >
                <span>🔙</span> กลับหน้าหลัก
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left px-4">
              {/* Left Column Content */}
              <div className="flex flex-col gap-6">
                <div 
                   onClick={() => setRankModalType('total')}
                   className="p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all cursor-pointer bg-slate-900/60 border-amber-900/40 hover:bg-slate-800/80 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                   title="คลิกเพื่อดูทำเนียบจอมยุทธ์"
                >
                   <div className="text-5xl drop-shadow-md bg-black/50 p-3 rounded-2xl border border-amber-900/50 relative">
                      {totalRankInfo.rank.emoji}
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                         <div>
                            <span className="text-[10px] font-bold bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full tracking-widest mb-1 inline-block border border-amber-700/50 font-serif">
                               📜 ระดับพลังวัตรรวม
                            </span>
                            <h2 className="text-xl font-black text-emerald-400 font-wuxia tracking-wider">
                               {totalRankInfo.rank.name}
                            </h2>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex w-full gap-2 md:gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-700">
                  <button 
                    onClick={() => setActiveModule('initials')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex flex-col items-center justify-center gap-1 ${
                      activeModule === 'initials' 
                      ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm md:text-lg">声母</span>
                    <span className="text-[10px] md:text-[11px] opacity-80">(พยัญชนะ)</span>
                  </button>
                  <button 
                    onClick={() => setActiveModule('finals')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex flex-col items-center justify-center gap-1 ${
                      activeModule === 'finals' 
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm md:text-lg">韵母</span>
                    <span className="text-[10px] md:text-[11px] opacity-80">(สระ)</span>
                  </button>
                  <button 
                    onClick={() => setActiveModule('tones')}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-sm flex flex-col items-center justify-center gap-1 ${
                      activeModule === 'tones' 
                      ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm md:text-lg">声调</span>
                    <span className="text-[10px] md:text-[11px] opacity-80">(วรรณยุกต์)</span>
                  </button>
                </div>
          {/* FOCUSED TRAINING */}
          <div className="flex flex-col bg-slate-900 rounded-3xl border border-slate-700 p-6 relative overflow-hidden flex-1 mt-6">
             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Focused Training</h3>
               
               <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setShowShopModal(true)}
                    className="flex flex-col items-end bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-700/50 hover:border-amber-500/50 cursor-pointer transition-all active:scale-95 group"
                    title="เปิดร้านค้าหอตำรา"
                 >
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-500/70 uppercase tracking-widest mb-0.5 transition-colors">ผลงานสำนัก</span>
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">💰 {currentSectPoints}</span>
                 </button>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mb-4">
               {activeModule === 'tones' ? (
                 <div className="col-span-2 flex justify-center py-4">
                   <button
                     onMouseEnter={playBambooKnock}
                     onClick={() => startGame('level1', undefined)}
                     className="w-full py-6 bg-slate-800 hover:bg-amber-900/40 border-2 border-amber-700 text-amber-500 rounded-2xl font-bold text-xl md:text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all transform hover:-translate-y-1 flex flex-col items-center gap-2"
                   >
                     <span className="text-4xl">⚔️</span>
                     <span className="text-3xl font-bold tracking-widest text-center text-amber-400 bg-amber-900/30 px-6 py-2 rounded-xl border border-amber-500/30">
                       ˉ ˊ ˇ ˋ
                     </span>
                     <span className="text-sm font-medium uppercase tracking-wide opacity-80 text-center mt-2">เริ่มฝึกเพลงกระบี่ 4 ทิศ (Train Tones)</span>
                   </button>
                 </div>
               ) : (
                 currentFocusedSets.map((set) => {
                 const focusId = `focus-${set.id}`;
                 const accuracy = getCategoryAccuracy(focusId);
                 let colorClasses = "bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500 grayscale opacity-80 text-slate-500"; 
                 let textColor = "text-slate-500";
                 
                 if (accuracy !== null) {
                    if (accuracy >= 90) { colorClasses = "bg-emerald-900/30 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-500/80"; textColor = "text-emerald-400"; }
                    else if (accuracy >= 80) { colorClasses = "bg-yellow-900/30 border-yellow-500/40 hover:bg-yellow-900/50 hover:border-yellow-500/80"; textColor = "text-yellow-400"; }
                    else { colorClasses = "bg-rose-900/30 border-rose-500/50 hover:bg-rose-900/50 hover:border-rose-500/80 border-2"; textColor = "text-rose-400"; }
                 }

                 return (
                   <button
                     key={set.id}
                     onMouseEnter={playBambooKnock}
                     onClick={() => startGame('level1', focusId)}
                     className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 items-center justify-center hover:scale-[1.02] active:scale-95 relative overflow-hidden ${colorClasses}`}
                   >
                     {accuracy !== null && (
                       <div className={`absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-900/50 ${textColor}`}>
                         {accuracy}%
                       </div>
                     )}
                     <span className={`text-xl font-bold tracking-wider text-center ${textColor}`}>
                       {set.letters.map(formatPinyin).join(' ')}
                     </span>
                     <span className="text-[11px] uppercase tracking-wide opacity-80 text-center">{set.name}</span>
                   </button>
                 );
               }))}
             </div>
             
             {activeModule === 'finals' && (
               <p className="text-slate-500 text-xs mt-auto font-semibold italic border border-slate-700 bg-slate-800 p-2 rounded-lg w-full text-center">
                 💡 Tip: ใช้ตัว <kbd className="font-mono text-emerald-400 font-bold px-1">v</kbd> พิมพ์แทน <kbd className="font-mono text-emerald-400 font-bold px-1">ü</kbd>
               </p>
             )}
          </div>
          
          <button 
             onClick={() => { setStatsViewMode('all'); setGameState('stats'); }}
             className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-amber-400 text-lg font-bold rounded-2xl transition-all border border-amber-900/50 hover:border-amber-500 hover:text-amber-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] font-serif mt-6"
          >
             <span>📜</span> ตำหนักประวัติยุทธ์ (Stats & History)
          </button>
        </div>

        {/* === RIGHT COLUMN === */}
        {activeModule === 'initials' ? (
          <div className="flex flex-col bg-slate-900 rounded-3xl border border-slate-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <span className="text-9xl">📜</span>
            </div>
            <div className="flex w-full justify-between items-center mb-6 border-b border-slate-800 pb-4 relative z-10">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-xl">📜</span> กระดานเควสต์
               </h3>
            </div>
            
            {/* Training Camp */}
            <div className="w-full mb-6 bg-slate-950 p-4 rounded-xl border border-slate-700 relative overflow-hidden">
               <h4 className="text-sm font-bold text-slate-300 mb-2 font-serif">🏕️ ค่ายฝึกซ้อม (Training Camp)</h4>
               <p className="text-xs text-slate-500 mb-3">จงผ่านการทดสอบในบทเรียนปัจจุบันเพื่อรับเควสต์ประจำวัน</p>
               <div className="flex justify-between items-center text-xs font-bold bg-slate-900 p-2 rounded border border-slate-800">
                  <span className={isQuestsUnlocked ? 'text-emerald-400' : 'text-amber-400'}>
                     สถานะ: {completedArr.length} / {currentFocusedSets.length} บทเรียน
                  </span>
                  <span>{isQuestsUnlocked ? '✅ พร้อมลุยเควสต์' : '🔒 ล็อกเควสต์'}</span>
               </div>
            </div>
            
            <div className="w-full space-y-3 relative mb-6">
               {/* CLONE SKILL QUEST */}
               <button 
                 onMouseEnter={playBambooKnock}
                 onClick={() => handleBriefing('clones')}
                 className={`w-full py-4 bg-slate-800 text-slate-200 border-2 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-between px-6 ${
                   isQuestsUnlocked 
                   ? 'hover:bg-cyan-900/40 border-slate-700 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transform hover:-translate-y-1'
                   : 'opacity-50 grayscale cursor-not-allowed border-slate-800'
                 }`}
                 disabled={!isQuestsUnlocked}
               >
                  <div className="flex items-center gap-4">
                     <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">🥷</span>
                     <div className="text-left">
                        <div className={`font-bold text-lg ${isQuestsUnlocked ? 'text-cyan-400' : 'text-slate-500'}`}>วิชาแยกเงา (Clone Skill)</div>
                        <div className="text-xs text-slate-400 font-medium">จับผิดนินจาเงา (10-15 เป้าหมาย)</div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-1 rounded font-mono border border-emerald-800 mb-1">+200 EXP</div>
                     <div className="text-[10px] text-yellow-500/70">🗝️ +1 Key</div>
                  </div>
               </button>
            </div>
            
            <div className="w-full h-px bg-slate-800 mb-6 mt-auto relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-4 text-xs font-bold text-amber-500/80 uppercase tracking-widest font-serif whitespace-nowrap">มหาศึกดวลบอส (Boss Raid)</div>
            </div>

            <button 
              disabled={raidKeys < 5}
              onClick={() => handleBriefing('boss')}
              className={`w-full py-5 text-lg md:text-xl font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 border relative overflow-hidden ${
                raidKeys >= 5 
                ? 'bg-slate-900 hover:bg-amber-900/40 text-amber-500 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:-translate-y-1' 
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-70 grayscale'
              }`}
            >
              {raidKeys >= 5 && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>}
              {raidKeys >= 5 ? (
                 <>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🔥</span> 
                    <span className="drop-shadow-md truncate max-w-[80%] text-center">ประลองบอสระดับ {bossLevelInitials} (พร้อมลุย)</span>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🔥</span>
                 </>
              ) : (
                 <>
                    <span>🔒</span>
                    <span className="truncate max-w-[85%] text-center">สะสมกุญแจ {raidKeys}/5 เพื่อปลดล็อคบอสระดับ {bossLevelInitials}</span>
                 </>
              )}
            </button>
          </div>
        ) : activeModule === 'finals' ? (
          <div className="flex flex-col bg-slate-900 rounded-3xl border border-purple-900/30 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <span className="text-9xl">🔮</span>
            </div>
            <div className="flex w-full justify-between items-center mb-6 border-b border-purple-900/40 pb-4 relative z-10">
               <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-xl">🔮</span> กระดานเวทมนตร์
               </h3>
            </div>
            
            {/* Training Camp */}
            <div className="w-full mb-6 bg-slate-950 p-4 rounded-xl border border-purple-900/50 relative overflow-hidden">
               <h4 className="text-sm font-bold text-purple-300 mb-2 font-serif flex items-center gap-2">
                  <span>📜</span> คัมภีร์เวทมนตร์
               </h4>
               <p className="text-xs text-slate-500 mb-3">จงรวบรวมความรู้จากการฝึกซ้อม (Focused Training) เพื่อปลดล็อคพลัง</p>
               <div className="w-full bg-slate-950/50 rounded-full h-1.5 mb-2 overflow-hidden border border-purple-900/30">
                  <div className={`h-full ${isQuestsUnlocked ? 'bg-amber-500' : 'bg-slate-700'}`} style={{ width: `${(completedArr.length / currentFocusedSets.length) * 100}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-xs font-bold bg-slate-900 p-2 rounded border border-purple-900/30">
                  <span className={isQuestsUnlocked ? 'text-purple-400' : 'text-slate-500'}>
                     สถานะ: {completedArr.length} / {currentFocusedSets.length} บทเรียน
                  </span>
                  <span>{isQuestsUnlocked ? '✅ พลังเวทเต็มเปี่ยม' : '🔒 กำลังรวบรวมพลัง'}</span>
               </div>
            </div>
            
            <div className="w-full space-y-3 relative mb-6">
               {/* TALISMAN QUEST */}
               <button 
                 onMouseEnter={playBambooKnock}
                 onClick={() => handleBriefing('talisman')}
                 className={`w-full py-4 bg-slate-800 text-slate-200 border-2 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-between px-6 ${
                   isQuestsUnlocked 
                   ? 'hover:bg-purple-900/40 border-purple-900/50 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transform hover:-translate-y-1'
                   : 'opacity-50 grayscale cursor-not-allowed border-slate-800'
                 }`}
                 disabled={!isQuestsUnlocked}
               >
                  <div className="flex items-center gap-4">
                     <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">🔮</span>
                     <div className="text-left">
                        <div className={`font-bold text-lg ${isQuestsUnlocked ? 'text-purple-400' : 'text-slate-500'}`}>สกัดอักขระเวท (Talisman)</div>
                        <div className="text-xs text-slate-400 font-medium">ผสมอักขระเวทด้วยความไว</div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded font-mono border border-purple-800 mb-1">+200 EXP</div>
                     <div className="text-[10px] text-yellow-500/70">🗝️ +1 Key</div>
                  </div>
               </button>
            </div>
            
            <div className="w-full h-px bg-purple-900/50 mb-6 mt-auto relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-4 text-xs font-bold text-amber-500/80 uppercase tracking-widest font-serif whitespace-nowrap border border-purple-900/30 rounded-full">มหาศึกดวลบอส (Boss Raid)</div>
            </div>

            <button 
              disabled={raidKeys < 5}
              onClick={() => handleBriefing('boss')}
              className={`w-full py-5 text-lg md:text-xl font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 border relative overflow-hidden ${
                raidKeys >= 5 
                ? 'bg-slate-900 hover:bg-fuchsia-900/40 text-fuchsia-500 border-fuchsia-600 shadow-[0_0_15px_rgba(217,70,239,0.2)] hover:shadow-[0_0_25px_rgba(217,70,239,0.4)] cursor-pointer hover:-translate-y-1' 
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-70 grayscale'
              }`}
            >
              {raidKeys >= 5 && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>}
              {raidKeys >= 5 ? (
                 <>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">🔥</span> 
                    <span className="drop-shadow-md truncate max-w-[80%] text-center">ประลองบอสระดับ {bossLevelFinals} (พร้อมลุย)</span>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">🔥</span>
                 </>
              ) : (
                 <>
                    <span>🔒</span>
                    <span className="truncate max-w-[85%] text-center">สะสมกุญแจ {raidKeys}/5 เพื่อปลดล็อคบอสระดับ {bossLevelFinals}</span>
                 </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col bg-slate-900 rounded-3xl border border-amber-900/30 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 to-transparent"></div>
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <span className="text-9xl">⚔️</span>
            </div>
            <div className="flex w-full justify-between items-center mb-6 border-b border-amber-900/40 pb-4 relative z-10">
               <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-xl">⚔️</span> กระดานเพลงกระบี่
               </h3>
            </div>
            
            <div className="w-full mb-6 bg-slate-950 p-4 rounded-xl border border-amber-900/50 relative overflow-hidden">
               <h4 className="text-sm font-bold text-amber-300 mb-2 font-serif flex items-center gap-2">
                  <span>📜</span> คัมภีร์เพลงกระบี่
               </h4>
               <p className="text-xs text-slate-500 mb-3">จงฝึกฝนเพลงกระบี่ 4 ทิศให้เชี่ยวชาญเพื่อปลดล็อคพลัง</p>
               <div className="flex justify-between items-center text-xs font-bold bg-slate-900 p-2 rounded border border-amber-900/30">
                  <span className={isQuestsUnlocked ? 'text-amber-400' : 'text-slate-500'}>
                     สถานะ: {completedArr.length} / 1 บทเรียน
                  </span>
                  <span>{isQuestsUnlocked ? '✅ พลังเต็มเปี่ยม' : '🔒 กำลังรวบรวมพลัง'}</span>
               </div>
            </div>
            
            <div className="w-full space-y-3 relative mb-6">
               {/* GUQIN QUEST */}
               <button 
                 onMouseEnter={playBambooKnock}
                 onClick={() => handleBriefing('guqin')}
                 className={`w-full py-4 bg-slate-800 text-slate-200 border-2 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-between px-6 ${
                   isQuestsUnlocked 
                   ? 'hover:bg-cyan-900/40 border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transform hover:-translate-y-1'
                   : 'opacity-50 grayscale cursor-not-allowed border-slate-800'
                 }`}
                 disabled={!isQuestsUnlocked}
               >
                  <div className="flex items-center gap-4">
                     <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">🎼</span>
                     <div className="text-left">
                        <div className={`font-bold text-lg ${isQuestsUnlocked ? 'text-cyan-400' : 'text-slate-500'}`}>พิณมารทะลวงจิต (Guqin)</div>
                        <div className="text-xs text-slate-400 font-medium">สกัดจุดเพลงพิณ 3 จังหวะ</div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-1 rounded font-mono border border-cyan-800 mb-1">+200 EXP</div>
                     <div className="text-[10px] text-yellow-500/70">🗝️ +1 Key</div>
                  </div>
               </button>
            </div>
            
            <div className="w-full h-px bg-amber-900/50 mb-6 mt-auto relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-4 text-xs font-bold text-amber-500/80 uppercase tracking-widest font-serif whitespace-nowrap border border-amber-900/30 rounded-full">มหาศึกดวลบอส (Boss Raid)</div>
            </div>

            <button 
              disabled={raidKeys < 5}
              onClick={() => handleBriefing('boss')}
              className={`w-full py-5 text-lg md:text-xl font-bold rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 border relative overflow-hidden ${
                raidKeys >= 5 
                ? 'bg-slate-900 hover:bg-amber-900/40 text-amber-500 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer hover:-translate-y-1' 
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-70 grayscale'
              }`}
            >
              {raidKeys >= 5 && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>}
              {raidKeys >= 5 ? (
                 <>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">🔥</span> 
                    <span className="drop-shadow-md truncate max-w-[80%] text-center">ประลองบอสระดับ {bossLevelTones} (พร้อมลุย)</span>
                    <span className="animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">🔥</span>
                 </>
              ) : (
                 <>
                    <span>🔒</span>
                    <span className="truncate max-w-[85%] text-center">สะสมกุญแจ {raidKeys}/5 เพื่อปลดล็อคบอสระดับ {bossLevelTones}</span>
                 </>
              )}
            </button>
          </div>
        )}
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
