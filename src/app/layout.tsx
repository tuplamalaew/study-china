import type { Metadata } from "next";
import { Noto_Serif_Thai, Ma_Shan_Zheng, Noto_Serif } from "next/font/google";
import "./globals.css";

const notoSerifThai = Noto_Serif_Thai({
  weight: ['400', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
});

const maShanZheng = Ma_Shan_Zheng({
  weight: '400',
  subsets: ["latin"],
  variable: "--font-ma-shan",
});

const notoSerif = Noto_Serif({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "StudyChina - Wuxia Training",
  description: "ฝึกฝนภาษาจีน พินอิน (Pinyin) ในรูปแบบเกมกระบี่เย้ยยุทธจักร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSerifThai.variable} ${maShanZheng.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
