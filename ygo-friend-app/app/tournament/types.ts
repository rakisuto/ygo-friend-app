export interface Player {
  id: string;
  name: string;
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
  firstPlayerCounts: Record<string, number>;
  matches: Match[];
}

export interface Season {
  id: string;
  name: string;
  description?: string;
  players: Player[];
  sessions: Session[];
  createdAt: string;
}
