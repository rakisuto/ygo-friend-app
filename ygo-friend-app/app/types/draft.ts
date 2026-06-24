export type Theme = {
  cardId: number;
  cardName: string;
  imageUrl: string;
};

export type Player = {
  name: string;
  themes: Theme[];
};

export type DraftState = {
  players: Player[];
};

export type BanRule = {
  id: string;
  name: string;
  bannedCardIds: number[];
};

export type SessionPlayer = {
  name: string;
  themes: Theme[];
  banRuleId: string | null;
};

export type DraftSession = {
  isActive: boolean;
  currentRound: number;
  totalRounds: number;
  currentTurnIndex: number;
  turnOrder: number[];
  players: SessionPlayer[];
};

export const initialDraftState: DraftState = {
  players: [
    { name: 'Player1', themes: [] },
    { name: 'Player2', themes: [] },
    { name: 'Player3', themes: [] },
    { name: 'Player4', themes: [] },
  ],
};
