export type TeamLabel = 'A' | 'B';
export type GameType = 'A1vsB1' | 'A2vsB2';

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
