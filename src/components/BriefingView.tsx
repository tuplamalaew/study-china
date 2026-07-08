'use client';

import React from 'react';
import type { GameLevel, GameState } from '../data/types';
import { playGuzhengClick } from '../lib/audio';

interface BriefingViewProps {
  pendingBriefing: { level: GameLevel | 'boss'; focusSetId?: number | string } | null;
  startGame: () => void;
  setGameState: (state: GameState) => void;
}

export function BriefingView({ pendingBriefing, startGame, setGameState }: BriefingViewProps) {
  if (!pendingBriefing) return null;

  return (
    <div className="flex flex-col items-center animate-fade-in mx-auto w-full max-w-2xl text-center space-y-8 py-10">
      <div className="text-6xl mb-4">
        {pendingBriefing.level === 'clones' ? '🥷' : pendingBriefing.level === 'guqin' ? '🎼' : pendingBriefing.level === 'level1' ? '🏕️' : pendingBriefing.level === 'level2' ? '⚔️' : pendingBriefing.level === 'pairs' ? '👁️' : pendingBriefing.level === 'horde' ? '🥷' : pendingBriefing.level === 'armored' ? '🛡️' : pendingBriefing.level === 'speed' ? '⚡' : pendingBriefing.level === 'talisman' ? '🔮' : '👿'}
      </div>
      <h2 className="text-4xl font-black text-white">
        {pendingBriefing.level === 'clones' ? 'วิชาแยกเงา (Clone Skill)' : pendingBriefing.level === 'guqin' ? 'พิณมารทะลวงจิต (Guqin Melody)' : pendingBriefing.level === 'level1' ? 'ค่ายฝึกซ้อม (Training)' : pendingBriefing.level === 'level2' ? 'เพลงกระบี่พริบตา' : pendingBriefing.level === 'pairs' ? 'ปะทะจิตมาร' : pendingBriefing.level === 'horde' ? 'ฝ่าทะลวงค่ายโจร (Horde)' : pendingBriefing.level === 'armored' ? 'สยบมารเกราะเหล็ก (Armored)' : pendingBriefing.level === 'speed' ? 'ปีศาจวายุไร้เงา (Speed)' : pendingBriefing.level === 'talisman' ? 'สกัดอักขระเวท (Talisman)' : 'ศึกดวลบอส (Boss Raid)'}
      </h2>
      
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 w-full text-left space-y-4">
        <h3 className="text-xl font-bold text-amber-400 border-b border-slate-700 pb-2">📜 เคล็ดวิชาและกติกา</h3>
        <ul className="list-disc pl-5 text-slate-300 space-y-2 text-lg">
          {pendingBriefing.level === 'level1' && (
            <>
              <li>ท่านหลงเข้ามาในค่ายกลที่เคลื่อนไหวไร้ทิศทาง มีเวลา <strong>5 วินาที</strong> ในการหาเป้าหมาย</li>
              <li>ค่ายกลถูกพรางตาไว้ ต้องเพ่งจิต (นำเมาส์ไปชี้) เพื่อส่องดูอักขระที่แท้จริง</li>
              <li>ค่ายกลจะขยับไปมาและชนกันเอง จงใช้สายตาให้เฉียบคม!</li>
            </>
          )}
          {pendingBriefing.level === 'level2' && (
            <>
              <li>การดวลกระบี่เป็นตาย ตัดสินในดาบเดียว! หน้าจอจะมืดลงให้ <strong>รวบรวมลมปราณ</strong> (ห้ามพิมพ์เด็ดขาด หากใจร้อนจะเกิดธาตุไฟแตกซ่าน!)</li>
              <li>รอจนกว่าจะได้ยินเสียงกระบี่ปะทะ <strong>เช้ง!</strong> และหน้าจอสว่างเป็นประกายกระบี่</li>
              <li>ท่านมีเวลาเพียงเสี้ยววินาทีในการพิมพ์อักขระ <strong>ห้ามพิมพ์ผิดพลาดแม้แต่ตัวเดียว</strong></li>
            </>
          )}
          {pendingBriefing.level === 'pairs' && (
            <>
              <li>จิตมารกำลังรบกวนการฝึกจิตของท่าน ทำให้เกิดคลื่นแทรกซ้อน</li>
              <li>จงใช้สมาธิแยกแยะเสียงจริงออกจากเสียงลวง มีเวลา <strong>10 วินาที</strong></li>
            </>
          )}
          {pendingBriefing.level === 'boss' && (
            <>
              <li>ดวลเดือดกับบอส เลือดของบอสจะเยอะขึ้นตามระดับ</li>
              <li>บอสอาจมีดีบัพป่วนเช่น หมอกบัง หรือลดเวลา</li>
              <li>ถ้าหัวใจหมด 5 ดวง ถือว่าแพ้!</li>
            </>
          )}
          {pendingBriefing.level === 'horde' && (
            <>
              <li>กำจัดศัตรูให้ได้มากที่สุดภายในเวลา <strong>60 วินาที</strong></li>
              <li>ศัตรูแต่ละตัวมีเลือดน้อย ฆ่า 1 ตัว ตัวใหม่จะโผล่มาทันที</li>
              <li>การโจมตีจะแรงขึ้นเมื่อสะสมคอมโบได้</li>
            </>
          )}
          {pendingBriefing.level === 'armored' && (
            <>
              <li>บอส <strong>มารเกราะเหล็ก</strong> มีความอึดสูงมาก (500 HP)</li>
              <li>ดาเมจของคุณจะ <strong>คูณตามจำนวนคอมโบ</strong> (ยิ่งตอบถูกรวดเดียว ยิ่งตีแรง)</li>
              <li>⚠️ <strong>ห้ามตอบผิดเด็ดขาด!</strong> หากตอบผิด คอมโบจะแตกและมารจะฟื้นฟูเลือดตัวเอง 50 หน่วย</li>
            </>
          )}
          {pendingBriefing.level === 'speed' && (
            <>
              <li>ปีศาจวายุมีความเร็วสูงมาก คุณมีเวลาตอบเพียง <strong>2 วินาที</strong> ต่อคำถาม</li>
              <li>หากตอบช้ากว่า 2 วินาที จะถือว่าหมดเวลาและโดนสวนกลับทันที</li>
              <li>ตั้งสติและพึ่งพาสัญชาตญาณของคุณ!</li>
            </>
          )}
          {pendingBriefing.level === 'clones' && (
            <>
              <li>ภารกิจ: <strong>วิชาแยกเงา (Clone Skill)</strong></li>
              <li>ฟังเสียงพินอินให้ดี แล้วจดจำนินจาเป้าหมายที่เป็นเจ้าของเสียงนั้นไว้!</li>
              <li>เมื่อเข้าสู่โหมด <strong>สลับร่าง (Shuffling)</strong> นินจาทั้ง 4 จะสลับที่กันอย่างรวดเร็วเพื่อลวงตาคุณ</li>
              <li><strong>วิธีเล่น:</strong> จ้องจับผิดให้ดี แล้วใช้เมาส์ <strong>คลิก</strong> นินจาเป้าหมายให้ถูกต้อง!</li>
              <li>ต้องกำจัดนินจาเงาให้ครบตามจำนวนแบบสุ่ม (10 หรือ 15 ตัว) เพื่อรับ <span className="text-emerald-400 font-bold">200 EXP</span> และ <span className="text-yellow-500 font-bold">1 Boss Key</span></li>
            </>
          )}
          {pendingBriefing.level === 'talisman' && (
            <>
              <li>ภารกิจ: <strong>สกัดอักขระเวท (Talisman Crafting)</strong></li>
              <li>ฟังเสียงร่ายเวทให้ดี แล้วคลิก <strong>ผสมธาตุ</strong> จากแท่นอักขระเวทมนตร์</li>
              <li>ต้องผสมธาตุให้ถูกต้องตามลำดับเป๊ะๆ (เช่น iang = i + a + n + g)</li>
              <li>คลิก <strong>ร่ายเวท! (Cast)</strong> เพื่อส่งคำตอบ สะสมให้ครบตามจำนวนเพื่อผ่านภารกิจ!</li>
            </>
          )}
          {pendingBriefing.level === 'guqin' && (
            <>
              <li>ภารกิจ: <strong>พิณมารทะลวงจิต (Guqin Melody)</strong></li>
              <li>ฟังเสียงพินอินให้ดี ระบบจะบรรเลงเสียงวรรณยุกต์ต่อเนื่องกัน <strong>3 จังหวะ</strong>!</li>
              <li>เมื่อเข้าสู่โหมด <strong>ตอบโต้ (Counter Attack)</strong> คุณจะต้องดีดสายพิณกลับไปตามเสียงที่ได้ยิน</li>
              <li><strong>วิธีเล่น:</strong> ตั้งสมาธิให้ดี แล้วใช้เมาส์ <strong>คลิก</strong> สายพิณให้เรียงลำดับถูกต้องเป๊ะๆ! (หากพลาดจะเสียหัวใจ)</li>
              <li>ต้องสกัดจุดเพลงพิณให้ครบ 15 ชุด เพื่อรับ <span className="text-emerald-400 font-bold">200 EXP</span> และ <span className="text-yellow-500 font-bold">1 Boss Key</span></li>
            </>
          )}
        </ul>
      </div>

      <div className="flex gap-4 w-full mt-8">
        <button 
          onClick={() => setGameState('idle')}
          className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl font-bold rounded-xl transition-colors"
        >
          ยกเลิก
        </button>
        <button 
          onClick={() => startGame()}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform transform hover:-translate-y-1"
        >
          เริ่มภารกิจ!
        </button>
      </div>
    </div>
  );
}
