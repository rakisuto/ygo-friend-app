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
  const color = winRate >= 60 ? '#16a34a' : winRate >= 40 ? '#d97706' : '#dc2626';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ color: '#475569' }}>{wins}勝{losses}敗</span>
      <span style={{
        fontWeight: 700, fontSize: '0.875rem', color,
        background: winRate >= 60 ? '#dcfce7' : winRate >= 40 ? '#fef9c3' : '#fee2e2',
        borderRadius: '999px', padding: '1px 10px',
      }}>
        {wins + losses === 0 ? '—' : `${winRate}%`}
      </span>
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
      padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px',
    }}>
      <h3 style={{
        fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
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
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
        まだ試合結果がありません
      </div>
    );
  }

  const noData = stats && stats.wins + stats.losses === 0;

  return (
    <div>
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px',
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>
          プレイヤーを選択
        </label>
        <select
          value={selectedName}
          onChange={e => setSelectedName(e.target.value)}
          style={{
            width: '100%', maxWidth: '320px',
            border: '1px solid #d1d5db', borderRadius: '8px',
            padding: '10px 12px', fontSize: '1rem', color: '#1e293b',
            background: '#f8fafc', cursor: 'pointer',
          }}
        >
          {players.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {!stats || noData ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
          まだ試合結果がありません
        </div>
      ) : (
        <>
          <SectionCard title="総合成績">
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              <WinRateBadge wins={stats.wins} losses={stats.losses} winRate={stats.winRate} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>先攻</span>
                <WinRateBadge
                  wins={stats.firstWins} losses={stats.firstLosses}
                  winRate={stats.firstWins + stats.firstLosses > 0 ? Math.round(stats.firstWins / (stats.firstWins + stats.firstLosses) * 1000) / 10 : 0}
                />
              </div>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>後攻</span>
                <WinRateBadge
                  wins={stats.secondWins} losses={stats.secondLosses}
                  winRate={stats.secondWins + stats.secondLosses > 0 ? Math.round(stats.secondWins / (stats.secondWins + stats.secondLosses) * 1000) / 10 : 0}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="デッキ別勝率">
            {Object.keys(stats.deckStats).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>デッキ情報なし</p>
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '260px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>デッキ</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '40px' }}>勝</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '40px' }}>敗</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '64px' }}>勝率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.deckStats)
                      .sort((a, b) => b[1].winRate - a[1].winRate)
                      .map(([deck, r]) => (
                        <tr key={deck} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>{deck}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{r.wins}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{r.losses}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: r.winRate >= 60 ? '#16a34a' : r.winRate >= 40 ? '#d97706' : '#dc2626' }}>
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
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>データなし</p>
            ) : (
              <div className="table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '240px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>相手</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '40px' }}>勝</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '40px' }}>敗</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600, width: '64px' }}>勝率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(stats.vsStats)
                      .sort((a, b) => b.winRate - a.winRate)
                      .map(v => (
                        <tr key={v.name} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>{v.name}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#16a34a', fontWeight: 600 }}>{v.wins}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{v.losses}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: v.winRate >= 60 ? '#16a34a' : v.winRate >= 40 ? '#d97706' : '#dc2626' }}>
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
