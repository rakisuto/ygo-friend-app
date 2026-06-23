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

export const initialDraftState: DraftState = {
  players: [
    { name: 'Player1', themes: [] },
    { name: 'Player2', themes: [] },
    { name: 'Player3', themes: [] },
    { name: 'Player4', themes: [] },
  ],
};
