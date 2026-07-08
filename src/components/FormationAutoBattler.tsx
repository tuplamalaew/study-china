import React, { useEffect, useState } from 'react';
import { useAutoBattler } from '../hooks/useAutoBattler';
import { BATTLER_VOCABS, FALLBACK_UNIT } from '../data/vocabBattler';
import { PINYIN_INITIALS, PINYIN_FINALS } from '../data/pinyin';

interface FormationAutoBattlerProps {
  onClose: () => void;
  unlockedVocabs: string[];
}

const splitPinyin = (pinyin: string) => {
  const sortedInitials = [...PINYIN_INITIALS].sort((a, b) => b.length - a.length);
  const initial = sortedInitials.find(i => pinyin.startsWith(i)) || '';
  const final = pinyin.slice(initial.length);
  return { initial, final };
};

const generateQuizOptions = (vocabKey: string) => {
  const { initial, final } = splitPinyin(vocabKey);
  
  const randomInitials = [initial];
  while(randomInitials.length < 3) {
    const rnd = PINYIN_INITIALS[Math.floor(Math.random() * PINYIN_INITIALS.length)];
    if(!randomInitials.includes(rnd)) randomInitials.push(rnd);
  }
  const randomFinals = [final];
  while(randomFinals.length < 3) {
    const rnd = PINYIN_FINALS[Math.floor(Math.random() * PINYIN_FINALS.length)];
    if(!randomFinals.includes(rnd)) randomFinals.push(rnd);
  }
  
  randomInitials.sort(() => Math.random() - 0.5);
  randomFinals.sort(() => Math.random() - 0.5);
  
  return { initials: randomInitials, finals: randomFinals };
};

export const FormationAutoBattler: React.FC<FormationAutoBattlerProps> = ({ onClose, unlockedVocabs }) => {
  const {
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
  } = useAutoBattler(unlockedVocabs);

  const [pendingPlacement, setPendingPlacement] = useState<{row: number, col: number} | null>(null);
  const [quizOptions, setQuizOptions] = useState<{initials: string[], finals: string[]}>({ initials: [], finals: [] });
  const [quizSelectedInitial, setQuizSelectedInitial] = useState<string | null>(null);
  const [quizSelectedFinal, setQuizSelectedFinal] = useState<string | null>(null);
  const [quizError, setQuizError] = useState(false);

  const handleSlotClick = (r: number, c: number) => {
    if (battlerPhase !== 'prep') return; // Only place in prep phase
    if (selectedCardIndex === null) return;
    
    // Only allow placement on empty slots or SAME unit for upgrade
    const existing = board[`${r}-${c}`]?.unit;
    const vocabKey = shopCards[selectedCardIndex];
    const def = BATTLER_VOCABS[vocabKey] || FALLBACK_UNIT;

    if (existing && existing.name !== def.name) return; // Cannot place different unit
    if (existing && existing.star >= 3) return; // Max level
    
    const options = generateQuizOptions(vocabKey);
    
    setQuizOptions(options);
    setQuizSelectedInitial(null);
    setQuizSelectedFinal(null);
    setQuizError(false);
    setPendingPlacement({ row: r, col: c });
  };

  const handleQuizSubmit = () => {
    if (selectedCardIndex === null || !pendingPlacement) return;
    if (!quizSelectedInitial || !quizSelectedFinal) return;

    const vocabKey = shopCards[selectedCardIndex];
    if (quizSelectedInitial + quizSelectedFinal === vocabKey) {
      handlePlaceUnit(pendingPlacement.row, pendingPlacement.col, true);
      setPendingPlacement(null);
    } else {
      setQuizError(true);
      setTimeout(() => {
        setQuizError(false);
        handlePlaceUnit(pendingPlacement.row, pendingPlacement.col, false); // Applies penalty
        setPendingPlacement(null); // Close modal
      }, 800);
    }
  };

  useEffect(() => {
    initGame();
  }, [initGame]);

  const renderStars = (star: number) => {
    if (star === 1) return <div className="text-[8px] md:text-[10px] text-yellow-500">⭐</div>;
    if (star === 2) return <div className="text-[8px] md:text-[10px] text-yellow-400">⭐⭐</div>;
    if (star === 3) return <div className="text-[8px] md:text-[10px] text-yellow-300">⭐⭐⭐</div>;
    return null;
  };

  return (
    <div className="flex flex-col h-[85vh] w-full max-w-6xl mx-auto bg-slate-950 text-white rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      
      {unlockedVocabs.length < 5 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/90 relative z-50">
          <div className="text-8xl mb-6">🔒</div>
          <h2 className="text-4xl font-bold text-rose-400 mb-4 font-wuxia">ค่ายกลยังไม่เปิดใช้งาน</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-lg">
            คุณจำเป็นต้องเรียนรู้คำศัพท์อย่างน้อย <span className="font-bold text-amber-400">5 คำ</span> ในหอตำราเวทก่อน จึงจะสามารถเปิดค่ายกลอักขระเวทได้
          </p>
          <div className="bg-slate-800 px-6 py-3 rounded-full border border-slate-600 mb-8">
            ความคืบหน้า: <span className="font-bold text-emerald-400">{unlockedVocabs.length} / 5</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full font-bold text-lg transition-all"
          >
            กลับสู่เมนูหลัก
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
      <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 hidden md:block">
            ค่ายกลอักขระเวท
          </h2>
          <div className="bg-slate-800 border border-slate-600 px-4 py-1.5 rounded-full flex gap-2 items-center shadow-inner">
            <span className="text-lg">💰</span>
            <span className="text-xl font-bold text-yellow-400">{gold}</span>
          </div>
          <div className="text-lg font-bold text-slate-300 ml-2">
            Wave {wave}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {battlerPhase === 'prep' && (
            <button 
              onClick={startCombat}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 rounded-full font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all animate-pulse"
            >
              ⚔️ เริ่มต่อสู้
            </button>
          )}

          <div className="text-xl bg-slate-950 px-4 py-1 rounded-full border border-slate-700">
            <span className="font-bold text-rose-500">{'❤️'.repeat(playerHp)}</span>
          </div>
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-rose-600 rounded-lg transition-colors font-bold ml-2"
          >
            ออก
          </button>
        </div>
      </div>

      {/* Battlefield (Board + Enemies) */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50 mix-blend-overlay"></div>
        <div className="absolute top-0 bottom-0 left-0 w-[45%] bg-gradient-to-r from-cyan-900/20 to-transparent border-r-2 border-dashed border-cyan-900/30"></div>
        
        {/* Lane markers */}
        <div className="absolute top-[33%] left-0 w-full h-px bg-slate-800/50 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>
        <div className="absolute top-[66%] left-0 w-full h-px bg-slate-800/50 shadow-[0_0_10px_rgba(255,255,255,0.1)]"></div>

        {/* The 2x5 Grid */}
        {[0, 1].map(r => (
          <React.Fragment key={`row-${r}`}>
            {[0, 1, 2, 3, 4].map(c => {
              const slotId = `${r}-${c}`;
              const slot = board[slotId];
              const canPlace = battlerPhase === 'prep' && selectedCardIndex !== null;
              
              let isUpgradeTarget = false;
              if (canPlace && slot?.unit) {
                const def = BATTLER_VOCABS[shopCards[selectedCardIndex!]] || FALLBACK_UNIT;
                if (slot.unit.name === def.name && slot.unit.star < 3) {
                  isUpgradeTarget = true;
                }
              }
              
              const isPlacableEmpty = canPlace && !slot?.unit;

              return (
                <div 
                  key={slotId}
                  onClick={() => handleSlotClick(r, c)}
                  className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-all transform -translate-x-1/2 -translate-y-1/2 z-10
                    ${slot?.unit ? 'border-cyan-400 bg-cyan-950/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md' : 'border-slate-700 bg-slate-800/40 border-dashed'}
                    ${isPlacableEmpty ? 'hover:border-green-400 hover:bg-green-900/50 cursor-pointer hover:scale-110 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : ''}
                    ${isUpgradeTarget ? 'hover:border-yellow-400 hover:bg-yellow-900/50 cursor-pointer hover:scale-110 shadow-[0_0_20px_rgba(250,204,21,0.4)] animate-pulse' : ''}
                  `}
                  style={{
                    top: r === 0 ? '33%' : '66%',
                    left: `${10 + c * 8}%`, 
                  }}
                >
                  {slot?.unit ? (
                    <>
                      {renderStars(slot.unit.star)}
                      <div className={`text-3xl md:text-4xl filter drop-shadow-lg ${slot.unit.star > 1 ? 'scale-125' : ''}`}>{slot.unit.icon}</div>
                      <div className="absolute -bottom-1 -left-1 -right-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-green-500" style={{width: `${Math.max(0, (slot.unit.hp / (BATTLER_VOCABS[Object.keys(BATTLER_VOCABS).find(k=>BATTLER_VOCABS[k].name===slot.unit!.name)||'mao']?.hp * (slot.unit.star === 1 ? 1 : slot.unit.star === 2 ? 2.5 : 5))) * 100)}%`}} />
                      </div>
                    </>
                  ) : (
                    isPlacableEmpty && (
                      <span className="text-[10px] text-green-400 font-bold opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                        คลิกเพื่อวาง
                      </span>
                    )
                  )}
                  {isUpgradeTarget && (
                    <span className="absolute -top-6 text-[10px] text-yellow-400 font-bold bg-black/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                      อัปเกรด!
                    </span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {/* Enemies */}
        {enemies.map(e => (
          <div 
            key={e.id}
            className="absolute z-20 flex flex-col items-center"
            style={{
              top: e.row === 0 ? '33%' : '66%',
              left: `${e.x}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="text-4xl md:text-5xl filter drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]">{e.icon}</div>
            <div className="w-12 h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400" 
                style={{ width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%` }} 
              />
            </div>
          </div>
        ))}

        {/* Projectiles */}
        {projectiles.map(p => (
          <div 
            key={p.id}
            className="absolute h-1.5 md:h-2 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] z-15"
            style={{
              top: p.row === 0 ? '33%' : '66%',
              left: `${p.currentX}%`,
              width: '24px',
              backgroundColor: p.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <h1 className="text-6xl font-black text-rose-500 mb-4 animate-bounce">GAME OVER</h1>
            <p className="text-2xl text-slate-300 mb-8">คุณพ่ายแพ้ใน Wave {wave}</p>
            <button 
              onClick={initGame}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-xl shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all"
            >
              เริ่มใหม่ (Try Again)
            </button>
          </div>
        )}

        {/* Mixing Quiz Overlay */}
        {pendingPlacement && selectedCardIndex !== null && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-40">
            <div className={`bg-slate-800 border-2 rounded-2xl p-6 shadow-2xl transition-transform ${quizError ? 'border-red-500 animate-shake' : 'border-purple-500'}`}>
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">ร่ายคาถาอัญเชิญ!</h3>
                <button onClick={() => setPendingPlacement(null)} className="text-slate-400 hover:text-white">❌</button>
              </div>

              {quizError && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full font-bold whitespace-nowrap shadow-lg">
                  💥 ทายผิด! ถูกหัก 1 เหรียญทอง
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mb-6 bg-slate-900 p-4 rounded-xl">
                <span className="text-4xl">{BATTLER_VOCABS[shopCards[selectedCardIndex]]?.icon}</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {(quizSelectedInitial || '_') + (quizSelectedFinal || '_')}
                </span>
              </div>

              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-slate-400 font-bold mb-1">พยัญชนะ</span>
                  {quizOptions.initials.map(init => (
                    <button 
                      key={`q-init-${init}`}
                      onClick={() => setQuizSelectedInitial(init)}
                      disabled={quizError}
                      className={`w-16 h-12 rounded-lg font-bold text-xl border-2 transition-colors ${quizSelectedInitial === init ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'} disabled:opacity-50`}
                    >
                      {init}
                    </button>
                  ))}
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-slate-400 font-bold mb-1">สระ</span>
                  {quizOptions.finals.map(fin => (
                    <button 
                      key={`q-fin-${fin}`}
                      onClick={() => setQuizSelectedFinal(fin)}
                      disabled={quizError}
                      className={`w-16 h-12 rounded-lg font-bold text-xl border-2 transition-colors ${quizSelectedFinal === fin ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'} disabled:opacity-50`}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleQuizSubmit}
                disabled={!quizSelectedInitial || !quizSelectedFinal || quizError}
                className="w-full mt-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition-all"
              >
                ยืนยันการร่ายเวท
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Shop / Drafting Area */}
      <div className="h-56 bg-slate-800 border-t border-slate-700 p-4 flex flex-col justify-start relative">
        
        {/* Selected Combine Preview & Instructions */}
        <div className="absolute left-1/2 -top-12 -translate-x-1/2 flex flex-col items-center gap-1 z-30">
          <div className="text-[11px] md:text-sm font-bold text-amber-300 bg-black/60 px-4 py-1 rounded-full whitespace-nowrap">
            {battlerPhase === 'prep' 
              ? selectedCardIndex === null
                ? `🎯 Phase 1: ใช้ ${cardCost} ทอง เพื่อซื้อการ์ดและจัดค่ายกล` 
                : "✨ คลิกที่ช่องว่างเพื่อวาง, หรือคลิกตัวซ้ำเพื่ออัปเกรด!"
              : "⚔️ Phase 2: ต่อสู้! ป้องกันฐานของคุณ"}
          </div>
        </div>

        <div className="flex justify-center gap-4 md:gap-6 mt-6">
          {shopCards.map((vocabKey, i) => {
            const def = BATTLER_VOCABS[vocabKey] || FALLBACK_UNIT;
            const isSelected = selectedCardIndex === i;
            const canAfford = gold >= cardCost;
            const isShopActive = battlerPhase === 'prep';
            
            return (
              <button
                key={`shop-${i}`}
                onClick={() => isShopActive && canAfford && setSelectedCardIndex(i)}
                disabled={!isShopActive || !canAfford}
                className={`relative w-24 h-32 md:w-28 md:h-36 rounded-xl flex flex-col items-center justify-center border-2 transition-all group
                  ${isSelected 
                    ? 'bg-purple-900 border-purple-400 -translate-y-4 shadow-[0_0_20px_rgba(192,132,252,0.6)]' 
                    : isShopActive && canAfford
                      ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                      : 'bg-slate-800 border-slate-700 opacity-40 cursor-not-allowed grayscale'
                  }`}
              >
                {/* Cost */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-900 border-2 border-yellow-500 flex items-center justify-center text-yellow-300 font-bold shadow-[0_0_10px_rgba(234,179,8,0.5)] z-20">
                  {cardCost}
                </div>

                {/* Role/Position Tags */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-20 whitespace-nowrap">
                  <div className="text-[9px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{def.roleName}</div>
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${def.recommendedPosition === 'front' ? 'bg-orange-950 border-orange-500 text-orange-300' : 'bg-blue-950 border-blue-500 text-blue-300'}`}>
                    {def.recommendedPosition === 'front' ? 'แถวหน้า' : 'แถวหลัง'}
                  </div>
                </div>
                
                <div className="text-4xl md:text-5xl filter drop-shadow-md mb-2 group-hover:scale-110 transition-transform mt-4">{def.icon}</div>
                <div className="text-white font-bold text-sm md:text-base">{def.name}</div>
                <div className="text-xs text-slate-300 bg-black/40 px-2 rounded-full mt-1">{def.pinyin}</div>
              </button>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
