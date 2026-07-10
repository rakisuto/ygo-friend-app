import type { Theme } from '@/app/types/draft';

export type TeamKey = 'A' | 'B';

export interface Player {
  id: string;
  name: string;
  team?: TeamKey;
  teamPlayerName?: string;
  deckThemes?: Theme[];
}

export interface Match {
  matchNumber: number;
  firstPlayerId: string;
  firstPlayerDeck: string | null;
  secondPlayerId: string;
  secondPlayerDeck: string | null;
  winnerId: string | null;
}

export interface Session {
  id: string;
  date: string;
  label: string;
  firstPlayerCounts?: Record<string, number>;
  matches: Match[];
}

export interface Season {
  id: string;
  name: string;
  description?: string;
  players: Player[];
  sessions: Session[];
  createdAt: string;
  teamNames?: { A: string; B: string };
}

/** 1枚分の画像レイヤー。位置・拡大率で簡易クロップする。 */
export interface DeckImageLayer {
  imageUrl: string;
  offsetX: number; // 0-100 (%)
  offsetY: number; // 0-100 (%)
  scale: number; // 100-300 (%)
}

/** 複数テーマの掛け合わせは枚数分割で並べて表示する、合成済み画像1件分。 */
export type DeckImageMapping = DeckImageLayer[];

/** 保存済みの合成画像プリセット。ラベルを付けて使い回す。 */
export interface DeckImagePreset {
  id: string;
  label: string;
  layers: DeckImageLayer[];
}

export type DeckImageLibrary = DeckImagePreset[];

/** デッキテーマ名 → 使用するプリセットID の紐づけ。 */
export type DeckImageMap = Record<string, string>;
