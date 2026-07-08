import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BATTLER_VOCABS } from '../data/vocabBattler';

interface VocabLearningViewProps {
  unlockedVocabs: string[];
  addUnlockedVocab: (vocab: string) => void;
  onClose: () => void;
}

type LearningPhase = 'select_category' | 'gacha' | 'reveal';

export function VocabLearningView({ unlockedVocabs, addUnlockedVocab, onClose }: VocabLearningViewProps) {
  const allVocabKeys = Object.keys(BATTLER_VOCABS);
  const lockedVocabs = allVocabKeys.filter(k => !unlockedVocabs.includes(k));
  
  // Extract unique categories
  const categories = Array.from(new Set(allVocabKeys.map(k => BATTLER_VOCABS[k].category)));

  const [phase, setPhase] = useState<LearningPhase>('select_category');
  const [currentVocabKey, setCurrentVocabKey] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSelectCategory = (category: string) => {
    // Find locked vocabs in this category
    const lockedInCategory = lockedVocabs.filter(k => BATTLER_VOCABS[k].category === category);
    if (lockedInCategory.length === 0) return; // shouldn't happen if button is disabled

    // eslint-disable-next-line react-hooks/purity
    const randomIndex = Math.floor(Math.random() * lockedInCategory.length);
    setCurrentVocabKey(lockedInCategory[randomIndex]);
    setPhase('gacha');
    setTypedAnswer('');
    setShowError(false);
    setShowSuccess(false);

    // Simulate gacha animation delay
    setTimeout(() => {
      setPhase('reveal');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVocabKey || phase !== 'reveal' || showSuccess) return;

    if (!typedAnswer.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
      return;
    }

    const normalizePinyin = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ü/g, 'v').replace(/\s+/g, '');
    };

    const targetDef = BATTLER_VOCABS[currentVocabKey];
    const targetPinyinRaw = normalizePinyin(targetDef.pinyin);
    const typedAnswerRaw = typedAnswer.toLowerCase().trim().replace(/\s+/g, '');
    const currentKeyRaw = currentVocabKey.replace(/\s+/g, '');
    
    if (typedAnswerRaw === targetPinyinRaw || typedAnswerRaw === currentKeyRaw) {
      setShowSuccess(true);
      setTimeout(() => {
        addUnlockedVocab(currentVocabKey);
        // Add a smooth fade-out phase
        setPhase('select_category');
        setCurrentVocabKey(null);
      }, 1500);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 1000);
    }
  };

  const getRarityColor = (rarity: string) => {
    if (rarity === 'HSK1') return 'text-slate-300 border-slate-400 bg-slate-800';
    if (rarity === 'HSK2') return 'text-yellow-300 border-yellow-500 bg-yellow-950/50';
    if (rarity === 'HSK3') return 'text-purple-300 border-purple-500 bg-purple-950/50';
    return 'text-slate-300';
  };

  const getRarityLabel = (rarity: string) => {
    if (rarity === 'HSK1') return 'ทั่วไป (Common)';
    if (rarity === 'HSK2') return 'หายาก (Rare)';
    if (rarity === 'HSK3') return 'ตำนาน (Epic)';
    return rarity;
  };

  return (
    <div className="flex-1 w-full min-h-[75vh] z-50 bg-slate-950 flex flex-col items-center justify-center p-4 relative rounded-3xl">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 rounded-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center text-center min-h-[60vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xl transition-colors border border-slate-600"
        >
          ✖
        </button>

        <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-2 font-wuxia drop-shadow-md">หอตำราเวท</h2>
        <p className="text-slate-400 mb-8">เรียนรู้คำศัพท์ตามหมวดหมู่เพื่อปลดล็อกขุนพล</p>

        {lockedVocabs.length === 0 ? (
          <div className="py-12 flex-1 flex flex-col justify-center items-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-amber-400 mb-2">ยินดีด้วย!</h3>
            <p className="text-slate-300">คุณได้ปลดล็อกคำศัพท์ครบทุกตัวแล้ว</p>
            <button 
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold text-lg transition-all"
            >
              ไปที่สมรภูมิเลย
            </button>
          </div>
        ) : phase === 'select_category' ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {categories.map(cat => {
              const lockedInCat = lockedVocabs.filter(k => BATTLER_VOCABS[k].category === cat).length;
              const totalInCat = allVocabKeys.filter(k => BATTLER_VOCABS[k].category === cat).length;
              const isComplete = lockedInCat === 0;

              return (
                <motion.button
                  key={cat}
                  whileHover={!isComplete ? { scale: 1.05 } : {}}
                  whileTap={!isComplete ? { scale: 0.95 } : {}}
                  onClick={() => handleSelectCategory(cat)}
                  disabled={isComplete}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center
                    ${isComplete ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : 'bg-slate-800/80 border-purple-500/50 hover:border-purple-400 hover:bg-slate-700 shadow-lg'}
                  `}
                >
                  <div className="text-2xl font-bold text-white mb-2">{cat}</div>
                  <div className="text-sm text-slate-400">
                    ปลดล็อกแล้ว: {totalInCat - lockedInCat}/{totalInCat}
                  </div>
                  {isComplete && <div className="text-green-400 text-sm mt-2 font-bold">✨ ครบแล้ว</div>}
                </motion.button>
              );
            })}
          </motion.div>
        ) : phase === 'gacha' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
            className="flex-1 flex flex-col items-center justify-center w-full"
          >
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
              transition={{ duration: 1, repeat: Infinity }}
              className="w-32 h-48 bg-slate-800 rounded-xl border-4 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            >
              <div className="text-6xl">✨</div>
            </motion.div>
            <h3 className="text-2xl font-bold text-purple-300 mt-8 animate-pulse">กำลังสุ่มการ์ด...</h3>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {currentVocabKey && phase === 'reveal' && (
              <motion.div 
                key="reveal-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-6 relative flex flex-col items-center">
                {showSuccess && (
                  <div className="absolute inset-0 bg-green-500/20 rounded-3xl animate-pulse"></div>
                )}
                
                {/* Character Card / Details */}
                <motion.div 
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={showSuccess ? { scale: 1.1, rotateY: 0 } : { scale: 1, rotateY: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className={`p-6 rounded-2xl border-2 mb-4 w-full max-w-sm flex flex-col items-center shadow-2xl bg-slate-900 ${getRarityColor(BATTLER_VOCABS[currentVocabKey].rarity)}`}
                >
                  <div className="text-sm font-bold mb-2 uppercase tracking-widest">{getRarityLabel(BATTLER_VOCABS[currentVocabKey].rarity)}</div>
                  <div className={`text-8xl md:text-9xl mb-4 filter drop-shadow-2xl`}>
                    {BATTLER_VOCABS[currentVocabKey].icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{BATTLER_VOCABS[currentVocabKey].name}</h3>
                  <div className="text-xl text-cyan-400 font-bold bg-slate-950 px-4 py-1 rounded-full border border-slate-700 mb-4">
                    {BATTLER_VOCABS[currentVocabKey].pinyin}
                  </div>
                  
                  {/* Stats */}
                  <div className="w-full grid grid-cols-2 gap-2 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between"><span>❤️ HP:</span> <span className="font-bold text-rose-400">{BATTLER_VOCABS[currentVocabKey].hp}</span></div>
                    <div className="flex justify-between"><span>⚔️ ATK:</span> <span className="font-bold text-amber-400">{BATTLER_VOCABS[currentVocabKey].atk}</span></div>
                    <div className="flex justify-between col-span-2"><span>🛡️ คลาส:</span> <span className="font-bold text-blue-300">{BATTLER_VOCABS[currentVocabKey].roleName}</span></div>
                    <div className="flex justify-between col-span-2"><span>📍 ตำแหน่ง:</span> <span className="font-bold text-emerald-400">{BATTLER_VOCABS[currentVocabKey].recommendedPosition === 'front' ? 'แถวหน้า (Front)' : 'แถวหลัง (Back)'}</span></div>
                  </div>
                </motion.div>
              </div>

              <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto relative">
                <p className="text-sm text-slate-400 mb-2">พิมพ์ Pinyin เพื่อปลดล็อก (ไม่ต้องพิมพ์วรรณยุกต์)</p>
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  disabled={showSuccess || phase !== 'reveal'}
                  autoFocus
                  className={`w-full bg-slate-800 border-2 rounded-xl px-6 py-4 text-center text-2xl text-white font-bold outline-none transition-all shadow-inner
                    ${showError ? 'border-red-500 bg-red-950/30' : 'border-slate-600 focus:border-purple-500'}
                    ${showSuccess ? 'border-green-500 bg-green-950/50 text-green-300' : ''}
                    ${phase !== 'reveal' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  placeholder={phase !== 'reveal' ? 'รอก่อน...' : 'เช่น mao'}
                />
                
                {showSuccess ? (
                  <div className="mt-4 text-green-400 font-bold text-xl animate-bounce">
                    ✨ ปลดล็อกสำเร็จ! ✨
                  </div>
                ) : (
                  <button 
                    type="submit"
                    className="w-full mt-4 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
                  >
                    ปลดล็อกการ์ด
                  </button>
                )}
              </form>
            </motion.div>
          )}
          </AnimatePresence>
        )}
        
        <div className="mt-8 text-sm text-slate-500">
          ความคืบหน้าภาพรวม: <span className="text-purple-400 font-bold">{unlockedVocabs.length}</span> / {allVocabKeys.length}
        </div>
      </div>
    </div>
  );
}
