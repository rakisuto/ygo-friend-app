import type { Season } from '@/app/tournament/types';
import type { TeamMatch, TeamLabel } from './types';

/** チーム内での座席番号（1始まり）。表示用のラベル(A1/A2など)にのみ使う。 */
function seatNumbers(season: Season): Record<string, number> {
  const seats: Record<string, number> = {};
  (['A', 'B'] as TeamLabel[]).forEach(team => {
    season.players.filter(p => p.team === team).forEach((p, i) => { seats[p.id] = i + 1; });
  });
  return seats;
}

export function seasonToTeamMatches(season: Season): TeamMatch[] {
  const playerMap = new Map(season.players.map(p => [p.id, p]));
  const seats = seatNumbers(season);
  const result: TeamMatch[] = [];

  for (const session of season.sessions) {
    const ordered = [...session.matches].sort((a, b) => a.matchNumber - b.matchNumber);
    for (const m of ordered) {
      const first = playerMap.get(m.firstPlayerId);
      const second = playerMap.get(m.secondPlayerId);
      if (!first || !second) continue;
      const winner = m.winnerId ? playerMap.get(m.winnerId) : undefined;
      const firstTeam: TeamLabel = first.team ?? 'A';
      const secondTeam: TeamLabel = second.team ?? 'B';

      result.push({
        date: session.date,
        round: m.matchNumber,
        game: `${firstTeam}${seats[first.id] ?? '?'}vs${secondTeam}${seats[second.id] ?? '?'}`,
        firstPlayer: first.teamPlayerName || first.name,
        firstPlayerTeam: firstTeam,
        firstPlayerDeck: m.firstPlayerDeck ?? '',
        secondPlayer: second.teamPlayerName || second.name,
        secondPlayerTeam: secondTeam,
        secondPlayerDeck: m.secondPlayerDeck ?? '',
        winner: winner ? (winner.teamPlayerName || winner.name) : '',
        winnerTeam: winner ? (winner.team ?? null) : null,
      });
    }
  }

  return result;
}
