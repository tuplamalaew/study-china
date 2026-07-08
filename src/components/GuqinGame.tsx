'use client';

import React, { useState, useEffect } from 'react';

interface GuqinGameProps {
  playSound: (pinyin: string) => void;
  correctAnswer: string;
  onAnswer: (answer: string) => void;
  isPaused: boolean;
}

const TONES_POOL = ['ma1', 'ma2', 'ma3', 'ma4', 'yi1', 'yi2', 'yi3', 'yi4'];
const STRINGS = ['1', '2', '3', '4'];

const getToneSymbol = (toneNum: string) => {
  if (toneNum === '1') return 'ˉ';
  if (toneNum === '2') return 'ˊ';
  if (toneNum === '3') return 'ˇ';
  if (toneNum === '4') return 'ˋ';
  return '';
};

export default function GuqinGame({ playSound, correctAnswer, onAnswer, isPaused }: GuqinGameProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState<'success' | 'fail' | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const handleFail = () => {
    setShowResult('fail');
    setTimeLeft(null);
    onAnswer('WRONG_ANSWER_NO_PAUSE'); // Reduce heart immediately without changing page
  };

  const playSequence = async (seq: string[]) => {
    setIsPlaying(true);
    setTimeLeft(null); // Stop timer while playing
    for (let i = 0; i < seq.length; i++) {
      playSound(`examples/${seq[i]}.mp3`);
      // reduced delay based on user request
      const delay = i === 0 ? 1400 : 900;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setIsPlaying(false);
    setTimeLeft(5); // Give 5 seconds to answer
  };

  // Initialize sequence
  useEffect(() => {
    if (isPaused) return;
    
    // Generate combo of 3
    const newSeq: string[] = [];
    for (let i = 0; i < 3; i++) {
      newSeq.push(TONES_POOL[Math.floor(Math.random() * TONES_POOL.length)]);
    }
    setSequence(newSeq);
    setPlayerInput([]);
    setShowResult(null);
    
    // Auto play after a short delay
    const timer = setTimeout(() => {
      playSequence(newSeq);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isPaused, correctAnswer]); // Re-run when correctAnswer changes (next round)

  // Local timer for answering
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isPlaying || showResult !== null || isPaused) return;

    const timer = setTimeout(() => {
      if (timeLeft === 1) {
        handleFail();
        setTimeLeft(0);
      } else {
        setTimeLeft(prev => prev! - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, showResult, isPaused]);



  const handleStringPluck = (toneNum: string) => {
    if (isPlaying || showResult || isPaused) return;
    
    // Play a generic sound for the string, or we can just not play sound. 
    // The previous version played `examples/${tone}.mp3`. But we only have `toneNum` now.
    // Let's just play a random sound with that tone so it sounds like a pluck, or play nothing.
    // Wait, the strings are just tones. We can play `ma${toneNum}.mp3` as feedback.
    playSound(`examples/ma${toneNum}.mp3`);
    
    const newInput = [...playerInput, toneNum];
    setPlayerInput(newInput);
    
    // Check if finished sequence
    if (newInput.length === sequence.length) {
      const isCorrect = newInput.every((val, idx) => val === sequence[idx].slice(-1));
      
      if (isCorrect) {
        setShowResult('success');
        setTimeLeft(null);
        setTimeout(() => {
          onAnswer(correctAnswer);
        }, 1000);
      } else {
        handleFail();
      }
    } else {
      // Early fail check
      const isCorrectSoFar = newInput.every((val, idx) => val === sequence[idx].slice(-1));
      if (!isCorrectSoFar) {
        handleFail();
      }
    }
  };

  const handleContinue = () => {
    onAnswer('NEXT_QUESTION');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in py-8">
      <div className="text-cyan-400 font-bold mb-2 tracking-widest text-xl drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] flex items-center gap-2">
        <span>พิณมารทะลวงจิต</span>
        {timeLeft !== null && showResult === null && !isPlaying && (
           <span className={`text-lg font-mono px-2 py-0.5 rounded bg-slate-800 border ${timeLeft <= 2 ? 'text-rose-400 border-rose-500 animate-pulse' : 'text-amber-400 border-amber-600'}`}>
              ⏳ {timeLeft}s
           </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-8 text-center px-4">
        ฟังคอมโบ 3 จังหวะ แล้วดีดสายพิณตอบโต้ให้ถูกต้องตามลำดับ
      </p>

      <div className="flex gap-2 mb-8 h-12 items-center">
        {sequence.map((seqTone, i) => {
          const expectedToneNum = seqTone.slice(-1);
          return (
            <div key={i} className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (!isPlaying) playSound(`examples/${seqTone}.mp3`);
                }}
                disabled={isPlaying}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 text-xl outline-none focus:outline-none hover:scale-110
                ${playerInput.length > i 
                  ? playerInput[i] === expectedToneNum 
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-rose-600 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-cyan-500 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'}`}
              >
                {playerInput.length > i ? (playerInput[i] === expectedToneNum ? getToneSymbol(playerInput[i]) : getToneSymbol(playerInput[i])) : '?'}
              </button>
              {i < sequence.length - 1 && (
                <div className={`w-8 h-1 rounded-full ${playerInput.length > i ? 'bg-cyan-500/50' : 'bg-slate-700'}`}></div>
              )}
            </div>
          )
        })}
      </div>

      <button 
        onClick={() => playSequence(sequence)}
        disabled={isPlaying || showResult !== null}
        className={`mb-12 px-4 py-1.5 text-sm rounded-full font-bold border-2 transition-all flex items-center gap-2
          ${isPlaying 
            ? 'bg-cyan-900 border-cyan-500 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse' 
            : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'}`}
      >
        <span>{isPlaying ? '🎵 กำลังบรรเลง...' : '🔊 ฟังคอมโบอีกครั้ง'}</span>
      </button>

      {/* Guqin Strings */}
      <div className="relative w-full max-w-lg h-64 bg-slate-900/80 rounded-3xl border border-slate-700 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Wood Texture / Resonator */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
        <div className="absolute left-10 w-4 h-full bg-slate-800 border-r border-slate-700/50 pointer-events-none z-0"></div>
        <div className="absolute right-10 w-4 h-full bg-slate-800 border-l border-slate-700/50 pointer-events-none z-0"></div>

        {STRINGS.map((toneNum) => {
          // Determine highlights
          let isCorrectHighlight = false;
          let isWrongHighlight = false;

          if (showResult === 'fail') {
            const currentStep = playerInput.length;
            // If they clicked something and this is what they clicked, it's wrong
            if (currentStep > 0 && playerInput[currentStep - 1] === toneNum) {
              isWrongHighlight = true;
            }
            // If they didn't click anything (timeout) or they clicked wrong, 
            // highlight what they SHOULD have clicked.
            const targetStep = Math.max(0, currentStep - 1); 
            // Wait, if they clicked wrong, the step is currentStep - 1
            // If timeout (currentStep is whatever), we should highlight currentStep
            const expectedForFail = currentStep > 0 ? sequence[currentStep - 1].slice(-1) : sequence[0].slice(-1);
            if (expectedForFail === toneNum) {
              isCorrectHighlight = true;
            }
          }
          
          return (
            <button
              key={toneNum}
              onClick={() => handleStringPluck(toneNum)}
              disabled={isPlaying || showResult !== null}
              className="group relative w-full h-12 flex items-center justify-center transition-all focus:outline-none"
            >
              {/* The String */}
              <div className={`absolute inset-x-0 h-1 transition-all shadow-[0_0_5px_rgba(0,0,0,0.5)] z-10
                ${isCorrectHighlight ? 'bg-emerald-400 h-2 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 
                  isWrongHighlight ? 'bg-rose-500 h-2 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : 
                  'bg-slate-500 group-hover:bg-cyan-400 group-active:h-2 group-active:bg-emerald-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.8)]'}
              `}></div>
              
              {/* Tone Label (Symbol) */}
              <div className={`relative z-20 px-6 py-1 rounded-full font-bold text-2xl transition-all border-2
                ${isCorrectHighlight 
                  ? 'bg-emerald-900 border-emerald-400 text-emerald-100' 
                  : isWrongHighlight
                  ? 'bg-rose-900 border-rose-500 text-rose-100'
                  : 'bg-slate-800 border-slate-600 group-hover:border-cyan-400 text-slate-300 group-hover:text-white'}
              `}>
                {getToneSymbol(toneNum)}
              </div>
            </button>
          )
        })}
      </div>
      
      {showResult === 'success' && (
        <div className="mt-8 text-2xl font-black text-emerald-400 animate-bounce drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
          ✨ ยอดเยี่ยม! สกัดจุดสำเร็จ ✨
        </div>
      )}
      {showResult === 'fail' && (
        <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in">
          <div className="text-2xl font-black text-rose-500 animate-pulse drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">
            💥 พลาดแล้ว! โดนพลังตีกลับ 💥
          </div>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all transform hover:-translate-y-1"
          >
            ยอมรับและไปต่อ
          </button>
        </div>
      )}
    </div>
  );
}
