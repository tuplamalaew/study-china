import { useState, useRef, useCallback } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [audioFinishedAt, setAudioFinishedAt] = useState<number | null>(null);

  const playSound = useCallback((pinyin: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause(); 
        audioRef.current.currentTime = 0;
      }
      setAudioIsPlaying(true);
      
      const audioPath = pinyin.includes('.') ? `/audio/${pinyin}` : `/audio/${pinyin}.mp4`;
      const audio = new Audio(audioPath);
      audioRef.current = audio;
      
      audio.onended = () => {
         setAudioIsPlaying(false);
         setAudioFinishedAt(Date.now());
      };
      
      audio.play().catch((e) => {
        if (e.name === 'AbortError') return; 
        console.error(`Error playing audio for '${pinyin}'`, e);
        // Fallback if audio fails to play
        setAudioIsPlaying(false);
        setAudioFinishedAt(Date.now());
      });
    } catch (error) {
      console.error("Audio system failed:", error);
    }
  }, []);

  return {
    audioRef,
    audioIsPlaying,
    setAudioIsPlaying,
    audioFinishedAt,
    setAudioFinishedAt,
    playSound
  };
}
