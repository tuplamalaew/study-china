'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import confetti from 'canvas-confetti';

// 1. Datasets (Imported from data/)
import {
  PINYIN_INITIALS, PINYIN_FINALS, CONFUSING_PAIRS_INITIALS, CONFUSING_PAIRS_FINALS
} from '../data/pinyin';
import {
  INITIALS_RANKS,
  FINALS_RANKS, getRank
} from '../data/ranks';
import {
  FOCUSED_SETS_INITIALS, FOCUSED_SETS_FINALS, ALL_CATEGORIES
} from '../data/focused-sets';
import {
  TIMER_SECONDS_CORE, TIMER_SECONDS_PAIRS, REQUIRED_STREAK
} from '../data/constants';

import { useStorage } from '../hooks/useStorage';
import { formatPinyin, shuffleArray, getPinyinTrends } from '../lib/utils';
import { useAudio } from '../hooks/useAudio';
import { useGameEngine } from '../hooks/useGameEngine';
import { useStats } from '../hooks/useStats';
import { playBambooKnock, playGuzhengClick } from '../lib/audio';
import { BriefingView } from '../components/BriefingView';
import { FinishedView } from '../components/FinishedView';
import { Overlays } from '../components/Overlays';
import { DashboardView } from '../components/DashboardView';
import { StatsView } from '../components/StatsView';
import { ReportsView } from '../components/ReportsView';
import { GamePlayingView } from '../components/GamePlayingView';
import { FormationAutoBattler } from '../components/FormationAutoBattler';
import { VocabLearningView } from '../components/VocabLearningView';
import { VocabCollectionView } from '../components/VocabCollectionView';

import type {
  GameState, GameLevel, StatsViewMode, ActiveModule,
  Question, GameSession, DailyStreak, WeeklyReport, DailyReport
} from '../data/types';

export default function PinyinEarTraining() {
  // State Management
  const [activeModule, setActiveModule] = useState<ActiveModule>('initials');
  const [showShopModal, setShowShopModal] = useState(false);
  const audio = useAudio();
  const { playSound } = audio;

  // Storage Hook
  const storage = useStorage();
  const {
    gameHistory,
    perfectStreakInitials,
    perfectStreakFinals,
    perfectStreakTones,
    dailyStreak,
    expInitials,
    sectPointsInitials,
    expFinals,
    sectPointsFinals,
    expTones,
    sectPointsTones,
    bossLevelInitials,
    bossLevelFinals,
    bossLevelTones,
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
    diskSetItem,
    unlockedVocabs
  } = storage;

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Game Engine Hook
  const engine = useGameEngine(storage, audio, activeModule, inputRef);
  const {
    gameState,
    currentLevel,
    pendingBriefing,
    activeFocusSet,
    currentCategoryId,
    quizQueue,
    currentQuestionIndex,
    currentQuestion,
    baseQuestionCount,
    totalAttempts,
    hearts,
    isPaused,
    selectedAnswer,
    typedAnswer,
    setTypedAnswer,
    isTransitioning,
    timeLeft,
    assassinationPhase,
    assassinationTimer,
    combo,
    showPerfect,
    earnedExp,
    roundMistakes,
    justLostStreak,
    justGainedStreak,
    totalCorrect,
    questTarget,
    questProgress,
    playerHearts,
    bossDebuffs,
    floatingDamage,
    floatingDamageId,
    handleBriefing,
    startGame,
    nextQuestion,
    handleAnswer,
    handleTypingSubmit,
    setGameState
  } = engine;

  // Stats View State
  const [statsViewMode, setStatsViewMode] = useState<StatsViewMode>('all');
  const [statsFilter, setStatsFilter] = useState<string>('initials-level1');
  
  // Dashboard Navigation State
  const [dashboardMode, setDashboardMode] = useState<'main' | 'basic' | 'vocab'>('main');

  // Reports State
  const [rankModalType, setRankModalType] = useState<'total' | 'core' | 'focus' | null>(null);

  // Calendar State
  const [calendarWeekOffset, setCalendarWeekOffset] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Stats & Reports Hook
  const stats = useStats(gameHistory, hasLoaded, checkWeeklyPopup, calendarWeekOffset);
  const {
    getLocalISOString,
    dailyReportsMap,
    currentWeekDates,
    weeklyChartData,
    getCategoryAccuracy,
    getCategoryPlayCount,
    isTrainingComplete,
    getDailyMistakesAnalysis,
    weeklyReports
  } = stats;

  const clearStats = () => {
    if (confirm("Are you sure you want to delete ALL your training history?")) {
      saveHistory([]);
      savePerfectStreak(0, 'initials');
      savePerfectStreak(0, 'finals');
      saveExp(0, 'initials');
      saveSectPoints(0, 'initials');
      saveExp(0, 'finals');
      saveSectPoints(0, 'finals');
    }
  };

  const simulateData = () => {
    if (confirm("จำลองข้อมูลการเล่น (ปลดล็อกทุกเควสต์ + ยศขั้นสูงสุด + บอสเลเวล 10 + กุญแจ 999 ดอก) ใช่หรือไม่? (จะรีเฟรชหน้าทันที)")) {
      const mockInitials = [1, 2, 3, 4, 5, 6];
      const mockFinals = [101, 102, 103, 104, 105];
      
      diskSetItem('pinyinCompletedSetsInitials', JSON.stringify(mockInitials));
      diskSetItem('pinyinCompletedSetsFinals', JSON.stringify(mockFinals));
      
      saveExp(99999, 'initials');
      saveExp(99999, 'finals');
      saveSectPoints(99999, 'initials');
      saveSectPoints(99999, 'finals');
      
      savePerfectStreak(999, 'initials');
      savePerfectStreak(999, 'finals');
      
      setRaidKeys(999);
      diskSetItem('pinyinRaidKeys', '999');

      diskSetItem('pinyinBossLevelInitials', '10');
      diskSetItem('pinyinBossLevelFinals', '10');
      
      window.location.reload();
    }
  };

  const handleExchangeKey = () => {
    const cost = 500;
    if (currentSectPoints >= cost) {
      saveSectPoints(currentSectPoints - cost, activeModule);
      setRaidKeys(raidKeys + 1);
      localStorage.setItem('pinyinRaidKeys', (raidKeys + 1).toString());
    } else {
      alert("แต้มผลงานไม่พอ! ต้องการ 500 แต้มเพื่อแลก 1 กุญแจ");
    }
  };

  const activePerfectStreak = activeModule === 'initials' ? perfectStreakInitials : activeModule === 'finals' ? perfectStreakFinals : perfectStreakTones;
  const isLevel2Unlocked = activePerfectStreak >= REQUIRED_STREAK;
  const remainingQuestions = quizQueue.length - currentQuestionIndex;
  const isStreakActive = dailyStreak.lastPlayedDate === new Date().toDateString();

  const currentExp = activeModule === 'initials' ? expInitials : activeModule === 'finals' ? expFinals : expTones;
  const currentSectPoints = activeModule === 'initials' ? sectPointsInitials : activeModule === 'finals' ? sectPointsFinals : sectPointsTones;

  const totalRankInfo = getRank(currentExp, activeModule);

  const currentRankInfo = totalRankInfo; // Default for Modals/Overlays
  const currentFocusedSets = activeModule === 'initials' ? FOCUSED_SETS_INITIALS : activeModule === 'finals' ? FOCUSED_SETS_FINALS : [];

  let containerMaxWidth = 'max-w-5xl';
  if (gameState === 'stats') containerMaxWidth = 'max-w-[95vw] lg:max-w-7xl';
  else if (gameState === 'reports') containerMaxWidth = 'max-w-[95vw] lg:max-w-7xl';
  else if (gameState === 'autobattler') containerMaxWidth = 'max-w-[95vw] lg:max-w-7xl';
  else if (gameState === 'playing' || gameState === 'finished') containerMaxWidth = 'max-w-3xl';
  if (gameState === 'playing' && currentLevel === 'pairs') containerMaxWidth = 'max-w-4xl';

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, hasData } = props;
    if (!hasData) return <rect x={x} y={y} width={width} height={height} fill="#334155" rx={4} ry={4} opacity={0.3} />;
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} ry={4} />;
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans ${showPerfect ? 'animate-shake' : ''}`}>

      <Overlays
        showPerfect={showPerfect}
        rankModalType={rankModalType}
        setRankModalType={setRankModalType}
        activeModule={activeModule}
        totalRankInfo={totalRankInfo}
        gameState={gameState}
        combo={combo}
        isPaused={isPaused}
        showWeeklyPopup={showWeeklyPopup}
        weeklyReports={weeklyReports}
        setShowWeeklyPopup={setShowWeeklyPopup}
        showShopModal={showShopModal}
        setShowShopModal={setShowShopModal}
        currentSectPoints={currentSectPoints}
        handleExchangeKey={handleExchangeKey}
      />

      <div className={`w-full bg-slate-800 rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-700 transition-all duration-500 ease-in-out relative ${containerMaxWidth}`}>

        {/* === IDLE STATE (Dashboard) === */}
        {gameState === 'idle' && (
          <DashboardView
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            isStreakActive={isStreakActive}
            dailyStreak={dailyStreak}
            totalRankInfo={totalRankInfo}
            setRankModalType={setRankModalType}
            currentExp={currentExp}
            currentSectPoints={currentSectPoints}
            setShowShopModal={setShowShopModal}
            handleBriefing={handleBriefing}
            handleExchangeKey={handleExchangeKey}
            isLevel2Unlocked={isLevel2Unlocked}
            activePerfectStreak={activePerfectStreak}
            raidKeys={raidKeys}
            setRaidKeys={setRaidKeys}
            bossLevelInitials={bossLevelInitials}
            bossLevelFinals={bossLevelFinals}
            bossLevelTones={bossLevelTones}
            currentFocusedSets={currentFocusedSets}
            getCategoryAccuracy={getCategoryAccuracy}
            getCategoryPlayCount={getCategoryPlayCount}
            completedSetsInitials={completedSetsInitials}
            completedSetsFinals={completedSetsFinals}
            completedSetsTones={completedSetsTones}
            unlockedVocabs={unlockedVocabs}
            startGame={startGame}
            setStatsViewMode={setStatsViewMode}
            setGameState={setGameState}
            dashboardMode={dashboardMode}
            setDashboardMode={setDashboardMode}
          />
        )}

        {/* === STATISTICS & REPORTS STATES OMITTED FOR BREVITY, ASSUME UNCHANGED FROM PREVIOUS === */}
        {/* We will just keep the full code for stats/reports to not break it */}
        {gameState === 'stats' && (
          <StatsView
            statsViewMode={statsViewMode}
            gameHistory={gameHistory}
            setGameState={setGameState}
            clearStats={clearStats}
            statsFilter={statsFilter}
            simulateData={simulateData}
          />
        )}

        {gameState === 'reports' && (
          <ReportsView
            setGameState={setGameState}
            calendarWeekOffset={calendarWeekOffset}
            setCalendarWeekOffset={setCalendarWeekOffset}
            currentWeekDates={currentWeekDates}
            selectedDateStr={selectedDateStr}
            setSelectedDateStr={setSelectedDateStr}
            dailyReportsMap={dailyReportsMap}
            getDailyMistakesAnalysis={getDailyMistakesAnalysis}
            weeklyChartData={weeklyChartData}
            weeklyReports={weeklyReports}
          />
        )}

        {/* === FINISHED STATE === */}
        {gameState === 'finished' && (
          <FinishedView
            hearts={hearts}
            earnedExp={earnedExp}
            totalCorrect={totalCorrect}
            totalAttempts={totalAttempts}
            roundMistakes={roundMistakes}
            currentLevel={currentLevel}
            currentCategoryId={currentCategoryId}
            activeFocusSet={activeFocusSet}
            activeModule={activeModule}
            justLostStreak={justLostStreak}
            justGainedStreak={justGainedStreak}
            playSound={playSound}
            startGame={startGame}
            setGameState={setGameState}
            gameHistory={gameHistory}
          />
        )}

        {/* === BRIEFING STATE === */}
        {gameState === 'briefing' && pendingBriefing && (
          <BriefingView pendingBriefing={pendingBriefing} startGame={startGame} setGameState={setGameState} />
        )}

        {/* === PLAYING STATE === */}
        {gameState === 'playing' && currentQuestion && (
          <GamePlayingView
            currentQuestion={currentQuestion}
            currentLevel={currentLevel}
            activeModule={activeModule}
            bossLevelInitials={bossLevelInitials}
            bossLevelFinals={bossLevelFinals}
            bossDebuffs={bossDebuffs}
            questProgress={questProgress}
            questTarget={questTarget}
            floatingDamage={floatingDamage}
            playerHearts={playerHearts}
            hearts={hearts}
            remainingQuestions={remainingQuestions}
            totalAttempts={totalAttempts}
            isPaused={isPaused}
            audio={audio}
            timeLeft={timeLeft}
            isTransitioning={isTransitioning}
            selectedAnswer={selectedAnswer}
            nextQuestion={nextQuestion}
            handleAnswer={handleAnswer}
            assassinationPhase={assassinationPhase}
            handleTypingSubmit={handleTypingSubmit}
            inputRef={inputRef}
            typedAnswer={typedAnswer}
            setTypedAnswer={setTypedAnswer}
            currentCategoryId={currentCategoryId}
            playBambooKnock={playBambooKnock}
            playSound={playSound}
            setGameState={setGameState}
          />
        )}

        {/* === AUTO BATTLER STATE === */}
        {gameState === 'autobattler' && (
          <FormationAutoBattler onClose={() => { setDashboardMode('vocab'); setGameState('idle'); }} unlockedVocabs={unlockedVocabs} />
        )}

        {/* === VOCAB LEARNING STATE === */}
        {gameState === 'vocabLearning' && (
          <VocabLearningView 
            unlockedVocabs={unlockedVocabs} 
            addUnlockedVocab={storage.addUnlockedVocab} 
            onClose={() => { setDashboardMode('vocab'); setGameState('idle'); }} 
          />
        )}

        {/* === VOCAB COLLECTION STATE === */}
        {gameState === 'vocabCollection' && (
          <VocabCollectionView 
            unlockedVocabs={unlockedVocabs} 
            onClose={() => { setDashboardMode('vocab'); setGameState('idle'); }} 
          />
        )}

      </div>
    </div>
  );
}
