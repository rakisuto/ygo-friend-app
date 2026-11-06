import { v4 as uuidv4 } from 'uuid';
import type { Player, Match, Session, Season, TeamKey } from '@/app/tournament/types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ラテン方陣を生成する。square[player][session] = 先攻回数(0〜n-1)
// 各プレイヤーが各セッションで異なる先攻回数を持ち、
// 全セッションの合計が均等になることを保証する。
function makeLatinSquare(n: number): number[][] {
  const base: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i + j) % n)
  );
  const rows = shuffle(Array.from({ length: n }, (_, i) => i));
  const cols = shuffle(Array.from({ length: n }, (_, i) => i));
  return rows.map(r => cols.map(c => base[r][c]));
}

function permutations(n: number): number[][] {
  if (n <= 1) return [[0]];
  const result: number[][] = [];
  const rec = (cur: number[], rest: number[]) => {
    if (rest.length === 0) { result.push(cur); return; }
    rest.forEach((v, i) => rec([...cur, v], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  rec([], Array.from({ length: n }, (_, i) => i));
  return result;
}

// 開催回数がプレイヤー数より少ない場合(例: 4人で3回)のラテン方陣の代わり。
// 各セッションは0〜n-1の先攻回数を全員に1つずつ割り当て(順列)、
// 「全セッション合計の先攻回数の差が1以内」かつ「どのペアも一方が毎回先攻にならない」
// 組み合わせをランダムに選ぶ。条件を満たす組み合わせが無ければ合計の差が最小のものを選ぶ。
// 戻り値: square[player][session]
function makeBalancedSquare(n: number, sessions: number): number[][] {
  const perms = permutations(n);
  const score = (picked: number[][]): { spread: number; lopsided: number } => {
    const totals = Array.from({ length: n }, (_, p) => picked.reduce((s, perm) => s + perm[p], 0));
    let lopsided = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const iAhead = picked.filter(perm => perm[i] > perm[j]).length;
        if (iAhead === 0 || iAhead === sessions) lopsided++;
      }
    }
    return { spread: Math.max(...totals) - Math.min(...totals), lopsided };
  };

  let best: number[][][] = [];
  let bestKey = [Infinity, Infinity];
  const rec = (picked: number[][]) => {
    if (picked.length === sessions) {
      const { spread, lopsided } = score(picked);
      const key = [Math.max(spread - 1, 0), lopsided];
      if (key[0] < bestKey[0] || (key[0] === bestKey[0] && key[1] < bestKey[1])) {
        bestKey = key;
        best = [picked];
      } else if (key[0] === bestKey[0] && key[1] === bestKey[1]) {
        best.push(picked);
      }
      return;
    }
    for (const perm of perms) rec([...picked, perm]);
  };
  rec([]);

  const chosen = best[Math.floor(Math.random() * best.length)];
  return Array.from({ length: n }, (_, p) => chosen.map(perm => perm[p]));
}

// 先攻回数が多いプレイヤーが先攻になるようにペアを組む
function makeMatches(players: Player[], counts: number[]): Match[] {
  const matches: Match[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const iFirst = counts[i] > counts[j];
      matches.push({
        matchNumber: 0,
        firstPlayerId: iFirst ? players[i].id : players[j].id,
        firstPlayerDeck: null,
        secondPlayerId: iFirst ? players[j].id : players[i].id,
        secondPlayerDeck: null,
        winnerId: null,
      });
    }
  }
  return shuffle(matches).map((m, i) => ({ ...m, matchNumber: i + 1 }));
}

export function generateSeason(
  playerNames: string[],
  dates: string[],
  seasonName: string
): Season {
  const players: Player[] = playerNames.map(name => ({ id: uuidv4(), name }));
  // 回数 = 人数ならラテン方陣で完全に均等。それ以外は偏りが最小になる割り当てを探す。
  const square = dates.length === players.length
    ? makeLatinSquare(players.length)
    : makeBalancedSquare(players.length, dates.length);

  const sessions: Session[] = dates.map((date, si) => {
    const counts = players.map((_, pi) => square[pi][si]);
    const firstPlayerCounts: Record<string, number> = {};
    players.forEach((p, i) => { firstPlayerCounts[p.id] = counts[i]; });

    return {
      id: `session-${si + 1}`,
      date,
      label: `第${si + 1}回`,
      firstPlayerCounts,
      matches: makeMatches(players, counts),
    };
  });

  return {
    id: uuidv4(),
    name: seasonName,
    players,
    sessions,
    createdAt: new Date().toISOString(),
  };
}

// チーム同士(A vs B)の総当たりのみを組む。先攻/後攻はコイントスで決めるため生成時には割り当てない。
function makeTeamMatches(teamA: Player[], teamB: Player[]): Match[] {
  const matches: Match[] = [];
  for (const a of teamA) {
    for (const b of teamB) {
      matches.push({
        matchNumber: 0,
        firstPlayerId: a.id,
        firstPlayerDeck: null,
        secondPlayerId: b.id,
        secondPlayerDeck: null,
        winnerId: null,
      });
    }
  }
  return shuffle(matches).map((m, i) => ({ ...m, matchNumber: i + 1 }));
}

export function generateTeamSeason(
  playerNames: string[],
  playerTeams: TeamKey[],
  dates: string[],
  seasonName: string
): Season {
  const players: Player[] = playerNames.map((name, i) => ({ id: uuidv4(), name, team: playerTeams[i] }));
  const teamA = players.filter(p => p.team === 'A');
  const teamB = players.filter(p => p.team === 'B');

  const sessions: Session[] = dates.map((date, si) => ({
    id: `session-${si + 1}`,
    date,
    label: `第${si + 1}回`,
    matches: makeTeamMatches(teamA, teamB),
  }));

  return {
    id: uuidv4(),
    name: seasonName,
    players,
    sessions,
    createdAt: new Date().toISOString(),
  };
}
