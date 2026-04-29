// app/layout.tsx
import './globals.css';


import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'マスターデュエル身内戦',
  description: 'マスターデュエル身内戦の対戦表・成績管理アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
