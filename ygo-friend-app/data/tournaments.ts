import type { Tournament } from '@/app/types/tournament';

export const TOURNAMENTS: Tournament[] = [
  {
    id: '202605',
    name: '2026年5月大会',
    format: 'individual',
    status: 'finished',
    winner: null,
    archiveUrl: '/tournamentlist/archive/202605',
  },
  {
    id: '202607',
    name: '2026年7月大会',
    format: 'team',
    status: 'upcoming',
    winner: null,
    archiveUrl: '/tournamentlist/archive/202607',
  },
];
