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

/** デッキテーマ名 → 表示画像の紐づけ。1枚の画像を簡易クロップ(位置・拡大率)して使い回す。 */
export interface DeckImageMapping {
  imagePath: string;
  offsetX: number; // 0-100 (%)
  offsetY: number; // 0-100 (%)
  scale: number; // 100-300 (%)
}

export type DeckImageMap = Record<string, DeckImageMapping>;
