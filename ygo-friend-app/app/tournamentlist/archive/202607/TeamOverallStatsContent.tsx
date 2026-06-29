'use client';

import type { TeamMatch } from './types';

const RANK_BADGE: Record<number, { label: string; glow: string }> = {
  1: { label: '🥇', glow: '#fbbf24' },
  2: { label: '🥈', glow: '#94a3b8' },
  3: { label: '🥉', glow: '#f97316' },
  4: { label: '💀', glow: '#ef4444' },
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

const glass: React.CSSProperties = {
  background: 'rgba(10, 15, 35, 0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

const thStyle: React.CSSProperties = {
  padding: '12px 12px',
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'rgba(148,163,184,0.9)',
};

interface Props { matches: TeamMatch[] }

export default function TeamOverallStatsContent({ matches }: Props) {
  const playedMatches = matches.filter(m => m.firstPlayer && m.secondPlayer);

  if (playedMatches.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
        まだ試合結果がありません
      </div>
    );
  }

  const standings = computeStandings(playedMatches);
  const deckUsage = computeDeckUsage(playedMatches);

  return (
    <>
      {/* 順位表 */}
      <div style={{ ...glass, overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🏆</span>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '0.02em' }}>順位表</h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem', minWidth: '320px' }} className="gothic">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                <th style={{ ...thStyle, textAlign: 'center', width: '56px' }}>順位</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>プレイヤー</th>
                <th style={{ ...thStyle, textAlign: 'center', color: '#4ade80', width: '48px' }}>勝</th>
                <th style={{ ...thStyle, textAlign: 'center', color: '#f87171', width: '48px' }}>敗</th>
                <th style={{ ...thStyle, textAlign: 'right', width: '72px' }}>勝率</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => {
                const badge = RANK_BADGE[row.rank];
                return (
                  <tr key={row.name} style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: row.rank === 1 ? 'rgba(251,191,36,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                  }}>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {badge ? (
                        <span style={{ fontSize: '1.375rem', filter: `drop-shadow(0 0 6px ${badge.glow})` }}>
                          {badge.label}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(148,163,184,0.7)', fontWeight: 600 }}>{row.rank}位</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: row.rank === 1 ? 800 : 500, color: row.rank === 1 ? '#fde68a' : 'rgba(226,232,240,0.95)', fontSize: '1rem' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#4ade80', fontSize: '1.125rem' }}>{row.wins}</td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#f87171', fontSize: '1.125rem' }}>{row.losses}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 700,
                        color: row.winRate >= 60 ? '#4ade80' : row.winRate >= 40 ? '#fbbf24' : '#f87171',
                      }}>
                        {row.wins + row.losses === 0 ? '—' : `${row.winRate}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* デッキ使用率 */}
      {deckUsage.length > 0 && (
        <div style={{ ...glass, padding: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🃏</span> デッキ使用率
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(148,163,184,0.7)', marginBottom: '14px' }}>
            全試合における各デッキの使用回数
          </p>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '280px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ ...thStyle, textAlign: 'left', padding: '6px 8px' }}>デッキ</th>
                  <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', width: '52px' }}>使用</th>
                  <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#4ade80', width: '40px' }}>勝</th>
                  <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#f87171', width: '40px' }}>敗</th>
                  <th style={{ ...thStyle, textAlign: 'right', padding: '6px 8px', width: '64px' }}>勝率</th>
                </tr>
              </thead>
              <tbody>
                {deckUsage.map(d => (
                  <tr key={d.deck} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>{d.deck}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: 'rgba(148,163,184,0.8)', fontWeight: 600 }}>{d.count}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{d.wins}</td>
                    <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{d.losses}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: d.winRate >= 60 ? '#4ade80' : d.winRate >= 40 ? '#fbbf24' : '#f87171' }}>
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
