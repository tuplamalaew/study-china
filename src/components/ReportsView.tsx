'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import type { GameState, WeeklyReport, DailyReport } from '../data/types';
import { formatPinyin } from '../lib/utils';

interface ReportsViewProps {
  setGameState: (state: GameState) => void;
  calendarWeekOffset: number;
  setCalendarWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  currentWeekDates: any[];
  selectedDateStr: string;
  setSelectedDateStr: React.Dispatch<React.SetStateAction<string>>;
  dailyReportsMap: Record<string, DailyReport>;
  getDailyMistakesAnalysis: (dateStr: string) => { pinyin: string; count: number; prevCount: number; trend: string }[] | null;
  weeklyChartData: { name: string; accuracy: number; hasData: boolean; fullDate: string }[];
  weeklyReports: WeeklyReport[];
}

const CustomBar = (props: { fill?: string; x?: number; y?: number; width?: number; height?: number }) => {
   const { fill, x, y, width, height } = props;
   return <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />;
};

export function ReportsView({
  setGameState,
  calendarWeekOffset,
  setCalendarWeekOffset,
  currentWeekDates,
  selectedDateStr,
  setSelectedDateStr,
  dailyReportsMap,
  getDailyMistakesAnalysis,
  weeklyChartData,
  weeklyReports
}: ReportsViewProps) {
  
  const dailyMistakes = getDailyMistakesAnalysis(selectedDateStr);
  const selectedReport = dailyReportsMap[selectedDateStr];

  // Automatically get the report for the current offset week
  const currentWeekReport = useMemo(() => {
     if (weeklyReports.length === 0) return null;
     const targetIndex = Math.abs(calendarWeekOffset);
     return weeklyReports[targetIndex] || weeklyReports[0];
  }, [weeklyReports, calendarWeekOffset]);

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-[1600px] mx-auto bg-slate-900/95 backdrop-blur-3xl rounded-3xl border-2 border-slate-700/80 shadow-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 border-b border-slate-700/80 pb-4 mb-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 tracking-wide">
           คลังรายงานผล (Analytics Dashboard)
        </h2>
        <button 
          onClick={() => setGameState('stats')} 
          className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
        >
           ย้อนกลับ
        </button>
      </div>

      {/* Main Grid - Full Height, No Scroll */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 grid-rows-12 gap-6 min-h-0 overflow-hidden">
        
        {/* Top Left: Calendar Strip (Row 1-4) */}
        <div className="xl:col-start-1 xl:col-span-7 xl:row-start-1 xl:row-span-4 bg-slate-950/60 rounded-3xl border border-slate-700/60 shadow-inner p-5 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none transition-all group-hover:bg-indigo-500/20"></div>
           
           <div className="flex items-center justify-between mb-3 shrink-0 z-10">
              <button 
                onClick={() => setCalendarWeekOffset(prev => prev - 1)} 
                className="p-2 px-5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-all border border-slate-600 text-sm font-bold shadow-md hover:shadow-indigo-500/20 active:scale-95"
              >
                ◀️ ก่อนหน้า
              </button>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-widest drop-shadow-md">
                {currentWeekDates[0]?.date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </h3>
              <button 
                onClick={() => setCalendarWeekOffset(prev => prev + 1)} 
                disabled={calendarWeekOffset >= 0} 
                className={`p-2 px-5 rounded-xl transition-all border text-sm font-bold shadow-md ${calendarWeekOffset >= 0 ? 'bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 active:scale-95 hover:shadow-indigo-500/20'}`}
              >
                ถัดไป ▶️
              </button>
           </div>
           
           <div className="grid grid-cols-7 gap-2 md:gap-3 flex-1 z-10">
              {currentWeekDates.map((day) => {
                 const isSelected = day.isoString === selectedDateStr;
                 const report = dailyReportsMap[day.isoString];
                 let bgColor = "bg-slate-800/40 border-slate-700/50 text-slate-500";
                 let ringColor = "";
                 
                 if (report) {
                    if (report.accuracy >= 80) bgColor = "bg-emerald-900/60 border-emerald-500/60 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                    else if (report.accuracy >= 50) bgColor = "bg-yellow-900/60 border-yellow-500/60 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
                    else bgColor = "bg-rose-900/60 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]";
                 }
                 if (isSelected) ringColor = "ring-2 ring-white ring-offset-4 ring-offset-slate-900 scale-105";

                 return (
                    <button 
                      key={day.isoString}
                      onClick={() => setSelectedDateStr(day.isoString)}
                      className={`flex flex-col items-center justify-center rounded-2xl border transition-all transform hover:scale-105 active:scale-95 ${bgColor} ${ringColor}`}
                    >
                       <span className="text-[10px] md:text-xs uppercase font-bold opacity-70 mb-1">{day.dayName}</span>
                       <span className={`text-xl md:text-3xl font-black ${report ? 'text-white' : ''}`}>{day.dateNum}</span>
                       {report && (
                          <div className="mt-1 text-[9px] md:text-xs font-black bg-black/40 px-2 py-0.5 rounded-full">
                             {report.accuracy}%
                          </div>
                       )}
                    </button>
                 );
              })}
           </div>
        </div>

        {/* Bottom Left: Trend Graph (Row 5-12) */}
        <div className="xl:col-start-1 xl:col-span-7 xl:row-start-5 xl:row-span-8 bg-slate-950/60 rounded-3xl border border-slate-700/60 p-6 flex flex-col relative overflow-hidden">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              📈 แนวโน้มความแม่นยำรายวัน (สัปดาห์นี้)
           </h3>
           <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(30, 41, 59, 0.5)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value}%`, 'Accuracy']}
                    labelFormatter={(label, payload) => {
                       if (payload && payload.length > 0) return payload[0].payload.fullDate;
                       return label;
                    }}
                  />
                  <Bar dataKey="accuracy" shape={<CustomBar />}>
                    {weeklyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                         entry.hasData 
                           ? (entry.fullDate === selectedDateStr ? '#38bdf8' : (entry.accuracy >= 80 ? '#10b981' : entry.accuracy >= 50 ? '#eab308' : '#f43f5e'))
                           : '#1e293b'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top Right: Selected Day Analysis (Row 1-6) */}
        <div className="xl:col-start-8 xl:col-span-5 xl:row-start-1 xl:row-span-6 bg-slate-800/80 rounded-3xl border-2 border-cyan-900/40 p-6 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(8,145,178,0.1)]">
           {selectedReport ? (
              <div className="animate-fade-in flex-1 flex flex-col h-full min-h-0">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-700/80 pb-4 shrink-0">
                    <h3 className="text-xl md:text-2xl font-black text-cyan-400">
                      สถิติวันที่ {selectedReport.displayDate}
                    </h3>
                    <span className="text-slate-400 text-sm bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-700">
                      เล่นไป <strong className="text-white">{selectedReport.totalGames}</strong> ด่าน
                    </span>
                 </div>

                 <div className="flex-1 flex flex-col min-h-0">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 shrink-0">จุดบอดที่ต้องระวัง (เทียบกับวันก่อนหน้า)</h4>
                    
                    {!dailyMistakes || dailyMistakes.length === 0 ? (
                       <div className="flex-1 flex items-center justify-center bg-emerald-900/10 border border-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-400 font-bold text-center">วันนี้คุณทำได้ไร้ที่ติ ไม่มีข้อผิดพลาดเลยครับ! 🎉</p>
                       </div>
                    ) : (
                       <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                             {dailyMistakes.map((mistake, idx) => (
                                <div key={idx} className="bg-slate-900/80 rounded-2xl p-3 border border-slate-700 flex justify-between items-center hover:border-slate-500 transition-colors">
                                   <div className="flex items-end gap-3">
                                      <span className="text-3xl font-black text-white leading-none">{formatPinyin(mistake.pinyin)}</span>
                                      <span className="text-slate-400 text-xs font-bold mb-0.5">ผิด {mistake.count}</span>
                                   </div>
                                   <div className="text-right flex flex-col justify-center">
                                      {mistake.trend === 'better' && <span className="text-emerald-400 font-black text-[10px] bg-emerald-900/40 px-2 py-1 rounded-md">↘ ดีขึ้น</span>}
                                      {mistake.trend === 'worse' && <span className="text-rose-400 font-black text-[10px] bg-rose-900/40 px-2 py-1 rounded-md">↗ แย่ลง</span>}
                                      {mistake.trend === 'neutral' && <span className="text-slate-500 font-black text-[10px] bg-slate-800 px-2 py-1 rounded-md">— คงที่</span>}
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           ) : (
              <div className="text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
                 <div className="text-5xl mb-4 opacity-30 drop-shadow-lg">📭</div>
                 <p className="text-lg font-bold">ไม่มีประวัติการฝึกซ้อมในวันนี้</p>
                 <p className="text-sm mt-2 opacity-70">เลือกวันที่อื่นบนแถบปฏิทินเพื่อดูข้อมูล</p>
              </div>
           )}
        </div>

        {/* Bottom Right: Weekly Summary (Row 7-12) */}
        <div className="xl:col-start-8 xl:col-span-5 xl:row-start-7 xl:row-span-6 bg-slate-900/90 rounded-3xl border-2 border-slate-700/80 p-6 flex flex-col relative overflow-hidden">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
              🗓️ สรุปภาพรวมรายสัปดาห์ (Weekly Summary)
           </h3>
           
           {!currentWeekReport ? (
             <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800">
               <p className="font-bold text-center px-4">ยังไม่มีประวัติการฝึกซ้อมในสัปดาห์นี้</p>
             </div>
           ) : (
             <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-800/30 rounded-2xl border border-slate-700/50 p-4 relative">
                <div className="flex items-center gap-4 mb-4 shrink-0 border-b border-slate-700 pb-4">
                   <div className="relative">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl border border-slate-600 flex items-center justify-center text-2xl font-black text-indigo-400">
                         W{currentWeekReport.weekNumber}
                      </div>
                      {currentWeekReport.isCurrentWeek && (
                         <div className="absolute -top-2 -right-4 text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase font-black tracking-widest shadow-lg whitespace-nowrap z-10 border border-indigo-400/30">
                            ปัจจุบัน
                         </div>
                      )}
                   </div>
                   <div>
                      <div className="text-xs font-bold text-slate-500 uppercase">Games Played</div>
                      <div className="text-2xl font-black text-white">{currentWeekReport.totalGames} <span className="text-sm text-slate-400 font-medium">รอบ</span></div>
                   </div>
                   <div className="ml-auto text-right">
                      <div className="text-xs font-bold text-slate-500 uppercase">Avg Accuracy</div>
                      <div className="text-3xl font-black text-cyan-400">{currentWeekReport.accuracy}%</div>
                   </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                   {/* Most Improved */}
                   <div className="bg-emerald-900/20 rounded-xl p-3 border border-emerald-500/20 flex flex-col">
                      <span className="text-emerald-500/80 text-[10px] font-black uppercase tracking-widest mb-2">🏆 ดาวรุ่งพัฒนา</span>
                      {currentWeekReport.mostImproved ? (
                         <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <span className="text-3xl font-black text-emerald-400 mb-1 leading-none">{formatPinyin(currentWeekReport.mostImproved.pinyin)}</span>
                            <div className="text-[10px] text-emerald-400/80 font-bold bg-emerald-950/50 mt-2 px-2 py-1 rounded-md">
                               ผิดลดลงจาก <span className="text-rose-400">{currentWeekReport.mostImproved.pastMisses}</span> เหลือ <span className="text-emerald-400">{currentWeekReport.mostImproved.currentMisses}</span>
                            </div>
                         </div>
                      ) : (
                         <div className="flex-1 flex items-center justify-center text-center text-slate-500 text-[10px] font-bold">ไม่มีข้อมูล</div>
                      )}
                   </div>

                   {/* Arch Nemesis */}
                   <div className="bg-rose-900/20 rounded-xl p-3 border border-rose-500/20 flex flex-col">
                      <span className="text-rose-500/80 text-[10px] font-black uppercase tracking-widest mb-2">☠️ ศัตรูตัวฉกาจ</span>
                      {currentWeekReport.archNemesis ? (
                         <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <span className="text-3xl font-black text-rose-400 mb-1 leading-none">{formatPinyin(currentWeekReport.archNemesis[0])}</span>
                            <div className="text-[10px] text-rose-400/80 font-bold bg-rose-950/50 mt-2 px-2 py-1 rounded-md">
                               หลอกคุณไป <span className="text-rose-400">{currentWeekReport.archNemesis[1]}</span> ครั้ง
                            </div>
                         </div>
                      ) : (
                         <div className="flex-1 flex items-center justify-center text-center text-slate-500 text-[10px] font-bold">คุณไร้จุดอ่อน!</div>
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
