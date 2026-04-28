import type { Season, Match } from '@/app/tournament/types';

// ────── shared types ──────

export interface DeckRecord {
  wins: number;
  losses: number;
  winRate: number;
}

export interface VsPlayerRecord {
  wins: number;
  losses: number;
  opponentName: string;
  winRate: number;
}

export interface ThemeRecord {
  deck: string;
  wins: number;
  losses: number;
  winRate: number;
}

export interface PlayerStats {
  totalWins: number;
  totalLosses: number;
  winRate: number;
  /** 自分のデッキごとの勝敗 */
  deckStats: Record<string, DeckRecord>;
  /** 先攻での勝敗 */
  firstStats: { wins: number; losses: number; total: number };
  /** 後攻での勝敗 */
  secondStats: { wins: number; losses: number; total: number };
  /** 対プレイヤー別勝敗 */
  vsPlayerStats: Record<string, VsPlayerRecord>;
  /** 最大連勝 */
  maxWinStreak: number;
  /** 有利テーマ TOP3 */
  advantageThemes: ThemeRecord[];
  /** 不利テーマ TOP3 */
  disadvantageThemes: ThemeRecord[];
}

export interface StandingRow {
  playerId: string;
  playerName: string;
  wins: number;
  losses: number;
  winRate: number;
  rank: number;
}

// ────── helpers ──────

function winRate(wins: number, total: number): number {
  return total === 0 ? 0 : Math.round((wins / total) * 1000) / 10;
}

/** 全セッションの試合を順番に並べる (session順 → matchNumber順) */
function orderedMatches(season: Season): Match[] {
  return season.sessions.flatMap(s =>
    [...s.matches].sort((a, b) => a.matchNumber - b.matchNumber)
  );
}

// ────── per-player stats ──────

export function computePlayerStats(season: Season, playerId: string): PlayerStats {
  const playerMap = Object.fromEntries(season.players.map(p => [p.id, p.name]));

  let totalWins = 0;
  let totalLosses = 0;
  const deckStats: Record<string, { wins: number; losses: number }> = {};
  const firstStats = { wins: 0, losses: 0, total: 0 };
  const secondStats = { wins: 0, losses: 0, total: 0 };
  const vsRaw: Record<string, { wins: number; losses: number }> = {};
  const vsTheme: Record<string, { wins: number; losses: number }> = {};

  let maxWinStreak = 0;
  let currentStreak = 0;

  for (const match of orderedMatches(season)) {
    const involved = match.firstPlayerId === playerId || match.secondPlayerId === playerId;
    if (!involved || !match.winnerId) continue;

    const isFirst = match.firstPlayerId === playerId;
    const won = match.winnerId === playerId;
    const myDeck = isFirst ? match.firstPlayerDeck : match.secondPlayerDeck;
    const opponentId = isFirst ? match.secondPlayerId : match.firstPlayerId;
    const opponentDeck = isFirst ? match.secondPlayerDeck : match.firstPlayerDeck;

    // totals
    if (won) { totalWins++; currentStreak++; maxWinStreak = Math.max(maxWinStreak, currentStreak); }
    else { totalLosses++; currentStreak = 0; }

    // own deck
    if (myDeck) {
      if (!deckStats[myDeck]) deckStats[myDeck] = { wins: 0, losses: 0 };
      if (won) deckStats[myDeck].wins++; else deckStats[myDeck].losses++;
    }

    // 先後
    if (isFirst) {
      firstStats.total++;
      if (won) firstStats.wins++; else firstStats.losses++;
    } else {
      secondStats.total++;
      if (won) secondStats.wins++; else secondStats.losses++;
    }

    // vs player
    if (!vsRaw[opponentId]) vsRaw[opponentId] = { wins: 0, losses: 0 };
    if (won) vsRaw[opponentId].wins++; else vsRaw[opponentId].losses++;

    // vs theme
    if (opponentDeck) {
      if (!vsTheme[opponentDeck]) vsTheme[opponentDeck] = { wins: 0, losses: 0 };
      if (won) vsTheme[opponentDeck].wins++; else vsTheme[opponentDeck].losses++;
    }
  }

  const vsPlayerStats: Record<string, VsPlayerRecord> = {};
  for (const [id, r] of Object.entries(vsRaw)) {
    const total = r.wins + r.losses;
    vsPlayerStats[id] = { ...r, opponentName: playerMap[id] ?? id, winRate: winRate(r.wins, total) };
  }

  const themeList: ThemeRecord[] = Object.entries(vsTheme).map(([deck, r]) => ({
    deck, wins: r.wins, losses: r.losses,
    winRate: winRate(r.wins, r.wins + r.losses),
  }));

  const advantageThemes = [...themeList]
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
    .slice(0, 3);

  const disadvantageThemes = [...themeList]
    .sort((a, b) => a.winRate - b.winRate || b.losses - a.losses)
    .slice(0, 3);

  const deckStatsFinal: Record<string, DeckRecord> = {};
  for (const [deck, r] of Object.entries(deckStats)) {
    deckStatsFinal[deck] = { ...r, winRate: winRate(r.wins, r.wins + r.losses) };
  }

  return {
    totalWins, totalLosses,
    winRate: winRate(totalWins, totalWins + totalLosses),
    deckStats: deckStatsFinal,
    firstStats, secondStats,
    vsPlayerStats,
    maxWinStreak,
    advantageThemes,
    disadvantageThemes,
  };
}

// ────── overall standings ──────

export function computeStandings(season: Season): StandingRow[] {
  const rows = season.players.map(p => {
    let wins = 0;
    let losses = 0;
    for (const s of season.sessions) {
      for (const m of s.matches) {
        if (!m.winnerId) continue;
        if (m.firstPlayerId === p.id || m.secondPlayerId === p.id) {
          if (m.winnerId === p.id) wins++; else losses++;
        }
      }
    }
    return { playerId: p.id, playerName: p.name, wins, losses, winRate: winRate(wins, wins + losses), rank: 0 };
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  // dense rank (同勝数→同順位、次は +人数分)
  rows.forEach((row, i) => {
    if (i === 0) { row.rank = 1; return; }
    row.rank = rows[i - 1].wins === row.wins ? rows[i - 1].rank : i + 1;
  });

  return rows;
}

// ────── deck usage for pie chart ──────

export interface DeckUsage {
  name: string;
  value: number;
}

export function computeDeckUsage(season: Season): DeckUsage[] {
  const counts: Record<string, number> = {};
  for (const s of season.sessions) {
    for (const m of s.matches) {
      if (m.firstPlayerDeck)  counts[m.firstPlayerDeck]  = (counts[m.firstPlayerDeck]  ?? 0) + 1;
      if (m.secondPlayerDeck) counts[m.secondPlayerDeck] = (counts[m.secondPlayerDeck] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}
