import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BATTLER_VOCABS } from '../data/vocabBattler';
import { playTTS } from '../lib/audio';

interface VocabCollectionViewProps {
  unlockedVocabs: string[];
  onClose: () => void;
}

const CATEGORIES = ['ทั้งหมด', 'สัตว์ (Animals)', 'ธรรมชาติ (Nature)', 'บุคคล (People)', 'สิ่งของ (Objects)'];
const RARITIES = ['ทั้งหมด', 'HSK1', 'HSK2', 'HSK3'];
const RANGES = ['ทั้งหมด', 'melee', 'ranged', 'magic', 'tank'];
const POSITIONS = ['ทั้งหมด', 'front', 'back'];

export function VocabCollectionView({ unlockedVocabs, onClose }: VocabCollectionViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('ทั้งหมด');
  const [filterRarity, setFilterRarity] = useState<string>('ทั้งหมด');
  const [filterRange, setFilterRange] = useState<string>('ทั้งหมด');
  const [filterPosition, setFilterPosition] = useState<string>('ทั้งหมด');

  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showError, setShowError] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const filteredVocabs = useMemo(() => {
    return unlockedVocabs.filter(key => {
      const def = BATTLER_VOCABS[key];
      if (!def) return false;
      
      if (filterCategory !== 'ทั้งหมด' && def.category !== filterCategory) return false;
      if (filterRarity !== 'ทั้งหมด' && def.rarity !== filterRarity) return false;
      if (filterRange !== 'ทั้งหมด' && def.type !== filterRange) return false;
      if (filterPosition !== 'ทั้งหมด' && def.recommendedPosition !== filterPosition) return false;
      
      return true;
    });
  }, [unlockedVocabs, filterCategory, filterRarity, filterRange, filterPosition]);

  const handleCardClick = (key: string) => {
    setSelectedCardKey(key);
    setTypedAnswer('');
    setShowError(false);
    setIsRevealed(false);
  };

  const closePopup = () => {
    setSelectedCardKey(null);
    setIsRevealed(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardKey || isRevealed) return;

    const normalizePinyin = (str: string) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ü/g, 'v').replace(/\s+/g, '');
    };

    const targetDef = BATTLER_VOCABS[selectedCardKey];
    const targetPinyinRaw = normalizePinyin(targetDef.pinyin);
    const typedAnswerRaw = typedAnswer.toLowerCase().trim().replace(/\s+/g, '');
    const currentKeyRaw = selectedCardKey.replace(/\s+/g, '');
    
    if (typedAnswerRaw === targetPinyinRaw || typedAnswerRaw === currentKeyRaw) {
      setIsRevealed(true);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 800);
    }
  };

  const getRarityColor = (rarity: string) => {
    if (rarity === 'HSK1') return 'border-slate-400 bg-slate-800 text-slate-300';
    if (rarity === 'HSK2') return 'border-yellow-500 bg-yellow-900/50 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
    if (rarity === 'HSK3') return 'border-purple-500 bg-purple-900/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
    return 'border-slate-500 bg-slate-800 text-slate-300';
  };

  const getRarityLabel = (rarity: string) => {
    if (rarity === 'HSK1') return 'ทั่วไป (Common)';
    if (rarity === 'HSK2') return 'หายาก (Rare)';
    if (rarity === 'HSK3') return 'ตำนาน (Epic)';
    return rarity;
  };

  return (
    <div className="flex-1 w-full min-h-[85vh] z-50 bg-slate-950 flex flex-col items-center p-4 md:p-8 overflow-y-auto rounded-3xl relative">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 rounded-3xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-700 backdrop-blur-md">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition-colors border border-slate-600 text-slate-300"
          >
            🔙 กลับ
          </button>
          
          <h2 className="text-3xl font-bold text-blue-400 font-wuxia drop-shadow-md">คลังคำศัพท์ ({unlockedVocabs.length})</h2>
          
          <div className="w-24"></div> {/* spacer */}
        </div>

        {/* Filters */}
        <div className="w-full bg-slate-900/60 p-6 rounded-2xl border border-slate-700 mb-8 flex flex-col gap-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold w-24">หมวดหมู่:</span>
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${filterCategory === cat ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold w-24">ระดับ HSK:</span>
            {RARITIES.map(r => (
              <button 
                key={r} 
                onClick={() => setFilterRarity(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${filterRarity === r ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
              >
                {r === 'ทั้งหมด' ? r : getRarityLabel(r)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold w-24">ระยะโจมตี:</span>
            {RANGES.map(r => (
              <button 
                key={r} 
                onClick={() => setFilterRange(r)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${filterRange === r ? 'bg-red-600 border-red-400 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold w-24">ตำแหน่ง:</span>
            {POSITIONS.map(p => (
              <button 
                key={p} 
                onClick={() => setFilterPosition(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${filterPosition === p ? 'bg-green-600 border-green-400 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
              >
                {p === 'ทั้งหมด' ? p : p === 'front' ? 'แถวหน้า (Front)' : 'แถวหลัง (Back)'}
              </button>
            ))}
          </div>
        </div>

        {/* Card Grid */}
        {filteredVocabs.length === 0 ? (
          <div className="text-slate-500 text-xl py-12">ไม่พบคำศัพท์ที่ตรงกับเงื่อนไข</div>
        ) : (
          <motion.div 
            initial="hidden" animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filteredVocabs.map(key => {
              const def = BATTLER_VOCABS[key];
              return (
                <motion.button 
                  key={key}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 20 },
                    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCardClick(key)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-shadow group bg-slate-900 ${getRarityColor(def.rarity)}`}
                >
                  <div className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                    {def.rarity}
                  </div>
                  <div className="text-6xl md:text-7xl my-4 drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all">
                    {def.icon}
                  </div>
                  <div className="font-bold text-white text-lg">{def.name}</div>
                  <div className="text-xs mt-1 text-slate-400">คลิกเพื่อทบทวนพินอิน</div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Popup Quiz / Details Modal */}
      <AnimatePresence>
      {selectedCardKey && BATTLER_VOCABS[selectedCardKey] && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className={`w-full max-w-sm bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl relative transition-colors ${showError ? 'animate-shake border-red-500' : 'border-blue-500'} flex flex-col items-center`}
          >
            
            <button 
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {isRevealed ? (
              // Revealed State (Details)
              <motion.div 
                initial={{ rotateY: 180, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}
                className="flex flex-col items-center w-full mt-4"
              >
                <div className={`text-sm font-bold mb-2 uppercase tracking-widest px-3 py-1 rounded-full ${getRarityColor(BATTLER_VOCABS[selectedCardKey].rarity)}`}>
                  {getRarityLabel(BATTLER_VOCABS[selectedCardKey].rarity)}
                </div>
                <div className="text-8xl md:text-9xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {BATTLER_VOCABS[selectedCardKey].icon}
                </div>
                <h3 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                  {BATTLER_VOCABS[selectedCardKey].name}
                  <button 
                    onClick={() => playTTS(BATTLER_VOCABS[selectedCardKey as string].name)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-xl transition-all shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  >
                    🔊
                  </button>
                </h3>
                <div className="text-xl text-cyan-400 font-bold bg-slate-950 px-4 py-1 rounded-full border border-slate-700 mb-6">
                  {BATTLER_VOCABS[selectedCardKey].pinyin}
                </div>
                
                {/* Stats */}
                <div className="w-full grid grid-cols-2 gap-3 text-sm text-slate-300 bg-slate-950/80 p-4 rounded-xl border border-slate-700">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">❤️ HP (พลังชีวิต)</span>
                    <span className="font-bold text-rose-400 text-lg">{BATTLER_VOCABS[selectedCardKey].hp}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">⚔️ ATK (พลังโจมตี)</span>
                    <span className="font-bold text-amber-400 text-lg">{BATTLER_VOCABS[selectedCardKey].atk}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-slate-500 text-xs">⚡ ASPD (ความเร็วโจมตี)</span>
                    <span className="font-bold text-yellow-400">{(1000 / BATTLER_VOCABS[selectedCardKey].cooldownMs).toFixed(1)} / วินาที</span>
                  </div>
                  <div className="flex flex-col col-span-2 mt-2">
                    <span className="text-slate-500 text-xs">🛡️ คลาส (Role)</span>
                    <span className="font-bold text-blue-300">{BATTLER_VOCABS[selectedCardKey].roleName}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-slate-500 text-xs">📍 ตำแหน่งแนะนำ</span>
                    <span className="font-bold text-emerald-400">{BATTLER_VOCABS[selectedCardKey].recommendedPosition === 'front' ? 'แถวหน้า (Front)' : 'แถวหลัง (Back)'}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-slate-500 text-xs">🏷️ หมวดหมู่</span>
                    <span className="font-bold text-purple-400">{BATTLER_VOCABS[selectedCardKey].category}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Quiz State (Face down)
              <motion.div 
                exit={{ rotateY: 90, opacity: 0 }}
                className="flex flex-col items-center w-full mt-4"
              >
                <div className="text-sm text-slate-400 mb-4 font-bold bg-slate-800 px-4 py-1 rounded-full">โหมดทบทวนความจำ</div>
                
                <div className="text-8xl md:text-9xl mb-6 filter drop-shadow-lg grayscale opacity-80">
                  {BATTLER_VOCABS[selectedCardKey].icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-6">คำนี้คืออะไร?</h3>

                <form onSubmit={handleSubmit} className="w-full">
                  <p className="text-xs text-slate-400 mb-2 text-center">พิมพ์ Pinyin เพื่อเปิดไพ่ (ไม่ต้องพิมพ์วรรณยุกต์)</p>
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    autoFocus
                    className={`w-full bg-slate-950 border-2 rounded-xl px-4 py-4 text-center text-xl text-white font-bold outline-none transition-all shadow-inner
                      ${showError ? 'border-red-500 bg-red-950/30' : 'border-slate-600 focus:border-blue-500'}
                    `}
                    placeholder="พิมพ์พินอิน..."
                  />
                  <button 
                    type="submit"
                    className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    เปิดดูข้อมูล
                  </button>
                </form>
              </motion.div>
            )}
            
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
