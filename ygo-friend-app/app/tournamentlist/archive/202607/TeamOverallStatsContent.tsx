'use client';

import type { TeamMatch } from './types';

const RANK_BADGE: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#fef9c3', color: '#92400e', label: '🥇' },
  2: { bg: '#f1f5f9', color: '#475569', label: '🥈' },
  3: { bg: '#fff7ed', color: '#9a3412', label: '🥉' },
  4: { bg: '#fef2f2', color: '#991b1b', label: '💀' },
};

interface Standing {
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  rank: number;
}

interface DeckUsage {
  deck: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
}

function computeStandings(matches: TeamMatch[]): Standing[] {
  const map: Record<string, { wins: number; losses: number }> = {};

  for (const m of matches) {
    for (const player of [m.firstPlayer, m.secondPlayer]) {
      if (!player) continue;
      if (!map[player]) map[player] = { wins: 0, losses: 0 };
      if (m.winner === player) map[player].wins++;
      else if (m.winner && m.winner !== player) map[player].losses++;
    }
  }

  const standings = Object.entries(map).map(([name, r]) => {
    const total = r.wins + r.losses;
    return { name, ...r, winRate: total > 0 ? Math.round(r.wins / total * 1000) / 10 : 0, rank: 0 };
  });

  standings.sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
  standings.forEach((s, i) => { s.rank = i + 1; });

  return standings;
}

function computeDeckUsage(matches: TeamMatch[]): DeckUsage[] {
  const map: Record<string, { count: number; wins: number; losses: number }> = {};

  for (const m of matches) {
    for (const [deck, player] of [[m.firstPlayerDeck, m.firstPlayer], [m.secondPlayerDeck, m.secondPlayer]] as [string, string][]) {
      if (!deck) continue;
      if (!map[deck]) map[deck] = { count: 0, wins: 0, losses: 0 };
      map[deck].count++;
      if (m.winner === player) map[deck].wins++;
      else if (m.winner && m.winner !== player) map[deck].losses++;
    }
  }

  return Object.entries(map)
    .map(([deck, r]) => {
      const total = r.wins + r.losses;
      return { deck, ...r, winRate: total > 0 ? Math.round(r.wins / total * 1000) / 10 : 0 };
    })
    .sort((a, b) => b.count - a.count);
}

interface Props { matches: TeamMatch[] }

export default function TeamOverallStatsContent({ matches }: Props) {
  const playedMatches = matches.filter(m => m.firstPlayer && m.secondPlayer);

  if (playedMatches.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
        まだ試合結果がありません
      </div>
    );
  }

  const standings = computeStandings(playedMatches);
  const deckUsage = computeDeckUsage(playedMatches);

  return (
    <>
      {/* 順位表 */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>🏆 順位表</h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', minWidth: '320px' }} className="gothic">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontWeight: 600, width: '56px' }}>順位</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>プレイヤー</th>
                <th style={{ padding: '10px 10px', textAlign: 'center', color: '#16a34a', fontWeight: 600, width: '48px' }}>勝</th>
                <th style={{ padding: '10px 10px', textAlign: 'center', color: '#dc2626', fontWeight: 600, width: '48px' }}>敗</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b', fontWeight: 600, width: '72px' }}>勝率</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => {
                const badge = RANK_BADGE[row.rank];
                return (
                  <tr key={row.name} style={{
                    borderTop: '1px solid #f1f5f9',
                    background: row.rank === 1 ? '#fffbeb' : i % 2 === 0 ? '#fff' : '#fafafa',
                  }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {badge ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: badge.bg, color: badge.color, fontWeight: 700, fontSize: '1rem',
                        }}>
                          {badge.label}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.rank}位</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: row.rank === 1 ? 700 : 500, color: '#1e293b', fontSize: '1rem' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#16a34a', fontSize: '1.125rem' }}>{row.wins}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#dc2626', fontSize: '1.125rem' }}>{row.losses}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: row.winRate >= 60 ? '#16a34a' : row.winRate >= 40 ? '#d97706' : '#dc2626' }}>
                        {row.wins + row.losses === 0 ? '—' : `${row.winRate}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ height: '1px' }} />
      </div>

      {/* デッキ使用率 */}
      {deckUsage.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>🃏 デッキ使用率</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '14px' }}>
            全試合における各デッキの使用回数
          </p>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '280px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>デッキ</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '52px' }}>使用</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: '#16a34a', fontWeight: 600, width: '40px' }}>勝</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', color: '#dc2626', fontWeight: 600, width: '40px' }}>敗</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '64px' }}>勝率</th>
                </tr>
              </thead>
              <tbody>
                {deckUsage.map(d => (
                  <tr key={d.deck} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>{d.deck}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>{d.count}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{d.wins}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{d.losses}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: d.winRate >= 60 ? '#16a34a' : d.winRate >= 40 ? '#d97706' : '#dc2626' }}>
                        {d.wins + d.losses === 0 ? '—' : `${d.winRate}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
