import type { ActiveModule } from './types';

// RPG RANKS (Total)
export const INITIALS_RANKS = [
  { name: 'ผู้ฝึกหัดไร้นาม', maxExp: 1000, emoji: '🗡️' },
  { name: 'ศิษย์สายนอก', maxExp: 3000, emoji: '🥋' },
  { name: 'ศิษย์สายใน', maxExp: 7500, emoji: '⚔️' },
  { name: 'ยอดฝีมือลุ่มน้ำ', maxExp: 15000, emoji: '🌊' },
  { name: 'จอมยุทธ์พเนจร', maxExp: 25000, emoji: '🍃' },
  { name: 'ปรมาจารย์เงา', maxExp: 40000, emoji: '👤' },
  { name: 'เซียนกระบี่', maxExp: 65000, emoji: '💫' },
  { name: 'ราชันย์ลมปราณ', maxExp: 100000, emoji: '🌀' },
  { name: 'เทพสงคราม', maxExp: 150000, emoji: '🀄' },
  { name: 'มหาเทพบรรพกาล', maxExp: Infinity, emoji: '🐉' }
];

export const FINALS_RANKS = [
  { name: 'ผู้ใช้เวทฝึกหัด', maxExp: 1000, emoji: '🪄' },
  { name: 'นักวิชาการมนตรา', maxExp: 3000, emoji: '📜' },
  { name: 'จอมเวทระดับกลาง', maxExp: 7500, emoji: '🔮' },
  { name: 'ผู้บัญชาธาตุ', maxExp: 15000, emoji: '🔥' },
  { name: 'ผู้วิเศษแสงดาว', maxExp: 25000, emoji: '✨' },
  { name: 'อาร์คเมจ', maxExp: 40000, emoji: '🧿' },
  { name: 'นักปราชญ์มิติ', maxExp: 65000, emoji: '🌌' },
  { name: 'ราชันย์เวทมนตร์', maxExp: 100000, emoji: '👑' },
  { name: 'เทพพยากรณ์ดวงดาว', maxExp: 150000, emoji: '🪐' },
  { name: 'ผู้สร้างจักรวาล', maxExp: Infinity, emoji: '🌌' }
];

export const TONES_RANKS = [
  { name: 'ศิษย์ฝึกดาบ', maxExp: 1000, emoji: '🗡️' },
  { name: 'มือกระบี่พเนจร', maxExp: 3000, emoji: '🤺' },
  { name: 'จอมกระบี่เงา', maxExp: 7500, emoji: '🥷' },
  { name: 'ยอดฝีมือไร้พ่าย', maxExp: 15000, emoji: '⚔️' },
  { name: 'เซียนกระบี่ทะยานฟ้า', maxExp: 25000, emoji: '🦅' },
  { name: 'ปรมาจารย์เพลงกระบี่', maxExp: 40000, emoji: '☯️' },
  { name: 'ราชันย์กระบี่', maxExp: 65000, emoji: '👑' },
  { name: 'มหาเทพกระบี่สวรรค์', maxExp: 100000, emoji: '✨' },
  { name: 'กระบี่เอกภพ', maxExp: 150000, emoji: '🌌' },
  { name: 'เทพเจ้ากระบี่ไร้ลักษณ์', maxExp: Infinity, emoji: '💫' }
];

export const getRank = (exp: number, module: ActiveModule) => {
  const ranks = module === 'initials' ? INITIALS_RANKS : module === 'finals' ? FINALS_RANKS : TONES_RANKS;
  let prevMax = 0;
  for (let i = 0; i < ranks.length; i++) {
    if (exp < ranks[i].maxExp) {
      return { rank: ranks[i], prevMax, level: i + 1, isMax: false };
    }
    prevMax = ranks[i].maxExp;
  }
  return { rank: ranks[ranks.length - 1], prevMax, level: ranks.length, isMax: true };
};
