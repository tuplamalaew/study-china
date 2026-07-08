import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatPinyin } from '../lib/utils';

import { Question } from '../data/types';

interface TalismanCraftingGameProps {
  currentQuestion: Question;
  onAnswer: (answer: string) => void;
  floatingDamage: { id: number, text: string, type: 'normal' | 'critical' | 'damage' }[];
  playSound: (pinyin: string) => void;
  nextQuestion: () => void;
  isTimeout?: boolean;
}

const PINYIN_INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w'];
const RUNES = ['a', 'o', 'e', 'i', 'u', 'v', 'n', 'g', 'er'];

const splitPinyin = (pinyin: string) => {
  let initial = '';
  let final = pinyin;
  for (const i of PINYIN_INITIALS) {
    if (pinyin.startsWith(i)) {
      initial = i;
      final = pinyin.substring(i.length);
      break;
    }
  }
  return { initial, final };
};

interface FlyingRune {
  id: number;
  index: number;
  char: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export default function TalismanCraftingGame({ currentQuestion, onAnswer, playSound, nextQuestion, isTimeout }: TalismanCraftingGameProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [flyingRunes, setFlyingRunes] = useState<FlyingRune[]>([]);

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const flightIdCounter = useRef(0);

  const targetFinal = useMemo(() => {
    return splitPinyin(currentQuestion.correctAnswer).final;
  }, [currentQuestion]);

  const targetLength = targetFinal === 'er' ? 1 : targetFinal.length;

  const [prevQuestion, setPrevQuestion] = useState(currentQuestion);

  if (currentQuestion !== prevQuestion) {
    setPrevQuestion(currentQuestion);
    setSequence([]);
    setIsError(false);
    setIsCorrect(false);
    setIsShowingAnswer(false);
    setFlyingRunes([]);
  }

  useEffect(() => {
    if (isTimeout && !isShowingAnswer && !isCorrect) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setIsShowingAnswer(true);
        setSequence(targetFinal === 'er' ? ['er'] : targetFinal.split(''));
      }, 600);
    }
  }, [isTimeout, isShowingAnswer, isCorrect, targetFinal]);

  const handlePieceClick = (piece: string) => {
    if (sequence.length >= targetLength || isShowingAnswer || isCorrect) return;
    
    playSound(piece);
    
    const currentIndex = sequence.length;
    const btnNode = buttonRefs.current[piece];
    const slotNode = slotRefs.current[currentIndex];
    
    if (btnNode && slotNode) {
      const btnRect = btnNode.getBoundingClientRect();
      const slotRect = slotNode.getBoundingClientRect();
      
      const flight: FlyingRune = {
        id: flightIdCounter.current++,
        index: currentIndex,
        char: piece,
        startX: btnRect.left + btnRect.width / 2,
        startY: btnRect.top + btnRect.height / 2,
        targetX: slotRect.left + slotRect.width / 2,
        targetY: slotRect.top + slotRect.height / 2,
      };
      
      setFlyingRunes(prev => [...prev, flight]);
      
      setTimeout(() => {
        setFlyingRunes(prev => prev.filter(f => f.id !== flight.id));
      }, 300);
    }

    const newSequence = [...sequence, piece];
    setSequence(newSequence);

    if (newSequence.length === targetLength) {
      const crafted = newSequence.join('');
      setTimeout(() => {
        if (crafted === targetFinal) {
          setIsCorrect(true);
          onAnswer(currentQuestion.correctAnswer); // Engine will wait ~1s then call nextQuestion automatically
        } else {
          setIsError(true);
          onAnswer(crafted); // Engine deducts heart
          
          setTimeout(() => {
            setIsError(false);
            setIsShowingAnswer(true);
            setSequence(targetFinal === 'er' ? ['er'] : targetFinal.split(''));
          }, 600);
        }
      }, 350); // wait for flight animation
    }
  };

  const handleClear = () => {
    if (isShowingAnswer || isCorrect) return;
    setSequence([]);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 relative">
      
      {flyingRunes.map(flight => (
        <React.Fragment key={flight.id}>
          <style>{`
            @keyframes flight-${flight.id} {
              0% { transform: translate(calc(${flight.startX}px - 50%), calc(${flight.startY}px - 50%)) scale(1); opacity: 1; }
              100% { transform: translate(calc(${flight.targetX}px - 50%), calc(${flight.targetY}px - 50%)) scale(1); opacity: 1; }
            }
          `}</style>
          <div
            className="fixed z-[100] pointer-events-none"
            style={{
              left: 0, top: 0,
              animation: `flight-${flight.id} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`
            }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl font-bold rounded-2xl border-b-4 bg-slate-800 border-slate-900 text-purple-200 flex items-center justify-center shadow-lg">
              {formatPinyin(flight.char)}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* UI Style Block */}
      <style>{`
        @keyframes slam-down {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-40px) scale(1.05) rotate(2deg); }
          40% { transform: translateY(-40px) scale(1.05) rotate(-2deg); }
          50% { transform: translateY(10px) scale(1.1); box-shadow: 0 0 100px rgba(34,211,238,1); }
          60% { transform: translateY(-5px) scale(1.1); }
          100% { transform: translateY(0) scale(1.1); box-shadow: 0 0 80px rgba(34,211,238,1); }
        }
        .animate-slam-down {
          animation: slam-down 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes crack-shake {
          0% { transform: translateX(0) scale(1); }
          10% { transform: translateX(-15px) rotate(-3deg) scale(0.95); }
          20% { transform: translateX(15px) rotate(3deg) scale(0.95); }
          30% { transform: translateX(-15px) rotate(-3deg) scale(0.95); }
          40% { transform: translateX(15px) rotate(3deg) scale(0.95); }
          50% { transform: translateX(0) scale(1); }
        }
        .animate-crack-shake {
          animation: crack-shake 0.5s ease-in-out;
        }
      `}</style>

      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
         <div className={`w-96 h-96 rounded-full border-2 border-dashed animate-[spin_20s_linear_infinite] transition-colors duration-700 ${isCorrect ? 'border-cyan-400 bg-cyan-400/20' : isError || isShowingAnswer ? 'border-rose-500 bg-rose-500/20' : 'border-purple-500'}`}></div>
         <div className="absolute w-80 h-80 rounded-full border-4 border-purple-800 animate-[spin_15s_linear_infinite_reverse]"></div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center mb-8">
        <h2 className="text-3xl font-black text-purple-300 mb-2 tracking-widest drop-shadow-lg">สกัดอักขระเวท</h2>
        <button 
          onClick={() => playSound(currentQuestion.correctAnswer)}
          className={`w-24 h-24 rounded-full text-4xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center duration-500 ${isShowingAnswer ? 'bg-rose-900/60 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-purple-900/60 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]'}`}
        >
          🔊
        </button>
      </div>

      <div className={`min-w-[320px] h-36 backdrop-blur-md rounded-2xl flex flex-row items-center justify-center gap-3 px-8 mb-4 relative z-10 transition-colors duration-700 ${isCorrect ? 'bg-cyan-500/80 border-4 border-cyan-300 animate-slam-down' : isError || isShowingAnswer ? 'bg-rose-950/90 shadow-[0_0_60px_rgba(225,29,72,0.8)] border-4 border-rose-600' : 'bg-slate-900/80 shadow-[0_0_40px_rgba(168,85,247,0.3)] border-2 border-purple-500/40'} ${isError ? 'animate-crack-shake' : ''}`}>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none rounded-2xl"></div>
         {(isError || isShowingAnswer) && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')] opacity-80 mix-blend-overlay pointer-events-none rounded-2xl"></div>
         )}
         
         {Array.from({ length: targetLength }).map((_, i) => {
           const isFlying = flyingRunes.some(f => f.index === i);
           const slotColor = isCorrect ? 'border-cyan-200 shadow-[0_4px_15px_-2px_rgba(165,243,252,0.8)]' : isShowingAnswer ? 'border-rose-400 shadow-[0_4px_15px_-2px_rgba(251,113,133,0.8)]' : 'border-cyan-400 shadow-[0_4px_10px_-2px_rgba(34,211,238,0.5)]';
           const textColor = isCorrect ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)]' : isShowingAnswer ? 'text-rose-200 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]';

           return (
             <div 
               key={i} 
               ref={el => { slotRefs.current[i] = el; }}
               className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative z-20 transition-all duration-500 ${sequence[i] ? '' : 'border-4 border-dashed border-slate-700/50 bg-slate-800/30'}`}
             >
               {!isFlying && sequence[i] && (
                 <div className={`w-full h-full text-3xl md:text-4xl font-bold rounded-2xl border-b-4 flex items-center justify-center shadow-lg animate-pop-in transition-colors duration-500 ${isCorrect ? 'bg-cyan-400 border-cyan-300' : isShowingAnswer ? 'bg-rose-800 border-rose-900' : 'bg-slate-800 border-slate-900'}`}>
                   <span className={textColor}>
                     {formatPinyin(sequence[i])}
                   </span>
                 </div>
               )}
             </div>
           );
         })}
         
         {sequence.length > 0 && sequence.length < targetLength && !isShowingAnswer && !isCorrect && (
           <button 
             onClick={handleClear}
             className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-rose-600 hover:bg-rose-500 text-white rounded-full border-2 border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center text-xl font-bold z-30"
           >
             ✕
           </button>
         )}
      </div>

      {isShowingAnswer ? (
         <div className="z-20 mb-6 animate-fade-in">
            <button 
              onClick={() => nextQuestion()}
              className="px-10 py-4 bg-rose-600 hover:bg-rose-500 border-2 border-rose-400 rounded-full font-bold text-white text-xl shadow-[0_0_30px_rgba(225,29,72,0.6)] animate-bounce"
            >
              ต่อไป (Next)
            </button>
         </div>
      ) : (
         <div className="h-4 mb-6"></div> // spacer
      )}

      <div className="flex flex-col items-center w-full max-w-lg z-10">
         <h3 className="text-xl text-purple-300 mb-6 font-bold border-b border-purple-500/50 pb-2">สระพื้นฐาน</h3>
         <div className="flex flex-wrap justify-center gap-4">
            {RUNES.map((rune, i) => {
              const isUsed = sequence.includes(rune);
              return (
                <div key={i} className="relative w-16 h-16 md:w-20 md:h-20">
                  <div className={`absolute inset-0 rounded-2xl border-4 border-dashed border-slate-700/50 bg-slate-800/30 transition-opacity duration-300 ${isUsed ? 'opacity-100' : 'opacity-0'}`}></div>
                  <button
                    ref={el => { buttonRefs.current[rune] = el; }}
                    onClick={() => handlePieceClick(rune)}
                    disabled={sequence.length >= targetLength || isUsed || isShowingAnswer || isCorrect}
                    className={`absolute inset-0 text-3xl md:text-4xl font-bold rounded-2xl border-b-4 bg-slate-800 border-slate-900 text-purple-200 hover:bg-slate-700 hover:text-white hover:-translate-y-1 active:translate-y-1 active:border-b-0 transition-all shadow-lg hover:shadow-purple-500/20 ${isUsed ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                  >
                    {formatPinyin(rune)}
                  </button>
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
}
