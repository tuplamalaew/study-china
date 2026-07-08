'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface ToneSlashGameProps {
  onAnswer: (answer: string) => void;
  isPaused: boolean;
}

export default function ToneSlashGame({ onAnswer, isPaused }: ToneSlashGameProps) {
  const [path, setPath] = useState<Point[]>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // To draw the trail
  const trailRef = useRef<HTMLCanvasElement>(null);

  const startSwipe = (e: React.PointerEvent) => {
    if (isPaused) return;
    setIsSwiping(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPath([{ x, y }]);
    
    // Clear canvas
    const ctx = trailRef.current?.getContext('2d');
    if (ctx && trailRef.current) {
      ctx.clearRect(0, 0, trailRef.current.width, trailRef.current.height);
    }
  };

  const moveSwipe = (e: React.PointerEvent) => {
    if (!isSwiping || isPaused) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPath(prev => {
      const newPath = [...prev, { x, y }];
      drawTrail(newPath);
      return newPath;
    });
  };

  const endSwipe = () => {
    if (!isSwiping || isPaused) return;
    setIsSwiping(false);
    
    const answer = analyzeSwipe(path);
    if (answer) {
      onAnswer(answer);
    }
    
    // Fade out trail slightly
    setTimeout(() => {
      if (!isSwiping) {
        setPath([]);
        const ctx = trailRef.current?.getContext('2d');
        if (ctx && trailRef.current) {
          ctx.clearRect(0, 0, trailRef.current.width, trailRef.current.height);
        }
      }
    }, 500);
  };

  const drawTrail = (currentPath: Point[]) => {
    const canvas = trailRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (currentPath.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    
    // Wuxia sword trail style
    ctx.strokeStyle = '#38bdf8'; // Cyan-400
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#0284c7'; // Glow
    ctx.shadowBlur = 15;
    ctx.stroke();
    
    // Inner bright core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.stroke();
  };

  const analyzeSwipe = (points: Point[]) => {
    if (points.length < 5) return null;
    
    const start = points[0];
    const end = points[points.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // V-shape detection for Tone 3
    let maxY = start.y;
    for (let i = 1; i < points.length; i++) {
      if (points[i].y > maxY) {
        maxY = points[i].y;
      }
    }
    
    const dropAmount = maxY - start.y;
    const riseAmount = maxY - end.y;
    
    // Tone 3 (ˇ)
    if (dropAmount > 40 && riseAmount > 40) {
      return 'a3';
    }
    
    if (Math.hypot(dx, dy) < 50) return null; // Too short swipe
    
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180
    
    // Tone 1 (ˉ): Horizontal
    if (Math.abs(angle) < 30 || Math.abs(angle) > 150) {
      return 'a1';
    }
    
    // Tone 2 (ˊ): Up-Right
    if (angle > -90 && angle < -10) {
      return 'a2';
    }
    
    // Tone 4 (ˋ): Down-Right
    if (angle > 10 && angle < 90) {
      return 'a4';
    }
    
    return null;
  };

  // Resize canvas to match container
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && trailRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        trailRef.current.width = width;
        trailRef.current.height = height;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <div className="text-amber-400 font-bold mb-4 animate-pulse">
        👆 ลากเมาส์ / ปัดนิ้ว เพื่อตวัดกระบี่ตามเสียงวรรณยุกต์
      </div>
      
      <div 
        ref={canvasRef}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerLeave={endSwipe}
        className="w-full max-w-3xl h-64 md:h-96 bg-slate-900/60 rounded-3xl border-2 border-slate-700 shadow-inner relative overflow-hidden cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      >
        {/* Background Grids for Wuxia feel */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Center Target */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-32 h-32 rounded-full border-4 border-cyan-500/50 border-dashed animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute text-5xl opacity-50">⚔️</div>
        </div>

        {/* Trail Canvas */}
        <canvas ref={trailRef} className="absolute inset-0 pointer-events-none"></canvas>
      </div>

      <div className="flex justify-center gap-6 mt-6 opacity-60 pointer-events-none">
        <div className="text-center"><div className="text-2xl font-black text-cyan-400">→</div><div className="text-xs">เสียง 1 (a1)</div></div>
        <div className="text-center"><div className="text-2xl font-black text-cyan-400">↗</div><div className="text-xs">เสียง 2 (a2)</div></div>
        <div className="text-center"><div className="text-2xl font-black text-cyan-400">↘↗</div><div className="text-xs">เสียง 3 (a3)</div></div>
        <div className="text-center"><div className="text-2xl font-black text-cyan-400">↘</div><div className="text-xs">เสียง 4 (a4)</div></div>
      </div>
    </div>
  );
}
