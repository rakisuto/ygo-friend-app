'use client';

import { useState } from 'react';
import type { Season } from '@/app/tournament/types';
import { computePlayerStats } from '@/lib/tournament/stats';

interface Props { season: Season }

const RANK_MEDAL: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' };

function WinRateBadge({ wins, losses, winRate }: { wins: number; losses: number; winRate: number }) {
  const color = winRate >= 60 ? '#16a34a' : winRate >= 40 ? '#d97706' : '#dc2626';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
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
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function PlayerStatsClient({ season }: Props) {
  const [selectedId, setSelectedId] = useState<string>(season.players[0]?.id ?? '');

  const player = season.players.find(p => p.id === selectedId);
  const stats = player ? computePlayerStats(season, selectedId) : null;

  // 有利 / 不利プレイヤー
  const vsEntries = stats
    ? Object.entries(stats.vsPlayerStats).filter(([, r]) => r.wins + r.losses > 0)
    : [];
  const maxVsWinRate = vsEntries.length > 0 ? Math.max(...vsEntries.map(([, r]) => r.winRate)) : -1;
  const minVsWinRate = vsEntries.length > 0 ? Math.min(...vsEntries.map(([, r]) => r.winRate)) : 101;
  const advantagePlayers = vsEntries.filter(([, r]) => r.winRate === maxVsWinRate);
  const disadvantagePlayers = vsEntries.filter(([, r]) => r.winRate === minVsWinRate);

  const noData = stats && stats.totalWins + stats.totalLosses === 0;

  return (
    <div>
      {/* Player selector */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>
          プレイヤーを選択
        </label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{
            width: '100%', maxWidth: '320px',
            border: '1px solid #d1d5db', borderRadius: '8px',
            padding: '10px 14px', fontSize: '1rem', color: '#1e293b',
            background: '#f8fafc', cursor: 'pointer',
          }}
        >
          {season.players.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {!stats || noData ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
          {noData ? 'まだ試合結果がありません' : 'プレイヤーを選択してください'}
        </div>
      ) : (
        <>
          {/* 総合成績 */}
          <SectionCard title="総合成績">
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
              <WinRateBadge wins={stats.totalWins} losses={stats.totalLosses} winRate={stats.winRate} />
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>先攻</span>
                <WinRateBadge
                  wins={stats.firstStats.wins} losses={stats.firstStats.losses}
                  winRate={stats.firstStats.total > 0 ? Math.round(stats.firstStats.wins / stats.firstStats.total * 1000) / 10 : 0}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>後攻</span>
                <WinRateBadge
                  wins={stats.secondStats.wins} losses={stats.secondStats.losses}
                  winRate={stats.secondStats.total > 0 ? Math.round(stats.secondStats.wins / stats.secondStats.total * 1000) / 10 : 0}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>最大連勝</span>
                <span style={{ fontWeight: 700, color: '#d97706', fontSize: '1.125rem' }}>{stats.maxWinStreak}連勝</span>
              </div>
            </div>
          </SectionCard>

          {/* デッキ別勝率 */}
          <SectionCard title="デッキ別勝率">
            {Object.keys(stats.deckStats).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>デッキ情報なし</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>デッキ</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>勝</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>敗</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>勝率</th>
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
            )}
          </SectionCard>

          {/* 対プレイヤー成績 */}
          <SectionCard title="対プレイヤー成績">
            {vsEntries.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>データなし</p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>相手</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>勝</th>
                      <th style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>敗</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: '#64748b', fontWeight: 600 }}>勝率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vsEntries.sort((a, b) => b[1].winRate - a[1].winRate).map(([id, r]) => (
                      <tr key={id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>{r.opponentName}</td>
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
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '180px', background: '#f0fdf4', borderRadius: '8px', padding: '12px 16px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '6px' }}>😊 有利プレイヤー</div>
                    {advantagePlayers.map(([, r]) => (
                      <div key={r.opponentName} style={{ fontWeight: 700, color: '#166534' }}>{r.opponentName} ({r.winRate}%)</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: '180px', background: '#fff1f2', borderRadius: '8px', padding: '12px 16px', border: '1px solid #fecdd3' }}>
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginBottom: '6px' }}>😰 不利プレイヤー</div>
                    {disadvantagePlayers.map(([, r]) => (
                      <div key={r.opponentName} style={{ fontWeight: 700, color: '#991b1b' }}>{r.opponentName} ({r.winRate}%)</div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </SectionCard>

          {/* 有利 / 不利テーマ */}
          {(stats.advantageThemes.length > 0 || stats.disadvantageThemes.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <SectionCard title="有利テーマ TOP3">
                {stats.advantageThemes.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>データなし</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.advantageThemes.map((t, i) => (
                      <div key={t.deck} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{RANK_MEDAL[String(i + 1)] ?? `${i + 1}.`}</span>
                        <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem' }}>{t.deck}</span>
                        <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.875rem' }}>{t.winRate}%</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({t.wins}-{t.losses})</span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
              <SectionCard title="不利テーマ TOP3">
                {stats.disadvantageThemes.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>データなし</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {stats.disadvantageThemes.map((t, i) => (
                      <div key={t.deck} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{RANK_MEDAL[String(i + 1)] ?? `${i + 1}.`}</span>
                        <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem' }}>{t.deck}</span>
                        <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.875rem' }}>{t.winRate}%</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({t.wins}-{t.losses})</span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
