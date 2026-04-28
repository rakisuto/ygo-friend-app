import { v4 as uuidv4 } from 'uuid';
import type { Player, Match, Session, Season } from '@/app/tournament/types';

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
  const square = makeLatinSquare(players.length);

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
