export interface BattlerUnitDef {
  pinyin: string;
  name: string;
  icon: string;
  hp: number;
  atk: number;
  type: 'melee' | 'ranged' | 'tank' | 'magic';
  projectileColor?: string;
  cooldownMs: number;
  manaCost: number;
  roleName: string;
  recommendedPosition: 'front' | 'back';
  category: 'สัตว์ (Animals)' | 'ธรรมชาติ (Nature)' | 'บุคคล (People)' | 'สิ่งของ (Objects)';
  rarity: 'HSK1' | 'HSK2' | 'HSK3';
}

// Basic Dictionary for Pinyin -> Emoji mappings
export const BATTLER_VOCABS: Record<string, BattlerUnitDef> = {
  // Animals
  'mao': { pinyin: 'māo', name: 'แมว', icon: '🐱', hp: 100, atk: 25, type: 'melee', cooldownMs: 1000, manaCost: 2, roleName: 'นักสู้ (Fighter)', recommendedPosition: 'front', category: 'สัตว์ (Animals)', rarity: 'HSK1' },
  'gou': { pinyin: 'gǒu', name: 'หมา', icon: '🐶', hp: 150, atk: 15, type: 'tank', cooldownMs: 1500, manaCost: 2, roleName: 'ตัวชน (Tank)', recommendedPosition: 'front', category: 'สัตว์ (Animals)', rarity: 'HSK1' },
  'ma': { pinyin: 'mǎ', name: 'ม้า', icon: '🐴', hp: 200, atk: 20, type: 'tank', cooldownMs: 1200, manaCost: 3, roleName: 'ทัพม้า (Cavalry)', recommendedPosition: 'front', category: 'สัตว์ (Animals)', rarity: 'HSK2' },
  'niu': { pinyin: 'niú', name: 'วัว', icon: '🐮', hp: 300, atk: 10, type: 'tank', cooldownMs: 2000, manaCost: 4, roleName: 'เกราะหนัก (Heavy Tank)', recommendedPosition: 'front', category: 'สัตว์ (Animals)', rarity: 'HSK2' },
  'zhu': { pinyin: 'zhū', name: 'หมู', icon: '🐷', hp: 250, atk: 5, type: 'tank', cooldownMs: 2500, manaCost: 3, roleName: 'กำแพงเนื้อ (Meat Shield)', recommendedPosition: 'front', category: 'สัตว์ (Animals)', rarity: 'HSK1' },
  'niao': { pinyin: 'niǎo', name: 'นก', icon: '🐦', hp: 50, atk: 30, type: 'ranged', projectileColor: '#fcd34d', cooldownMs: 800, manaCost: 2, roleName: 'โจมตีทางอากาศ (Air)', recommendedPosition: 'back', category: 'สัตว์ (Animals)', rarity: 'HSK3' },
  
  // Elements & Nature
  'huo': { pinyin: 'huǒ', name: 'ไฟ', icon: '🔥', hp: 80, atk: 40, type: 'ranged', projectileColor: '#ef4444', cooldownMs: 1200, manaCost: 3, roleName: 'เวทไฟ (Fire Mage)', recommendedPosition: 'back', category: 'ธรรมชาติ (Nature)', rarity: 'HSK1' },
  'shui': { pinyin: 'shuǐ', name: 'น้ำ', icon: '💧', hp: 120, atk: 20, type: 'ranged', projectileColor: '#3b82f6', cooldownMs: 1000, manaCost: 2, roleName: 'เวทน้ำ (Water Mage)', recommendedPosition: 'back', category: 'ธรรมชาติ (Nature)', rarity: 'HSK1' },
  'mu': { pinyin: 'mù', name: 'ไม้', icon: '🌳', hp: 250, atk: 10, type: 'tank', cooldownMs: 2000, manaCost: 3, roleName: 'ต้นไม้แห่งชีวิต (Treant)', recommendedPosition: 'front', category: 'ธรรมชาติ (Nature)', rarity: 'HSK2' },
  'shi': { pinyin: 'shí', name: 'หิน', icon: '🪨', hp: 400, atk: 5, type: 'tank', cooldownMs: 3000, manaCost: 4, roleName: 'โกเลมหิน (Golem)', recommendedPosition: 'front', category: 'ธรรมชาติ (Nature)', rarity: 'HSK2' },
  'feng': { pinyin: 'fēng', name: 'ลม', icon: '🌪️', hp: 60, atk: 35, type: 'magic', projectileColor: '#9ca3af', cooldownMs: 600, manaCost: 3, roleName: 'เวทลม (Wind Mage)', recommendedPosition: 'back', category: 'ธรรมชาติ (Nature)', rarity: 'HSK3' },
  
  // People
  'ren': { pinyin: 'rén', name: 'คน', icon: '🚶', hp: 120, atk: 15, type: 'melee', cooldownMs: 1000, manaCost: 1, roleName: 'ชาวบ้าน (Peasant)', recommendedPosition: 'front', category: 'บุคคล (People)', rarity: 'HSK1' },
  'nan': { pinyin: 'nán', name: 'ผู้ชาย', icon: '👨', hp: 150, atk: 20, type: 'melee', cooldownMs: 1200, manaCost: 2, roleName: 'ทหารราบ (Infantry)', recommendedPosition: 'front', category: 'บุคคล (People)', rarity: 'HSK1' },
  'nv': { pinyin: 'nǚ', name: 'ผู้หญิง', icon: '👩', hp: 100, atk: 25, type: 'magic', projectileColor: '#f472b6', cooldownMs: 1000, manaCost: 2, roleName: 'จอมเวท (Sorceress)', recommendedPosition: 'back', category: 'บุคคล (People)', rarity: 'HSK1' },
  
  // Objects
  'che': { pinyin: 'chē', name: 'รถ', icon: '🚗', hp: 200, atk: 40, type: 'melee', cooldownMs: 2000, manaCost: 4, roleName: 'รถศึก (Chariot)', recommendedPosition: 'front', category: 'สิ่งของ (Objects)', rarity: 'HSK1' },
  'shu': { pinyin: 'shū', name: 'หนังสือ', icon: '📚', hp: 80, atk: 20, type: 'magic', projectileColor: '#a78bfa', cooldownMs: 1500, manaCost: 2, roleName: 'คัมภีร์เวท (Grimoire)', recommendedPosition: 'back', category: 'สิ่งของ (Objects)', rarity: 'HSK1' },
};

// Fallback for when they mix something that is valid pinyin but not in our vocab yet
export const FALLBACK_UNIT: BattlerUnitDef = {
  pinyin: '?', name: 'พลังงาน', icon: '✨', hp: 50, atk: 5, type: 'magic', projectileColor: '#fef08a', cooldownMs: 1500, manaCost: 1, roleName: 'ดวงแสง', recommendedPosition: 'back', category: 'สิ่งของ (Objects)', rarity: 'HSK1'
};

// Fallback for completely invalid pinyin mixing
export const INVALID_UNIT: BattlerUnitDef = {
  pinyin: '!', name: 'ผิดพลาด', icon: '💥', hp: 10, atk: 0, type: 'melee', cooldownMs: 9999, manaCost: 1, roleName: 'ตัวบัค', recommendedPosition: 'front', category: 'สิ่งของ (Objects)', rarity: 'HSK1'
};
