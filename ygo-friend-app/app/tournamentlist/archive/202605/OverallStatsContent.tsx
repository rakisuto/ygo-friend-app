'use client';

import type { Season } from '@/app/tournament/types';
import { computeStandings, computeDeckUsage, computeDeckWinStats, computePlayerDeckUsage } from '@/lib/tournament/stats';
import DeckPieChart from '@/app/stats/overall/DeckPieChart';
import PlayerDeckBarChart from '@/app/stats/overall/PlayerDeckBarChart';

const RANK_BADGE: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#fef9c3', color: '#92400e', label: '🥇' },
  2: { bg: '#f1f5f9', color: '#475569', label: '🥈' },
  3: { bg: '#fff7ed', color: '#9a3412', label: '🥉' },
  4: { bg: '#fef2f2', color: '#991b1b', label: '💀' },
};

interface Props { season: Season }

export default function OverallStatsContent({ season }: Props) {
  const standings = computeStandings(season);
  const deckUsage = computeDeckUsage(season);
  const deckWinStats = computeDeckWinStats(season);
  const playerDeckUsages = computePlayerDeckUsage(season);
  const deckOrder = deckUsage.map(d => d.name);

  return (
    <>
      {/* 大会概要 */}
      {season.description && (
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px 20px',
          marginBottom: '24px',
        }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px',
          }}>
            📝 大会概要
          </p>
          <p style={{
            fontSize: '0.9375rem', lineHeight: '1.8', color: '#374151',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
          }}>
            {season.description}
          </p>
        </div>
      )}

      {/* 順位表 */}
      <div
        style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '24px',
          overflow: 'hidden',
        }}
      >
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
                  <tr
                    key={row.playerId}
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      background: row.rank === 1 ? '#fffbeb' : i % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {badge ? (
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: badge.bg, color: badge.color, fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        >
                          {badge.label}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>{row.rank}位</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', fontWeight: row.rank === 1 ? 700 : 500, color: '#1e293b', fontSize: '1rem' }}>
                      {row.playerName}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#16a34a', fontSize: '1.125rem' }}>
                      {row.wins}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700, color: '#dc2626', fontSize: '1.125rem' }}>
                      {row.losses}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: row.winRate >= 60 ? '#16a34a' : row.winRate >= 40 ? '#d97706' : '#dc2626',
                        }}
                      >
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
      <div
        style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>🃏 デッキ使用率</h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '14px' }}>
          全試合における各デッキの使用回数（先攻・後攻それぞれカウント）
        </p>
        <DeckPieChart data={deckUsage} winStats={deckWinStats} />
      </div>

      {/* プレイヤー別デッキ使用回数 */}
      {playerDeckUsages.some(p => Object.keys(p.decks).length > 0) && (
        <div
          style={{
            background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>📊 プレイヤー別デッキ使用回数</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '14px' }}>
            各プレイヤーが使用したデッキの内訳
          </p>
          <PlayerDeckBarChart playerUsages={playerDeckUsages} deckOrder={deckOrder} />
        </div>
      )}
    </>
  );
}
