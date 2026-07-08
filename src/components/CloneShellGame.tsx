'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatPinyin } from '../lib/utils';
import { getAudioCtx } from '../lib/audio';

interface CloneShellGameProps {
  currentQuestion: any;
  onAnswer: (answer: string, overrideTimeReacted?: number) => void;
  floatingDamage: any[];
  playSound: (pinyin: string) => void;
  nextQuestion: () => void;
}

type ShufflePhase = 'idle' | 'showing' | 'shuffling' | 'waiting' | 'revealing';

export default function CloneShellGame({ currentQuestion, onAnswer, floatingDamage, playSound, nextQuestion }: CloneShellGameProps) {
  const [phase, setPhase] = useState<ShufflePhase>('idle');
  const [positions, setPositions] = useState<{ id: string; pinyin: string; x: number; y: number }[]>([]);
  const [fakeClones, setFakeClones] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [waitingStartTime, setWaitingStartTime] = useState<number>(0);
  const [timerWidth, setTimerWidth] = useState(100);
  const [clickedPinyin, setClickedPinyin] = useState<string | null>(null);
  const shuffleCountRef = useRef(0);
  const maxShuffles = 8;
  
  // 4-Directional layout
  const positionsGrid = [
    { x: 0, y: -140 },  // Top
    { x: 0, y: 140 },   // Bottom
    { x: -140, y: 0 },  // Left
    { x: 140, y: 0 }    // Right
  ];

  // Initialize clones when a new question arrives
  useEffect(() => {
    if (!currentQuestion) return;
    
    const distractors = currentQuestion.options.filter((o: string) => o !== currentQuestion.correctAnswer).slice(0, 3);
    const clones = [currentQuestion.correctAnswer, ...distractors];
    clones.sort(() => Math.random() - 0.5);
    
    const initialPositions = clones.map((pinyin: string, index: number) => ({
      id: `clone-${index}`,
      pinyin,
      x: positionsGrid[index].x,
      y: positionsGrid[index].y
    }));
    
    setPositions(initialPositions);
    setPhase('showing');
    shuffleCountRef.current = 0;
    setFakeClones([]);
  }, [currentQuestion]);

  // Handle Phases
  useEffect(() => {
    if (phase === 'showing') {
      const timer = setTimeout(() => {
        setPhase('shuffling');
      }, 1500);
      return () => clearTimeout(timer);
    } else if (phase === 'shuffling') {
      // Spawn fake clones for "Thousand Clones" effect
      const fakes = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        delay: Math.random() * 0.5
      }));
      setFakeClones(fakes);

      const interval = setInterval(() => {
        setPositions(prev => {
          const newPos = [...prev];
          const idx1 = Math.floor(Math.random() * 4);
          let idx2 = Math.floor(Math.random() * 4);
          while (idx1 === idx2) idx2 = Math.floor(Math.random() * 4);
          
          const tempX = newPos[idx1].x;
          const tempY = newPos[idx1].y;
          newPos[idx1].x = newPos[idx2].x;
          newPos[idx1].y = newPos[idx2].y;
          newPos[idx2].x = tempX;
          newPos[idx2].y = tempY;
          
          return newPos;
        });
        
        // Randomize fake clones positions
        setFakeClones(prev => prev.map(f => ({
           ...f,
           x: (Math.random() - 0.5) * 400,
           y: (Math.random() - 0.5) * 400
        })));
        
        shuffleCountRef.current += 1;
        if (shuffleCountRef.current >= maxShuffles) {
          clearInterval(interval);
          setPhase('waiting');
          setWaitingStartTime(Date.now());
          setFakeClones([]); // Clear fakes
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Local Timer for Waiting Phase
  useEffect(() => {
    if (phase === 'waiting') {
      const t1 = setTimeout(() => setTimerWidth(0), 50);
      const t2 = setTimeout(() => {
         setClickedPinyin('TIMEOUT');
         setPhase('revealing');
         onAnswer('TIMEOUT', 999);
      }, 2000); // 2 seconds to answer
      return () => {
         clearTimeout(t1);
         clearTimeout(t2);
      };
    } else {
      setTimerWidth(100);
    }
  }, [phase, onAnswer]);

  const handleCloneClick = (pinyin: string) => {
    if (phase !== 'waiting') return;
    try { getAudioCtx(); } catch(e) {}
    
    setClickedPinyin(pinyin);
    setPhase('revealing');
    const timeReacted = (Date.now() - waitingStartTime) / 1000;
    onAnswer(pinyin, timeReacted);
  };

  const playAudio = () => {
    if (!currentQuestion) return;
    try { getAudioCtx(); } catch(e) {}
    playSound(currentQuestion.correctAnswer);
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center -mt-10">
      <div className="w-full max-w-[500px] aspect-square relative pointer-events-none overflow-hidden rounded-[2rem] shadow-inner border border-slate-700/50 bg-slate-900/30">
        
        {/* Center Speaker Button */}
        <button 
           onClick={playAudio}
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 hover:bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 shadow-lg z-20"
        >
           <span className="text-2xl">🔊</span>
        </button>

        {/* Fake Clones (Thousand Clones Effect) */}
        {fakeClones.map(fake => (
           <div 
             key={`fake-${fake.id}`}
             className="absolute pointer-events-none transition-all duration-300 z-10 flex flex-col items-center justify-center w-[100px] h-[100px]"
             style={{
                left: '50%',
                top: '50%',
                transform: `translate(${fake.x}px, ${fake.y}px)`,
                marginLeft: '-50px',
                marginTop: '-50px',
                transitionDelay: `${fake.delay}s`
             }}
           >
              <div className="flex flex-col items-center">
                 <span className="bg-slate-900/80 px-3 py-1 rounded-full border-2 border-slate-700 font-bold mb-1 shadow-md text-transparent w-12 h-8">
                    ?
                 </span>
                 <span className="text-6xl drop-shadow-[0_0_15px_rgba(225,29,72,0.6)] blur-[2px]">🥷</span>
              </div>
           </div>
        ))}

        {/* Real Clones */}
        {positions.map((clone, index) => {
          const showPinyin = phase === 'showing' || phase === 'idle' || phase === 'revealing';
          const isTarget = clone.pinyin === currentQuestion.correctAnswer;
          const isClicked = clone.pinyin === clickedPinyin;
          
          let ringClass = "border-slate-700 text-white bg-slate-900/80";
          if (phase === 'revealing') {
             if (isTarget) {
                ringClass = "border-emerald-500 text-emerald-400 bg-emerald-900/60 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-110";
             } else if (isClicked) {
                ringClass = "border-rose-500 text-rose-400 bg-rose-900/60 shadow-[0_0_20px_rgba(225,29,72,0.7)] scale-90";
             }
          }

          return (
            <button
              key={clone.id}
              onClick={() => {
                 if (phase === 'waiting') handleCloneClick(clone.pinyin);
              }}
              style={{
                transform: `translate(${clone.x}px, ${clone.y}px)`,
                left: '50%',
                top: '50%',
                marginLeft: '-50px',
                marginTop: '-50px'
              }}
              className={`absolute w-[100px] h-[100px] flex flex-col items-center justify-center transition-all duration-500 pointer-events-auto rounded-3xl z-10 ${
                phase === 'waiting' ? 'hover:scale-110 cursor-pointer hover:bg-slate-800/50' : 'cursor-default'
              }`}
            >
              <div className={`flex flex-col items-center ${phase === 'showing' ? 'animate-[bounce_3s_infinite]' : 'animate-[bounce_3s_infinite]'}`}>
                {showPinyin ? (
                  <span className={`px-3 py-1 rounded-full border-2 font-bold mb-1 shadow-md transition-all duration-500 ${ringClass}`}>
                    {formatPinyin(clone.pinyin)}
                  </span>
                ) : (
                  <span className="bg-slate-900/80 px-3 py-1 rounded-full border-2 border-slate-700 font-bold mb-1 shadow-md text-transparent w-12 h-8">
                    ?
                  </span>
                )}
                <span className={`text-6xl drop-shadow-[0_0_15px_rgba(225,29,72,0.6)] blur-[2px] transition-all duration-300 ${phase === 'revealing' ? '!blur-none' : ''}`}>🥷</span>
                {phase === 'revealing' && (isTarget || isClicked) && (
                   <div 
                      onClick={(e) => { e.stopPropagation(); playSound(clone.pinyin); }} 
                      className={`absolute -bottom-6 text-white rounded-full p-2 shadow-lg cursor-pointer transform hover:scale-110 transition-all border ${isTarget ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500' : 'bg-rose-700 hover:bg-rose-600 border-rose-500'}`}
                   >
                      🔊
                   </div>
                )}
              </div>
            </button>
          );
        })}
        
        {/* Floating Damage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          {floatingDamage.map(d => (
            <div key={d.id} className={`absolute font-black text-3xl transition-all duration-1000 -translate-y-12 opacity-0 flex flex-col items-center ${d.type === 'critical' ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)] scale-150' : d.type === 'damage' ? 'text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'text-white drop-shadow-md'}`} style={{ animation: 'float-up 1s ease-out forwards' }}>
                {d.text}
                {d.type === 'critical' && <span className="text-xs text-yellow-500">CRITICAL!</span>}
            </div>
          ))}
        </div>
        
      </div>
      
      {/* Phase Indicator (Outside overflow container) */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap z-30 flex flex-col items-center">
         {phase === 'showing' && <span className="text-rose-400 font-bold animate-pulse tracking-widest text-xl bg-slate-900/80 px-4 py-2 rounded-full border border-rose-900 shadow-lg">จดจำเป้าหมาย! (Focus!)</span>}
         {phase === 'shuffling' && <span className="text-blue-400 font-bold tracking-widest text-xl bg-slate-900/80 px-4 py-2 rounded-full border border-blue-900 animate-pulse shadow-lg">แยกเงาพันร่าง! (Shuffling...)</span>}
         {phase === 'waiting' && (
            <div className="flex flex-col items-center gap-2 mt-4">
               <span className="text-emerald-400 font-bold tracking-widest text-xl bg-slate-900/80 px-4 py-2 rounded-full border border-emerald-900 shadow-lg">โจมตีตัวไหน!? (Attack!)</span>
               <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
                  <div 
                     className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-300 ease-linear ${timerWidth === 0 ? 'transition-all duration-[2000ms]' : ''}`} 
                     style={{ width: `${timerWidth}%` }} 
                  />
               </div>
            </div>
         )}
         {phase === 'revealing' && (
            <button 
               onClick={() => {
                  setPhase('idle');
                  nextQuestion();
               }}
               className="mt-4 px-8 py-3 bg-cyan-700 hover:bg-cyan-600 border-2 border-cyan-400 rounded-full font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] transform hover:scale-105 transition-all text-xl tracking-widest pointer-events-auto"
            >
               ไปต่อ (Next) ➡️
            </button>
         )}
      </div>
    </div>
  );
}
