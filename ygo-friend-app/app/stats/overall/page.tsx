import { kv } from '@/lib/kv';
import type { Season } from '@/app/tournament/types';
import { computeStandings, computeDeckUsage, computeDeckWinStats } from '@/lib/tournament/stats';
import DeckPieChart from './DeckPieChart';

export const revalidate = 0;

const RANK_BADGE: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#fef9c3', color: '#92400e', label: '🥇' },
  2: { bg: '#f1f5f9', color: '#475569', label: '🥈' },
  3: { bg: '#fff7ed', color: '#9a3412', label: '🥉' },
};

export default async function OverallStatsPage() {
  let season: Season | null = null;
  try {
    season = await kv.get<Season>('tournament:season');
  } catch {
    // KV error
  }

  const standings = season ? computeStandings(season) : [];
  const deckUsage = season ? computeDeckUsage(season) : [];
  const deckWinStats = season ? computeDeckWinStats(season) : [];

  return (
    <main className="page-main" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          総合成績
        </h1>
        {season && (
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {season.name} — 参加プレイヤー: {season.players.map(p => p.name).join('・')}
          </p>
        )}
      </div>

      {/* 大会概要 */}
      {season?.description && (
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

      {!season ? (
        <p style={{ color: '#94a3b8' }}>スケジュールはまだ生成されていません。</p>
      ) : (
        <>
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
            {/* overflow:hidden + border-radius のクリッピング防止スペーサー */}
            <div style={{ height: '1px' }} />
          </div>

          {/* デッキ使用率 */}
          <div
            style={{
              background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '16px',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>🃏 デッキ使用率</h2>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '14px' }}>
              全試合における各デッキの使用回数・TOP3のカード画像はYGOProDeckより取得
            </p>
            <DeckPieChart data={deckUsage} winStats={deckWinStats} />
          </div>
        </>
      )}
    </main>
  );
}
