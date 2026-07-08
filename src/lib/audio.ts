/**
 * Audio System for StudyChina (Wuxia Theme)
 * 
 * 📝 วิธีการนำเสียงของคุณเองมาใส่ (How to use custom audio files):
 * 1. สร้างโฟลเดอร์ชื่อ `sounds` ไว้ในโฟลเดอร์ `public` (เช่น `public/sounds/`)
 * 2. นำไฟล์เสียงของคุณไปใส่ เช่น `bamboo.mp3`, `guzheng.mp3`, `error.mp3`, `hit.mp3`
 * 3. เลิกคอมเมนต์ (Uncomment) โค้ดที่ใช้ `new Audio('/sounds/...').play()` ด้านล่าง
 * 4. คอมเมนต์ (หรือลบ) โค้ด Web Audio API ที่เป็นการสังเคราะห์เสียงออก
 */

let globalAudioCtx: AudioContext | null = null;

export const getAudioCtx = () => {
  if (!globalAudioCtx) {
     globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (globalAudioCtx.state === 'suspended') {
     globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

export const playBambooKnock = () => {
  try {
     // 👉 หากต้องการใช้ไฟล์เสียงของคุณเอง ให้เปิดใช้งานโค้ดบรรทัดล่างนี้:
     // new Audio('/sounds/bamboo.mp3').play().catch(() => {});
     // return;

     const audioCtx = getAudioCtx();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     const filter = audioCtx.createBiquadFilter();
     
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(800, audioCtx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
     
     filter.type = 'bandpass';
     filter.frequency.value = 1000;
     
     gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
     
     osc.connect(filter);
     filter.connect(gain);
     gain.connect(audioCtx.destination);
     
     osc.start(audioCtx.currentTime);
     osc.stop(audioCtx.currentTime + 0.05);
  } catch{}
};

export const playGuzhengClick = () => {
  try {
     // 👉 หากต้องการใช้ไฟล์เสียงของคุณเอง ให้เปิดใช้งานโค้ดบรรทัดล่างนี้:
     // new Audio('/sounds/guzheng.mp3').play().catch(() => {});
     // return;

     const audioCtx = getAudioCtx();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     const filter = audioCtx.createBiquadFilter();
     
     osc.type = 'sawtooth';
     const freqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Notes from a pentatonic scale
     const freq = freqs[Math.floor(Math.random() * freqs.length)];
     osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
     
     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
     filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.8);
     
     gain.gain.setValueAtTime(0, audioCtx.currentTime);
     gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.02);
     gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8); // Longer reverb for Wuxia feel
     
     osc.connect(filter);
     filter.connect(gain);
     gain.connect(audioCtx.destination);
     
     osc.start(audioCtx.currentTime);
     osc.stop(audioCtx.currentTime + 0.8);
  } catch{}
};

export const playCollisionSFX = () => {
  try {
     // 👉 หากต้องการใช้ไฟล์เสียงของคุณเอง ให้เปิดใช้งานโค้ดบรรทัดล่างนี้:
     // new Audio('/sounds/hit.mp3').play().catch(() => {});
     // return;

     const audioCtx = getAudioCtx();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     
     osc.type = 'square';
     osc.frequency.setValueAtTime(150, audioCtx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
     
     gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
     
     osc.connect(gain);
     gain.connect(audioCtx.destination);
     
     osc.start(audioCtx.currentTime);
     osc.stop(audioCtx.currentTime + 0.1);
  } catch{}
};

export const playSwordSlash = () => {
  try {
     const audioCtx = getAudioCtx();
     const bufferSize = audioCtx.sampleRate * 0.2; // 0.2 seconds
     const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
     }
     
     const noiseSource = audioCtx.createBufferSource();
     noiseSource.buffer = buffer;
     
     const filter = audioCtx.createBiquadFilter();
     filter.type = 'bandpass';
     // Sweep frequency up quickly to simulate a slash
     filter.frequency.setValueAtTime(500, audioCtx.currentTime);
     filter.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 0.1);
     
     const gain = audioCtx.createGain();
     gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
     
     noiseSource.connect(filter);
     filter.connect(gain);
     gain.connect(audioCtx.destination);
     
     noiseSource.start(audioCtx.currentTime);
  } catch{}
};

export const playQiBlast = () => {
  try {
     const audioCtx = getAudioCtx();
     
     // Low frequency boom
     const osc = audioCtx.createOscillator();
     osc.type = 'sine';
     osc.frequency.setValueAtTime(150, audioCtx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
     
     const oscGain = audioCtx.createGain();
     oscGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
     oscGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
     
     osc.connect(oscGain);
     oscGain.connect(audioCtx.destination);
     
     osc.start(audioCtx.currentTime);
     osc.stop(audioCtx.currentTime + 0.4);
  } catch{}
};

export const playErrorSFX = () => {
  try {
     // 👉 หากต้องการใช้ไฟล์เสียงของคุณเอง ให้เปิดใช้งานโค้ดบรรทัดล่างนี้:
     // new Audio('/sounds/error.mp3').play().catch(() => {});
     // return;

     const audioCtx = getAudioCtx();
     const osc = audioCtx.createOscillator();
     const gain = audioCtx.createGain();
     
     osc.type = 'sawtooth';
     // Dissonant low note (string snapping)
     osc.frequency.setValueAtTime(100, audioCtx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
     
     gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
     
     osc.connect(gain);
     gain.connect(audioCtx.destination);
     
     osc.start(audioCtx.currentTime);
     osc.stop(audioCtx.currentTime + 0.3);
  } catch{}
};

export const playTTS = (text: string) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.error('TTS Error:', e);
  }
};