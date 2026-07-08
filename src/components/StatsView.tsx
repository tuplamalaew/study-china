'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { ALL_CATEGORIES } from '../data/focused-sets';
import { formatPinyin, getPinyinTrends } from '../lib/utils';
import type { GameState, GameSession, StatsViewMode } from '../data/types';
import { MiniChart } from './MiniChart';

interface StatsViewProps {
  statsViewMode: StatsViewMode;
  gameHistory: GameSession[];
  setGameState: (state: GameState) => void;
  clearStats: () => void;
  simulateData?: () => void;
  statsFilter: string;
}

export function StatsView({
  statsViewMode,
  gameHistory,
  setGameState,
  clearStats,
  simulateData,
  statsFilter
}: StatsViewProps) {
  
  const filteredHistory = gameHistory.filter(s => (s.categoryId || (s.level === 'level2' ? 'initials-level2' : 'initials-level1')) === statsFilter);
  const chartData = filteredHistory.map((session, idx) => ({ ...session, mappedGameNumber: idx + 1 }));
  const singlePinyinTrends = getPinyinTrends(filteredHistory);
  const globalPinyinTrends = getPinyinTrends(gameHistory);

  return (
    <div className="animate-fade-in flex flex-col h-full max-h-[85vh] w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            {statsViewMode === 'all' ? 'All Training Modes' : 'Mode Statistics'}
          </h2>
          <p className="text-slate-400">Total games recorded: {gameHistory.length}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setGameState('reports')} className="px-5 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold rounded-xl flex items-center gap-2"><span>📆</span> คลังรายงานผล</button>
          <button onClick={() => setGameState('idle')} className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl">Back to Menu</button>
        </div>
      </div>
      
      {statsViewMode === 'all' && (
        <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
          <h3 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest border-l-4 border-cyan-500 pl-3">
            声母 shēngmǔ <span className="text-sm opacity-80 uppercase">(พยัญชนะ)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ALL_CATEGORIES.filter(c => c.module === 'initials').map(category => (
              <MiniChart key={category.id} categoryId={category.id} title={category.title} gameHistory={gameHistory} themeColor="cyan" isDanger={category.id === 'focus-6'} />
            ))}
          </div>
          
          <h3 className="text-xl font-bold text-purple-400 mb-4 tracking-widest border-l-4 border-purple-500 pl-3 mt-8">
            韵母 yùnmǔ <span className="text-sm opacity-80 uppercase">(สระ)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_CATEGORIES.filter(c => c.module === 'finals').map(category => (
              <MiniChart key={category.id} categoryId={category.id} title={category.title} gameHistory={gameHistory} themeColor="purple" />
            ))}
          </div>

          <h3 className="text-xl font-bold text-amber-400 mb-4 tracking-widest border-l-4 border-amber-500 pl-3 mt-8">
            声调 shēngdiào <span className="text-sm opacity-80 uppercase">(วรรณยุกต์)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_CATEGORIES.filter(c => c.module === 'tones').map(category => (
              <MiniChart key={category.id} categoryId={category.id} title={category.title} gameHistory={gameHistory} themeColor="amber" />
            ))}
          </div>
          
          <div className="mt-12 bg-slate-900 rounded-3xl p-6 md:p-8 border-2 border-slate-700 shadow-inner">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4 text-center">🏆 Global Top Mistakes (ศัตรูหมายเลข 1)</h3>
            
            {globalPinyinTrends.length === 0 ? (
              <p className="text-center text-emerald-500/70 py-8 text-xl font-bold">Flawless! No mistakes recorded anywhere! 🎉</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {globalPinyinTrends.slice(0, 12).map(({ pinyin, total, trend }, idx) => {
                  const maxCount = globalPinyinTrends[0].total;
                  const widthPercent = Math.max(8, Math.round((total / maxCount) * 100));
                  
                  return (
                    <div key={pinyin} className="flex flex-col gap-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                      <div className="flex justify-between items-center font-bold">
                        <div className="flex items-center gap-3">
                          <span className={`text-xl ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-400'}`}>#{idx + 1}</span>
                          <span className="text-3xl text-rose-400 w-16">{formatPinyin(pinyin)}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-slate-300 text-sm font-bold bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">{total} misses</span>
                          {trend === 'improving' && <span className="text-emerald-400 text-xs font-semibold">↘️ Better</span>}
                          {trend === 'worsening' && <span className="text-rose-400 text-xs font-semibold">↗️ Worse</span>}
                          {trend === 'neutral' && <span className="text-slate-500 text-xs font-semibold">— Stable</span>}
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 mt-1 shadow-inner">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)]' : 'bg-slate-600'}`}
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
           <div className="mt-8 flex items-center justify-center gap-4">
             <button onClick={clearStats} className="px-6 py-3 bg-rose-900/30 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold rounded-xl border border-rose-800/50">Reset All Data</button>
             {simulateData && (
               <button onClick={simulateData} className="px-6 py-3 bg-emerald-900/30 hover:bg-emerald-600 text-emerald-400 hover:text-white font-semibold rounded-xl border border-emerald-800/50">✨ Mock Data</button>
             )}
           </div>
        </div>
      )}
      
      {statsViewMode === 'single' && (
         <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
            <div className="text-center py-2"><h3 className="text-xl font-bold text-emerald-400">{ALL_CATEGORIES.find(c => c.id === statsFilter)?.title || statsFilter}</h3></div>
            
          {chartData.length > 0 ? (
            <div className="h-64 w-full bg-slate-900 rounded-2xl p-4 pb-2 pt-6 border border-slate-700 shadow-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="mappedGameNumber" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={12} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={36} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', padding: '12px' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    labelFormatter={(label) => `Game ${label}`}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke={statsFilter.includes('focus-6') ? '#f43f5e' : '#38bdf8'} strokeWidth={4} dot={{ r: 4, fill: statsFilter.includes('focus-6') ? '#e11d48' : '#0ea5e9', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-700">
              <span className="text-slate-500">No data for this mode yet.</span>
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-3">Problematic Pinyin (This Mode)</h3>
            
            {singlePinyinTrends.length === 0 ? (
              <p className="text-center text-emerald-500/70 py-6 text-lg font-bold">No errors recorded yet! 🎉</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {singlePinyinTrends.map(({ pinyin, total, trend }) => {
                  const maxCount = singlePinyinTrends[0].total;
                  const widthPercent = Math.max(10, Math.round((total / maxCount) * 100));
                  
                  return (
                    <div key={pinyin} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-2xl text-rose-400 w-16">{formatPinyin(pinyin)}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300 text-sm bg-slate-800 px-3 py-1 rounded-lg">{total} misses</span>
                          {trend === 'improving' && <span className="text-emerald-400 text-sm" title="Mistakes decreasing">↘️ Better</span>}
                          {trend === 'worsening' && <span className="text-rose-400 text-sm" title="Mistakes increasing">↗️ Worse</span>}
                          {trend === 'neutral' && <span className="text-slate-500 text-sm" title="Not enough data">— Stable</span>}
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-rose-600 to-rose-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(225,29,72,0.5)]" 
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
         </div>
      )}
    </div>
  );
}
