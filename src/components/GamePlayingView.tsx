'use client';

import React from 'react';
import type { GameState, GameLevel, ActiveModule, Question } from '../data/types';
import { formatPinyin } from '../lib/utils';
import { getAudioCtx } from '../lib/audio';
import { TIMER_SECONDS_PAIRS, TIMER_SECONDS_CORE } from '../data/constants';
import CloneShellGame from './CloneShellGame';
import TalismanCraftingGame from './TalismanCraftingGame';
import ToneSlashGame from './ToneSlashGame';
import GuqinGame from './GuqinGame';

interface GamePlayingViewProps {
  currentQuestion: Question;
  currentLevel: GameLevel;
  activeModule: ActiveModule;
  bossLevelInitials: number;
  bossLevelFinals: number;
  bossDebuffs: string[];
  questProgress: number;
  questTarget: number;
  floatingDamage: { id: number, text: string, type: 'normal' | 'critical' | 'damage' }[];
  playerHearts: number;
  hearts: number;
  remainingQuestions: number;
  totalAttempts: number;
  isPaused: boolean;
  audio: { playSound: (file: string) => void, audioIsPlaying?: boolean, audioFinishedAt?: number | null };
  timeLeft: number;
  isTransitioning: boolean;
  selectedAnswer: string | null;
  nextQuestion: () => void;
  handleAnswer: (answer: string, isTimeout?: boolean, overrideTimeReacted?: number) => void;
  assassinationPhase: 'stealth' | 'execute' | null;
  handleTypingSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  typedAnswer: string;
  setTypedAnswer: (val: string) => void;
  currentCategoryId: string;
  playBambooKnock: () => void;
  playSound: (pinyin: string) => void;
  setGameState: (state: GameState) => void;
}

export function GamePlayingView({
  currentQuestion, currentLevel, activeModule, bossLevelInitials, bossLevelFinals,
  bossDebuffs, questProgress, questTarget, floatingDamage, playerHearts, hearts,
  remainingQuestions, totalAttempts, isPaused, audio, timeLeft, isTransitioning,
  selectedAnswer, nextQuestion, handleAnswer, assassinationPhase,
  handleTypingSubmit, inputRef, typedAnswer, setTypedAnswer, currentCategoryId,
  playBambooKnock, playSound, setGameState
}: GamePlayingViewProps) {

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning || isPaused || currentLevel === 'clones' || currentLevel === 'talisman' || (currentLevel === 'level2' && assassinationPhase === 'execute')) return;
      
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5 };
      if (e.key in keyMap && currentQuestion?.options) {
        const index = keyMap[e.key];
        if (index < currentQuestion.options.length && selectedAnswer === null) {
          handleAnswer(currentQuestion.options[index]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, handleAnswer, isTransitioning, isPaused, currentLevel, assassinationPhase, selectedAnswer]);

  return (
    <div className="flex flex-col space-y-8 animate-fade-in mx-auto w-full relative">
      {/* RETREAT BUTTON */}
      <button
        onClick={() => {
          if (window.confirm('ต้องการถอยทัพ (ยกเลิกภารกิจ) หรือไม่?')) {
            setGameState('idle');
          }
        }}
        className="absolute -top-12 right-0 md:-right-8 z-50 bg-slate-900 hover:bg-rose-900/80 border-2 border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-100 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-[0_0_15px_rgba(225,29,72,0.6)] font-serif"
        title="ถอยทัพ"
      >
        <span className="text-xl font-bold">撤</span>
      </button>

      {['boss', 'horde', 'armored', 'speed'].includes(currentLevel) ? (
        <div className="w-full max-w-2xl mx-auto flex flex-col mb-4 animate-fade-in relative">
          <div className="flex justify-between items-center mb-2 px-2">
            <div className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl animate-bounce drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                {currentLevel === 'boss' ? '👿' : currentLevel === 'horde' ? '🥷' : currentLevel === 'armored' ? '🛡️' : currentLevel === 'clones' ? '🧪' : '⚡'}
              </span>
              <div>
                <div>
                  {currentLevel === 'boss' ? `ศึกดวลบอส Lv.${activeModule === 'initials' ? bossLevelInitials : bossLevelFinals}` :
                    currentLevel === 'horde' ? 'ฝ่าทะลวงค่ายโจร (Horde)' :
                      currentLevel === 'armored' ? 'สยบมารเกราะเหล็ก (Armored)' :
                        currentLevel === 'clones' ? 'วิชาแยกเงา (Clone Skill)' :
                          'ปีศาจวายุไร้เงา (Speed)'}
                </div>
                <div className="text-xs text-purple-400 flex gap-1 mt-1">
                  {bossDebuffs.includes('smoke') && <span className="bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700">🌫️ หมอก</span>}
                  {bossDebuffs.includes('time') && <span className="bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700">⏳ คำสาปเวลา</span>}
                  {bossDebuffs.includes('illusion') && <span className="bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700">🌀 ลวงตา</span>}
                </div>
              </div>
            </div>
            <div className="text-rose-400 font-black text-xl text-right font-wuxia tracking-wider">
              ปราณชีวิต: {questProgress} <span className="text-sm text-rose-500/70 font-mono">/ {questTarget}</span>
            </div>
          </div>
          <div className="w-full h-6 bg-slate-900/80 rounded-full border-2 border-rose-900/50 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30 mix-blend-overlay"></div>
            <div className="h-full bg-gradient-to-r from-rose-900 via-rose-600 to-amber-500 transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.6)] relative" style={{ width: `${(questProgress / questTarget) * 100}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/40 blur-[1px]"></div>
            </div>
          </div>
          <div className="relative w-full h-0 pointer-events-none">
            {floatingDamage.map(d => (
              <div key={d.id} className={`absolute right-4 -top-16 font-black text-3xl transition-all duration-1000 -translate-y-12 opacity-0 flex flex-col items-end ${d.type === 'critical' ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)] scale-150' : d.type === 'damage' ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'text-white drop-shadow-md'}`} style={{ animation: 'float-up 1s ease-out forwards' }}>
                {d.text}
                {d.type === 'critical' && <span className="text-xs text-yellow-500">CRITICAL!</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-3xl transition-all duration-500 ${i < playerHearts ? "text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-110" : "text-slate-800 scale-90 grayscale"}`}>❤️</span>
            ))}
          </div>
        </div>
      ) : currentLevel !== 'level2' && currentLevel !== 'clones' ? (
        <div className="flex justify-between items-center text-base font-semibold tracking-wider text-slate-400 uppercase">
          <span className="flex-1">{currentLevel === 'talisman' ? `Target: ${remainingQuestions}` : `Remaining: ${remainingQuestions}`}</span>

          <div className="flex justify-center flex-1">
            {hearts > 0 ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-2xl transition-all duration-500 ${i < hearts ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-110' : 'text-slate-700 opacity-30 grayscale scale-90'}`}>❤️</span>
                ))}
              </div>
            ) : (
              <span className="text-rose-500 font-bold animate-pulse text-lg tracking-widest drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">THREAT LEVEL CRITICAL</span>
            )}
          </div>

          <span className="flex-1 text-right">Attempt {totalAttempts + 1}</span>
        </div>
      ) : currentLevel === 'clones' ? (
        <div className="flex justify-between items-center text-base font-semibold tracking-wider text-slate-400 uppercase">
          <span className="flex-1 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">Target: <span className="text-white text-xl font-black">{questProgress}</span> <span className="text-xs">/ {questTarget}</span></span>

          <div className="flex justify-center flex-1">
            {hearts > 0 ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-2xl transition-all duration-500 ${i < hearts ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-110' : 'text-slate-700 opacity-30 grayscale scale-90'}`}>❤️</span>
                ))}
              </div>
            ) : (
              <span className="text-rose-500 font-bold animate-pulse text-lg tracking-widest drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">MISSION FAILED</span>
            )}
          </div>

          <span className="flex-1 text-right">Attempt {totalAttempts + 1}</span>
        </div>
      ) : (
        <div className="flex justify-between items-center text-base font-semibold tracking-wider text-slate-400 uppercase">
          <span className="flex-1">Remaining: {remainingQuestions}</span>

          <div className="flex justify-center flex-1">
            {hearts > 0 ? (
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={`text-2xl transition-all duration-500 ${i < hearts ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-110' : 'text-slate-700 opacity-30 grayscale scale-90'}`}>❤️</span>
                ))}
              </div>
            ) : (
              <span className="px-4 py-1.5 bg-slate-800 text-slate-400 border border-slate-600 rounded-full text-sm">🔧 Practice Mode</span>
            )}
          </div>

          <span className="flex-1 text-right">Attempt {totalAttempts + 1}</span>
        </div>
      )}

      {!isPaused && currentLevel !== 'clones' && (
        <div className="w-full flex flex-col items-center space-y-3 animate-fade-in max-w-2xl mx-auto">
          <div className="flex justify-between w-full text-sm font-bold text-slate-500 uppercase tracking-widest px-2">
            <span>Reflex Timer {audio?.audioIsPlaying && !audio?.audioFinishedAt ? '(Listening...)' : ''}</span>
            <span className={`text-lg ${timeLeft <= 1 && !isTransitioning ? 'text-rose-500 animate-pulse font-black' : ''}`}>
              {!audio?.audioIsPlaying && audio?.audioFinishedAt ? `${timeLeft}s` : '---'}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden relative">
            {audio?.audioIsPlaying && !audio?.audioFinishedAt ? (
              <div className="h-full w-full bg-slate-600 flex items-center justify-center overflow-hidden">
                <div className="w-1/3 h-full bg-blue-500/50 rounded-full animate-ping"></div>
              </div>
            ) : (
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft > 1 ? 'bg-blue-500' : 'bg-rose-500'}`}
                style={{ width: `${(timeLeft / (currentLevel === 'pairs' ? TIMER_SECONDS_PAIRS : TIMER_SECONDS_CORE)) * 100}%` }}
              />
            )}
          </div>
        </div>
      )}

      {!isPaused && currentLevel !== 'clones' && currentLevel !== 'talisman' && currentLevel !== 'guqin' && (
        <div className="flex justify-center py-4 animate-fade-in">
          <button
            onClick={() => playSound(currentQuestion.correctAnswer)}
            className={`rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 relative border-4 ${currentLevel === 'pairs'
                ? 'w-32 h-32 text-5xl bg-purple-600 hover:bg-purple-500 border-purple-400'
                : 'w-48 h-48 text-7xl bg-blue-600 hover:bg-blue-500 border-blue-400'
              }`}
          >
            🔊
            {selectedAnswer === 'TIMEOUT' && (
              <div className="absolute inset-0 bg-rose-500/90 rounded-full flex items-center justify-center text-3xl font-black text-white animate-fade-in backdrop-blur-sm">
                TIME UP
              </div>
            )}
          </button>
        </div>
      )}

      {/* GAME UI: Pause Review vs Level 1 vs Level 2 vs Pairs */}
      {isPaused ? (
        <div className="flex flex-col items-center bg-slate-800 rounded-3xl border-2 border-slate-600 p-8 shadow-2xl animate-fade-in w-full max-w-2xl mx-auto">
          <h3 className="text-3xl font-black text-rose-400 mb-2 tracking-wide">
            {selectedAnswer === 'TIMEOUT' ? 'หมดเวลา!' : selectedAnswer === 'COVER_BLOWN' ? 'เผยตัว! (Cover Blown)' : 'พลาดไปนิด!'}
          </h3>
          <p className="text-slate-300 mb-8 text-center text-lg">
            {selectedAnswer === 'COVER_BLOWN' ? 'ใจร้อนเกินไป! ศัตรูไหวตัวทัน ลองตั้งสติรอสัญญาณใหม่ครับ' : 'COMBO แตกซะแล้ว ลองฟังเทียบเสียงใหม่ครับ'}
          </p>

          <div className="w-full space-y-4 mb-8">
            {currentQuestion.options.map((option: string) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedAnswer;

              return (
                <div key={option} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-emerald-900/20 border-emerald-500/50' : isSelected && selectedAnswer !== 'TIMEOUT' ? 'bg-rose-900/20 border-rose-500/50' : 'bg-slate-900/50 border-slate-700'}`}>
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => playSound(option)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 ${isCorrect ? 'bg-emerald-600 text-white border-emerald-400' : isSelected && selectedAnswer !== 'TIMEOUT' ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-700 text-blue-400 border-slate-600'}`}
                    >🔊</button>
                    <span className={`text-4xl font-bold ${isCorrect ? 'text-emerald-400' : isSelected && selectedAnswer !== 'TIMEOUT' ? 'text-rose-400' : 'text-slate-300'}`}>
                      {formatPinyin(option)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={nextQuestion}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            ไปต่อ
          </button>
        </div>
      ) : currentLevel === 'pairs' ? (
        <div className="relative animate-fade-in w-full max-w-4xl mx-auto p-4 rounded-3xl overflow-hidden">
          {/* Visual Static / Wiretap Effect */}
          <div className="absolute inset-0 z-50 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
          <div className="absolute inset-0 z-40 pointer-events-none bg-slate-900/10"></div>

          <div className="grid grid-cols-2 gap-8 relative z-10">
            {currentQuestion.options.map((option: string, index: number) => {
              let buttonStateClasses = "bg-slate-800 hover:bg-slate-700 text-white border-4 border-slate-700 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]";
              if (selectedAnswer !== null) {
                if (option === currentQuestion.correctAnswer) buttonStateClasses = "bg-emerald-500 text-white border-4 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-105 z-10";
                else if (option === selectedAnswer) buttonStateClasses = "bg-rose-500 text-white border-4 border-rose-400 opacity-80";
                else buttonStateClasses = "bg-slate-800 text-slate-600 border-4 border-slate-800 opacity-50";
              }
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isTransitioning}
                  className={`py-24 text-7xl md:text-8xl font-black rounded-[3rem] transition-all duration-300 transform ${selectedAnswer === null ? 'hover:-translate-y-2' : ''} ${buttonStateClasses}`}
                >
                  <div className="absolute top-4 left-6 text-2xl text-slate-500/50 font-mono font-bold group-hover:text-slate-400">[{index + 1}]</div>
                  {formatPinyin(option)}
                </button>
              );
            })}
          </div>
        </div>
      ) : currentLevel === 'guqin' && !isPaused ? (
        <GuqinGame playSound={playSound} correctAnswer={currentQuestion.correctAnswer} onAnswer={handleAnswer} isPaused={isPaused} />
      ) : activeModule === 'tones' && currentLevel === 'level1' && selectedAnswer === null && !isPaused ? (
        <ToneSlashGame onAnswer={handleAnswer} isPaused={isPaused || selectedAnswer !== null} />
      ) : currentLevel === 'level1' || currentLevel === 'boss' ? (
        <div className={`grid gap-6 animate-fade-in w-full max-w-2xl mx-auto ${currentQuestion.options.length > 4 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
          {currentQuestion.options.map((option: string, index: number) => {
            let buttonStateClasses = "bg-slate-700 hover:bg-slate-600 text-white border-b-8 border-slate-900";
            if (selectedAnswer !== null) {
              if (option === currentQuestion.correctAnswer) {
                if (activeModule === 'tones') {
                  buttonStateClasses = "bg-amber-500 text-amber-950 border-b-8 border-amber-700 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-105 z-10 overflow-hidden relative";
                } else {
                  buttonStateClasses = "bg-emerald-500 text-white border-b-8 border-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105 z-10";
                }
              }
              else if (option === selectedAnswer) buttonStateClasses = "bg-rose-500 text-white border-b-8 border-rose-700 opacity-80";
              else buttonStateClasses = "bg-slate-800 text-slate-600 border-b-8 border-slate-900 opacity-50";
            }

            const smokeClass = currentLevel === 'boss' && bossDebuffs.includes('smoke') && selectedAnswer === null
              ? "blur-md hover:blur-none transition-all duration-300"
              : "";

            // Scout Mission (Level 1) Animation
            const isScout = currentLevel === 'level1' && selectedAnswer === null && !currentCategoryId.startsWith('focus-') && activeModule !== 'tones';
            let style: React.CSSProperties = {};
            if (isScout && typeof window !== 'undefined') {
              // Start at center of screen; physics engine will scatter them outward
              style = {
                position: 'fixed',
                left: `${window.innerWidth / 2 - 70}px`,
                top: `${window.innerHeight / 2 - 50}px`,
                width: '140px',
                height: '100px',
                zIndex: 40,
                margin: 0,
                transition: 'none'
              };
            }

            const scoutTextClass = isScout ? "text-transparent group-hover:text-white transition-colors duration-200" : "";

            return (
              <button
                id={`scout-btn-${index}`}
                key={index}
                onMouseEnter={playBambooKnock}
                onClick={() => handleAnswer(option)}
                disabled={isTransitioning}
                style={style}
                className={`group py-4 ${currentQuestion.options.length > 4 ? 'text-4xl' : 'text-5xl'} font-bold rounded-3xl transition-all duration-200 ${!isScout ? 'transform h-32' : 'shadow-xl'} ${selectedAnswer === null && !isScout ? 'hover:-translate-y-2 active:translate-y-2' : ''} ${buttonStateClasses}`}
              >
                <div className="absolute top-2 left-4 text-sm text-slate-500/50 font-mono font-bold group-hover:text-slate-400">[{index + 1}]</div>
                <span className={`inline-block ${smokeClass} ${scoutTextClass} relative z-10`}>{formatPinyin(option)}</span>
                
                {/* Theme 2: Sword Array Slice Animation */}
                {activeModule === 'tones' && selectedAnswer !== null && option === currentQuestion.correctAnswer && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                      <div className={`w-[150%] h-2 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-ping
                        ${option === 'tone1' ? 'rotate-0 scale-x-125' : 
                          option === 'tone2' ? '-rotate-45 scale-x-125' : 
                          option === 'tone3' ? 'border-b-[6px] border-r-[6px] border-white h-16 w-16 rounded-bl-sm rotate-45 !bg-transparent !shadow-none filter drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 
                          'rotate-45 scale-x-125'
                        }
                      `}></div>
                   </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 mx-auto w-full max-w-2xl animate-fade-in relative z-10">
          {currentLevel === 'level2' && assassinationPhase === 'stealth' && (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center animate-fade-in">
              <div className="text-4xl md:text-6xl font-black text-blue-900 tracking-widest animate-pulse opacity-50">รวบรวมลมปราณ...</div>
            </div>
          )}
          {currentLevel === 'level2' && assassinationPhase === 'execute' && (
            <div className="fixed inset-0 z-0 bg-white animate-[pulse_0.2s_ease-in-out_infinite] opacity-80 pointer-events-none mix-blend-overlay"></div>
          )}
          {currentLevel === 'clones' && currentQuestion ? (
            <div className="w-full min-h-[450px] relative flex items-center justify-center mt-4">
              <CloneShellGame
                currentQuestion={currentQuestion}
                onAnswer={(answer, timeReacted) => {
                  setTypedAnswer(answer);
                  handleAnswer(answer, false, timeReacted);
                }}
                floatingDamage={floatingDamage}
                playSound={playSound}
                nextQuestion={nextQuestion}
              />
            </div>
          ) : currentLevel === 'talisman' && currentQuestion ? (
            <div className="w-full min-h-[450px] relative flex items-center justify-center mt-4">
              <TalismanCraftingGame
                currentQuestion={currentQuestion}
                onAnswer={(answer) => {
                  setTypedAnswer(answer);
                  handleAnswer(answer, false);
                }}
                floatingDamage={floatingDamage}
                playSound={playSound}
                nextQuestion={nextQuestion}
                isTimeout={selectedAnswer === 'TIMEOUT'}
              />
            </div>
          ) : (
            <form onSubmit={handleTypingSubmit} className="relative z-10 w-full">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={typedAnswer}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    try { getAudioCtx(); } catch (e) { }
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (isTransitioning || isPaused) return;

                    // Prevent typing if stealth phase (though input is hidden, just in case)
                    if (currentLevel === 'level2' && assassinationPhase === 'stealth') return;

                    const val = e.target.value.toLowerCase().replace(/ü/g, 'v');

                    if (currentLevel === 'level2') {
                      const correctAns = currentQuestion?.correctAnswer || '';
                      const isPrefixMatch = correctAns.startsWith(val);
                      // Assassination Rule: No typos allowed!
                      if (!isPrefixMatch || val.length > correctAns.length) {
                        setTypedAnswer(val);
                        handleAnswer(val); // Immediately fail
                        return;
                      }
                      if (val === correctAns) {
                        setTypedAnswer(val);
                        handleAnswer(val); // Immediately succeed
                        return;
                      }
                    }
                    setTypedAnswer(val);
                  }}
                  disabled={isTransitioning}
                  placeholder="Type pinyin..."
                  className={`w-full py-8 text-center text-5xl font-bold rounded-3xl bg-slate-900 border-4 transition-all focus:outline-none ${isTransitioning ? (selectedAnswer === currentQuestion.correctAnswer ? 'border-emerald-500 text-emerald-400 bg-emerald-900/20' : 'border-rose-500 text-rose-400 bg-rose-900/20') : 'border-slate-600 focus:border-blue-500 text-white'}`}
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="hidden">Submit</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
