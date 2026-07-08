export const FOCUSED_SETS_INITIALS = [
  { id: 1, name: 'ริมฝีปาก', letters: ['b', 'p', 'm', 'f'] },
  { id: 2, name: 'ปุ่มเหงือก', letters: ['d', 't', 'n', 'l'] },
  { id: 3, name: 'เพดานอ่อน', letters: ['g', 'k', 'h'] },
  { id: 4, name: 'เพดานแข็ง', letters: ['j', 'q', 'x'] },
  { id: 5, name: 'ม้วนลิ้น', letters: ['zh', 'ch', 'sh', 'r'] },
  { id: 6, name: 'ลิ้นราบ (ปราบเซียน)', letters: ['z', 'c', 's'] }
];

export const FOCUSED_SETS_FINALS = [
  { id: 101, name: 'สระเดี่ยว', letters: ['a', 'o', 'e', 'er', 'i', 'u', 'v'] },
  { id: 102, name: 'สระผสม 2 ตัว', letters: ['ai', 'ei', 'ao', 'ou', 'ia', 'ie', 'ua', 'uo', 've'] },
  { id: 103, name: 'สระผสม 3 ตัว', letters: ['iao', 'iou', 'uai', 'uei'] },
  { id: 104, name: 'จมูกหน้า (-n)', letters: ['an', 'en', 'in', 'vn', 'ian', 'uan', 'van', 'uen'] },
  { id: 105, name: 'จมูกหลัง (-ng)', letters: ['ang', 'eng', 'ing', 'ong', 'iang', 'uang', 'iong', 'ueng'] }
];

export const ALL_CATEGORIES = [
  { id: 'initials-level1', title: '[声母] Core: Level 1', module: 'initials' as const },
  { id: 'initials-level2', title: '[声母] Core: Level 2', module: 'initials' as const },
  { id: 'initials-pairs', title: '[声母] Confusing Pairs', module: 'initials' as const },
  ...FOCUSED_SETS_INITIALS.map(set => ({ id: `focus-${set.id}`, title: `[声母] Focus: ${set.name}`, module: 'initials' as const })),
  { id: 'finals-level1', title: '[韵母] Core: Level 1', module: 'finals' as const },
  { id: 'finals-level2', title: '[韵母] Core: Level 2', module: 'finals' as const },
  { id: 'finals-pairs', title: '[韵母] Confusing Pairs', module: 'finals' as const },
  ...FOCUSED_SETS_FINALS.map(set => ({ id: `focus-${set.id}`, title: `[韵母] Focus: ${set.name}`, module: 'finals' as const })),
  { id: 'tones-level1', title: '[声调] Tone Slash (Level 1)', module: 'tones' as const },
  { id: 'tones-guqin', title: '[声调] Guqin (พิณมาร)', module: 'tones' as const }
];
