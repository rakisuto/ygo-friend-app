export type TournamentFormat = 'individual' | 'team';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'finished';

export type Tournament = {
  id: string;
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  winner: string | null;
  archiveUrl: string;
};
