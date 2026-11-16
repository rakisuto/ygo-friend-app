import type { Match, Season, DeckImageMap, DeckImageLibrary } from '@/app/tournament/types';
import { computePointStandings, isConfirmed, matchPoints, winnerSide } from './points';
import { matchIssues } from './readiness';

export type AnnounceKind = 'start' | 'result';

export type AnnounceBuild = { ok: true; content: string } | { ok: false; error: string };

export interface AnnounceContext {
  deckImages: DeckImageMap;
  deckImageLibrary: DeckImageLibrary;
}

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

/**
 * Discord に投稿する文面を作る。
 * - start : 「N戦目は A と B です。対戦席に移動し、準備ができ次第、DUELを開始してください」
 * - result: 「N戦目の試合結果　Xの勝利です(先攻/後攻勝利 +N点)」+ 次の試合の案内。
 *           そのセッションの最終試合なら、次の案内の代わりに本日の結果と総合順位(勝ち点・本日時点)を添える。
 *           結果のアナウンスは、確定の条件(先攻/後攻が決定・デッキ名・デッキ画像・勝者)を満たし、
 *           確定済みの試合だけ投稿できる。
 * 文面は保存済みの season から作る(結果を確定・保存してから呼ぶこと)。
 */
export function buildAnnouncement(
  season: Season,
  sessionId: string,
  matchNumber: number,
  kind: AnnounceKind,
  ctx: AnnounceContext
): AnnounceBuild {
  const session = season.sessions.find(s => s.id === sessionId);
  if (!session) return { ok: false, error: '開催回が見つかりません' };

  const nameOf = Object.fromEntries(season.players.map(p => [p.id, p.name]));
  const sorted = [...session.matches].sort((a, b) => a.matchNumber - b.matchNumber);
  const idx = sorted.findIndex(m => m.matchNumber === matchNumber);
  if (idx === -1) return { ok: false, error: `${matchNumber}戦目が見つかりません` };

  const startLine = (m: Match) =>
    `${m.matchNumber}戦目は ${nameOf[m.firstPlayerId]} と ${nameOf[m.secondPlayerId]} です。対戦席に移動し、準備ができ次第、DUELを開始してください`;

  if (kind === 'start') {
    return { ok: true, content: startLine(sorted[idx]) };
  }

  const m = sorted[idx];
  const issues = matchIssues(m, ctx.deckImages, ctx.deckImageLibrary);
  if (issues.length > 0) {
    return { ok: false, error: `${matchNumber}戦目はアナウンスできません（${issues.join('・')}）` };
  }
  if (!isConfirmed(m)) return { ok: false, error: `${matchNumber}戦目が確定されていません` };

  const winnerName = nameOf[m.winnerId!];
  const resultLine = `${m.matchNumber}戦目の試合結果　${winnerName}の勝利です（${winnerSide(m)}勝利 +${matchPoints(m)}点）`;

  const next = sorted[idx + 1];
  if (next) {
    return { ok: true, content: `${resultLine}\n${startLine(next)}` };
  }

  // 最終試合: 本日の結果 + 総合順位(勝ち点・本日時点)
  const todayLines = sorted.map(x => {
    const vs = `${nameOf[x.firstPlayerId]} vs ${nameOf[x.secondPlayerId]}`;
    if (!x.winnerId) return `${x.matchNumber}戦目　${vs} → 結果未入力`;
    if (!isConfirmed(x)) return `${x.matchNumber}戦目　${vs} → 未確定`;
    return `${x.matchNumber}戦目　${vs} → ${nameOf[x.winnerId]}の勝利（+${matchPoints(x)}点）`;
  });
  const standingLines = computePointStandings(season).map(row =>
    `${RANK_MEDAL[row.rank] ?? '▫️'} ${row.rank}位　${row.playerName}　${row.points}点（${row.wins}勝${row.losses}敗）`
  );

  const content = [
    resultLine,
    '',
    `📋 本日の結果（${session.label}）`,
    ...todayLines,
    '',
    '🏆 総合順位（勝ち点・本日時点）',
    ...standingLines,
  ].join('\n');
  return { ok: true, content };
}
