export interface Theme {
  cardId: number;
  cardName: string;
  imageUrl: string;
}

export interface Player {
  name: string;
  themes: Theme[];
}

export interface DraftState {
  players: Player[];
}

export const initialDraftState: DraftState = {
  players: [
    { name: 'Player1', themes: [] },
    { name: 'Player2', themes: [] },
    { name: 'Player3', themes: [] },
    { name: 'Player4', themes: [] },
  ],
};
