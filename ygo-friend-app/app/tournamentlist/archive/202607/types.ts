export type TeamLabel = 'A' | 'B';
export type GameType = string;

export type TeamMatch = {
  date: string;
  round: number;
  game: GameType;
  firstPlayer: string;
  firstPlayerTeam: TeamLabel;
  firstPlayerDeck: string;
  secondPlayer: string;
  secondPlayerTeam: TeamLabel;
  secondPlayerDeck: string;
  winner: string;
  winnerTeam: TeamLabel | null;
};
