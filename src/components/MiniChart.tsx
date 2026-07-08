'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

import { GameSession } from '../data/types';

interface MiniChartProps {
  categoryId: string;
  title: string;
  gameHistory: GameSession[];
  isDanger?: boolean;
  themeColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'blue' | 'purple' | 'default';
}

export function MiniChart({ categoryId, title, gameHistory, isDanger = false, themeColor }: MiniChartProps) {
  const data = gameHistory
    .filter(s => (s.categoryId || (s.level === 'level2' ? 'initials-level2' : 'initials-level1')) === categoryId)
    .map((s, idx) => ({ ...s, mappedGameNumber: idx + 1 }));
    
  const colors = {
    cyan: { bg: 'bg-cyan-950/20', border: 'border-cyan-900/50', text: 'text-cyan-400', line: '#22d3ee', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', tooltip: '#0891b2', dot: '#06b6d4' },
    emerald: { bg: 'bg-emerald-950/20', border: 'border-emerald-900/50', text: 'text-emerald-400', line: '#34d399', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', tooltip: '#059669', dot: '#10b981' },
    rose: { bg: 'bg-rose-950/20', border: 'border-rose-900/50', text: 'text-rose-400', line: '#fb7185', shadow: 'shadow-[0_0_15px_rgba(225,29,72,0.15)]', tooltip: '#e11d48', dot: '#f43f5e' },
    amber: { bg: 'bg-amber-950/20', border: 'border-amber-900/50', text: 'text-amber-400', line: '#fbbf24', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', tooltip: '#d97706', dot: '#f59e0b' },
    indigo: { bg: 'bg-indigo-950/20', border: 'border-indigo-900/50', text: 'text-indigo-400', line: '#818cf8', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', tooltip: '#4f46e5', dot: '#6366f1' },
    blue: { bg: 'bg-blue-950/20', border: 'border-blue-900/50', text: 'text-blue-400', line: '#60a5fa', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', tooltip: '#2563eb', dot: '#3b82f6' },
    purple: { bg: 'bg-purple-950/20', border: 'border-purple-900/50', text: 'text-purple-400', line: '#c084fc', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', tooltip: '#9333ea', dot: '#a855f7' },
    default: { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-300', line: '#0ea5e9', shadow: '', tooltip: '#38bdf8', dot: '#0284c7' },
  };

  const theme = isDanger ? colors.rose : (themeColor ? colors[themeColor] : colors.default);

  return (
    <div className={`rounded-2xl p-4 border flex flex-col transition-all hover:scale-[1.02] ${theme.bg} ${theme.border} ${theme.shadow} ${isDanger ? 'border-rose-900/50 shadow-[0_0_15px_rgba(225,29,72,0.1)]' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold text-xs md:text-sm tracking-wide ${theme.text} truncate mr-2`}>{title}</h3>
        <span className="text-xs text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded-md whitespace-nowrap">{data.length} games</span>
      </div>
      
      {data.length > 0 ? (
        <div className="h-32 w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="mappedGameNumber" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: theme.tooltip }}
                formatter={(value: any) => [`${value}%`, 'Accuracy']}
                labelFormatter={(label) => `Game ${label}`}
                cursor={{ stroke: '#475569', strokeWidth: 1 }}
              />
              <Line type="monotone" dataKey="accuracy" stroke={theme.line} strokeWidth={2} dot={{ r: 2, fill: theme.dot }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-32 w-full flex items-center justify-center bg-slate-900/50 rounded-xl mt-auto">
          <span className="text-xs text-slate-600">No data yet</span>
        </div>
      )}
    </div>
  );
}
