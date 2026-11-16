import type { Match, Season } from '@/app/tournament/types';

/** 勝ち点: 先攻で勝利 +1 / 後攻で勝利 +2 */
export const FIRST_WIN_POINTS = 1;
export const SECOND_WIN_POINTS = 2;

/**
 * 確定済みか。confirmed が未指定の試合は、勝者が入っていれば確定済みとみなす
 * (確定機能の導入前に入力した結果を、そのまま公開・集計するため)。
 */
export function isConfirmed(m: Match): boolean {
  return m.confirmed ?? Boolean(m.winnerId);
}

/** 勝者が得る勝ち点。勝者なし・先攻未定(先攻/後攻が決まっていない)の試合は 0 点。 */
export function matchPoints(m: Match): number {
  if (!m.winnerId || m.firstUndecided) return 0;
  if (m.winnerId === m.firstPlayerId) return FIRST_WIN_POINTS;
  if (m.winnerId === m.secondPlayerId) return SECOND_WIN_POINTS;
  return 0;
}

/** 勝者が先攻/後攻のどちらだったか(先攻未定・勝者なしは null) */
export function winnerSide(m: Match): '先攻' | '後攻' | null {
  if (!m.winnerId || m.firstUndecided) return null;
  if (m.winnerId === m.firstPlayerId) return '先攻';
  if (m.winnerId === m.secondPlayerId) return '後攻';
  return null;
}

/** 確定済みの試合だけを残したシーズン(順位・勝ち点・成績の集計用) */
export function confirmedSeason(season: Season): Season {
  return {
    ...season,
    sessions: season.sessions.map(s => ({ ...s, matches: s.matches.filter(isConfirmed) })),
  };
}

/** 未確定の試合の勝者を未定にしたシーズン(公開ページの試合表の表示用。対戦カード自体は見せる) */
export function maskUnconfirmed(season: Season): Season {
  return {
    ...season,
    sessions: season.sessions.map(s => ({
      ...s,
      matches: s.matches.map(m => (isConfirmed(m) ? m : { ...m, winnerId: null })),
    })),
  };
}

export interface PointRow {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  losses: number;
  firstWins: number;
  secondWins: number;
  winRate: number;
  rank: number;
}

/**
 * 勝ち点順の順位表(確定済みの試合のみ)。
 * 並び: 勝ち点 → 勝利数 → 敗戦数(少ない方が上)。勝ち点と勝利数が同じ場合は同順位。
 */
export function computePointStandings(season: Season): PointRow[] {
  const rows = season.players.map(p => ({
    playerId: p.id, playerName: p.name,
    points: 0, wins: 0, losses: 0, firstWins: 0, secondWins: 0, winRate: 0, rank: 0,
  }));
  const byId = new Map(rows.map(r => [r.playerId, r]));

  for (const s of season.sessions) {
    for (const m of s.matches) {
      if (!m.winnerId || !isConfirmed(m)) continue;
      for (const id of [m.firstPlayerId, m.secondPlayerId]) {
        const row = byId.get(id);
        if (!row) continue;
        if (id === m.winnerId) {
          row.wins++;
          row.points += matchPoints(m);
          if (winnerSide(m) === '先攻') row.firstWins++;
          if (winnerSide(m) === '後攻') row.secondWins++;
        } else {
          row.losses++;
        }
      }
    }
  }

  rows.forEach(r => {
    const total = r.wins + r.losses;
    r.winRate = total === 0 ? 0 : Math.round((r.wins / total) * 1000) / 10;
  });
  rows.sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses);
  rows.forEach((r, i) => {
    const prev = rows[i - 1];
    r.rank = prev && prev.points === r.points && prev.wins === r.wins ? prev.rank : i + 1;
  });
  return rows;
}

/** あるプレイヤーの獲得勝ち点(確定済みの試合のみ) */
export function playerPoints(season: Season, playerId: string): number {
  return computePointStandings(season).find(r => r.playerId === playerId)?.points ?? 0;
}
