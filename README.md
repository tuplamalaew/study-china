# 🇨🇳 StudyChina (Wuxia Pinyin Master)

![StudyChina Banner](https://img.shields.io/badge/Status-Migrating_to_Unity-orange?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

**StudyChina** เป็นแอปพลิเคชันเรียนภาษาจีน (Pinyin) ที่ผสานความสนุกของเกมแนว Wuxia (จอมยุทธ์) และ Auto-Battler เข้าด้วยกัน เพื่อให้การจำตัวอักษรและเสียงพินอินไม่น่าเบื่ออีกต่อไป 

> ⚠️ **ประกาศ (Notice):** โปรเจกต์นี้กำลังอยู่ในช่วง Scale-up และย้าย Engine ไปยัง **Unity 3D** เพื่อยกระดับระบบต่อสู้และกราฟิก 
> ฟีเจอร์ "โหมดฝึกคำศัพท์ (Auto-Battler)" ในเวอร์ชัน Web/React นี้จึงถูกแช่แข็งไว้ชั่วคราว

---

## 🎮 ลองเล่นเลย! (Live Demo)
ไม่ต้องดาวน์โหลดหรือติดตั้ง! คุณสามารถทดลองเล่น **โหมดฝึกพินอินพื้นฐาน** ผ่านบราวเซอร์ได้ทันที:

👉 **[คลิกที่นี่เพื่อเข้าสู่โลกแห่งจอมยุทธ์ (Play on Vercel)](#)** *(นำลิงก์ Vercel มาแปะแทน `#` ได้ทันทีหลังจาก Deploy)*

---

## ✨ ฟีเจอร์เด่น (Features)
- **Gamified Learning:** เปลี่ยนการทำแบบทดสอบให้เป็นการปัดป้องและโจมตีด้วยเวทมนตร์และเพลงกระบี่
- **Wuxia Aesthetic:** ดีไซน์ UI แบบ Glassmorphism โทนดาร์ค พร้อมเอฟเฟกต์สีทอง/หยก ให้กลิ่นอายหนังจีนกำลังภายใน
- **Dynamic Combo & Physics:** มีระบบ Combo, Floating Damage (Pixi.js) และเสียง SFX สมจริง
- **Comprehensive Pinyin System:** ครอบคลุมทั้ง พยัญชนะ (Initials), สระ (Finals) และวรรณยุกต์ (Tones) 

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend Framework:** Next.js 16 (App Router, Static Export)
- **UI & Styling:** Tailwind CSS v4, Framer Motion (สำหรับ Animations)
- **State Management:** Zustand
- **Game Engine (Web):** Pixi.js (สำหรับ Floating Texts) และ Web Audio API (สำหรับเสียงเอฟเฟกต์)
- **Desktop Bundle:** Electron & Electron Builder

## 🚀 วิธีการรันโปรเจกต์ในเครื่อง (Local Setup)
หากต้องการโคลนโปรเจกต์นี้ไปรันหรือศึกษาโค้ด สามารถทำตามขั้นตอนต่อไปนี้ได้เลยครับ:

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/study-china.git
   cd study-china
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run for Web (Browser):**
   ```bash
   npm run dev
   ```
4. **Run as Desktop App (Electron):**
   ```bash
   npm run dev:desktop
   ```

## 📬 ติดต่อ (Contact)
*ช่องทางสำหรับให้ Recruiter หรือคนสนใจติดต่อคุณ*
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your Name](#)
