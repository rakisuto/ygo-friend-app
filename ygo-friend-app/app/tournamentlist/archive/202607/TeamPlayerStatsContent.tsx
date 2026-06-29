'use client';

import { useState } from 'react';
import type { TeamMatch } from './types';

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  firstWins: number;
  firstLosses: number;
  secondWins: number;
  secondLosses: number;
  deckStats: Record<string, { wins: number; losses: number; winRate: number }>;
  vsStats: Record<string, { name: string; wins: number; losses: number; winRate: number }>;
}

function computeAllPlayerStats(matches: TeamMatch[]): Record<string, PlayerStats> {
  const result: Record<string, PlayerStats> = {};

  function ensure(name: string) {
    if (!result[name]) {
      result[name] = { name, wins: 0, losses: 0, winRate: 0, firstWins: 0, firstLosses: 0, secondWins: 0, secondLosses: 0, deckStats: {}, vsStats: {} };
    }
  }

  for (const m of matches) {
    if (!m.firstPlayer || !m.secondPlayer) continue;
    ensure(m.firstPlayer);
    ensure(m.secondPlayer);

    const isFirst = (p: string) => p === m.firstPlayer;
    const deck = (p: string) => isFirst(p) ? m.firstPlayerDeck : m.secondPlayerDeck;
    const opponent = (p: string) => isFirst(p) ? m.secondPlayer : m.firstPlayer;

    for (const player of [m.firstPlayer, m.secondPlayer]) {
      const st = result[player];
      const won = m.winner === player;
      const lost = !!m.winner && m.winner !== player;
      const deckName = deck(player) || '不明';
      const opp = opponent(player);

      if (!st.deckStats[deckName]) st.deckStats[deckName] = { wins: 0, losses: 0, winRate: 0 };
      if (!st.vsStats[opp]) st.vsStats[opp] = { name: opp, wins: 0, losses: 0, winRate: 0 };

      if (won) {
        st.wins++;
        st.deckStats[deckName].wins++;
        st.vsStats[opp].wins++;
        if (isFirst(player)) st.firstWins++; else st.secondWins++;
      } else if (lost) {
        st.losses++;
        st.deckStats[deckName].losses++;
        st.vsStats[opp].losses++;
        if (isFirst(player)) st.firstLosses++; else st.secondLosses++;
      }
    }
  }

  for (const st of Object.values(result)) {
    const total = st.wins + st.losses;
    st.winRate = total > 0 ? Math.round(st.wins / total * 1000) / 10 : 0;
    for (const d of Object.values(st.deckStats)) {
      const t = d.wins + d.losses;
      d.winRate = t > 0 ? Math.round(d.wins / t * 1000) / 10 : 0;
    }
    for (const v of Object.values(st.vsStats)) {
      const t = v.wins + v.losses;
      v.winRate = t > 0 ? Math.round(v.wins / t * 1000) / 10 : 0;
    }
  }

  return result;
}

function WinRateBadge({ wins, losses, winRate }: { wins: number; losses: number; winRate: number }) {
  const color = winRate >= 60 ? '#4ade80' : winRate >= 40 ? '#fbbf24' : '#f87171';
  const bg = winRate >= 60 ? 'rgba(74,222,128,0.15)' : winRate >= 40 ? 'rgba(251,191,36,0.15)' : 'rgba(248,113,113,0.15)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ color: 'rgba(148,163,184,0.9)' }}>{wins}勝{losses}敗</span>
      <span style={{ fontWeight: 700, fontSize: '0.875rem', color, background: bg, borderRadius: '999px', padding: '1px 10px' }}>
        {wins + losses === 0 ? '—' : `${winRate}%`}
      </span>
    </span>
  );
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
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'rgba(148,163,184,0.9)',
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...glass, padding: '16px', marginBottom: '16px' }}>
      <h3 style={{
        fontSize: '0.75rem', fontWeight: 700, color: 'rgba(148,163,184,0.8)',
        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px',
      }}>{title}</h3>
      {children}
    </div>
  );
}

interface Props { matches: TeamMatch[] }

export default function TeamPlayerStatsContent({ matches: rawMatches }: Props) {
  const matches = rawMatches.filter(m => m.firstPlayer && m.secondPlayer);
  const allStats = computeAllPlayerStats(matches);
  const players = Object.keys(allStats);

  const [selectedName, setSelectedName] = useState<string>(players[0] ?? '');
  const stats = allStats[selectedName];

  if (players.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
        まだ試合結果がありません
      </div>
    );
  }

  const noData = stats && stats.wins + stats.losses === 0;

  return (
    <div>
      {/* プレイヤー選択 */}
      <div style={{ ...glass, padding: '16px', marginBottom: '20px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(148,163,184,0.9)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          プレイヤーを選択
        </label>
        <select
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
          style={{
            width: '100%', maxWidth: '320px',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            padding: '10px 12px', fontSize: '1rem', color: '#f1f5f9',
            background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
          }}
        >
          {players.map(name => (
            <option key={name} value={name} style={{ background: '#1e293b', color: '#f1f5f9' }}>{name}</option>
          ))}
        </select>
      </div>

      {!stats || noData ? (
        <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
          まだ試合結果がありません
        </div>
      ) : (
        <>
          <SectionCard title="総合成績">
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
              <WinRateBadge wins={stats.wins} losses={stats.losses} winRate={stats.winRate} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', display: 'block', marginBottom: '3px' }}>先攻</span>
                <WinRateBadge
                  wins={stats.firstWins} losses={stats.firstLosses}
                  winRate={stats.firstWins + stats.firstLosses > 0 ? Math.round(stats.firstWins / (stats.firstWins + stats.firstLosses) * 1000) / 10 : 0}
                />
              </div>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', display: 'block', marginBottom: '3px' }}>後攻</span>
                <WinRateBadge
                  wins={stats.secondWins} losses={stats.secondLosses}
                  winRate={stats.secondWins + stats.secondLosses > 0 ? Math.round(stats.secondWins / (stats.secondWins + stats.secondLosses) * 1000) / 10 : 0}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="デッキ別勝率">
            {Object.keys(stats.deckStats).length === 0 ? (
              <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.875rem' }}>デッキ情報なし</p>
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '260px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ ...thStyle, textAlign: 'left', padding: '6px 8px' }}>デッキ</th>
                      <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#4ade80', width: '40px' }}>勝</th>
                      <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#f87171', width: '40px' }}>敗</th>
                      <th style={{ ...thStyle, textAlign: 'right', padding: '6px 8px', width: '64px' }}>勝率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.deckStats)
                      .sort((a, b) => b[1].winRate - a[1].winRate)
                      .map(([deck, r]) => (
                        <tr key={deck} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>{deck}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{r.wins}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{r.losses}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: r.winRate >= 60 ? '#4ade80' : r.winRate >= 40 ? '#fbbf24' : '#f87171' }}>
                              {r.winRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="対プレイヤー成績">
            {Object.keys(stats.vsStats).length === 0 ? (
              <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.875rem' }}>データなし</p>
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '240px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ ...thStyle, textAlign: 'left', padding: '6px 8px' }}>相手</th>
                      <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#4ade80', width: '40px' }}>勝</th>
                      <th style={{ ...thStyle, textAlign: 'center', padding: '6px 8px', color: '#f87171', width: '40px' }}>敗</th>
                      <th style={{ ...thStyle, textAlign: 'right', padding: '6px 8px', width: '64px' }}>勝率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(stats.vsStats)
                      .sort((a, b) => b.winRate - a.winRate)
                      .map(v => (
                        <tr key={v.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>{v.name}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{v.wins}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{v.losses}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: v.winRate >= 60 ? '#4ade80' : v.winRate >= 40 ? '#fbbf24' : '#f87171' }}>
                              {v.winRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
