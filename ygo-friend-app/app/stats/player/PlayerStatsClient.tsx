'use client';

import { useState } from 'react';
import type { Season } from '@/app/tournament/types';
import { computePlayerStats } from '@/lib/tournament/stats';
import type { DeckMatchupEntry } from '@/lib/tournament/stats';

interface Props { season: Season }

const RANK_MEDAL: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' };

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

/** 先攻/後攻内訳の小テキスト */
function FirstSecondSub({ fw, fl, sw, sl }: { fw: number; fl: number; sw: number; sl: number }) {
  return (
    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400, marginTop: '2px' }}>
      先攻 {fw}-{fl}　後攻 {sw}-{sl}
    </div>
  );
}

/** デッキ対面相性アコーディオン1行 */
function MatchupAccordionItem({ entry }: { entry: DeckMatchupEntry }) {
  const [open, setOpen] = useState(false);
  const total = entry.totalWins + entry.totalLosses;
  const color = entry.winRate >= 60 ? '#16a34a' : entry.winRate >= 40 ? '#d97706' : '#dc2626';

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', background: open ? '#f8fafc' : '#fff',
          border: 'none', cursor: 'pointer', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <span style={{
          fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0,
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'none',
        }}>▶</span>
        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem', flex: 1 }}>
          {entry.myDeck}
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#64748b', flexShrink: 0 }}>
          {total}戦&nbsp;
          <span style={{ color: '#16a34a' }}>{entry.totalWins}勝</span>
          <span style={{ color: '#dc2626' }}>{entry.totalLosses}敗</span>
          &nbsp;<span style={{ fontWeight: 700, color }}>{entry.winRate}%</span>
        </span>
      </button>

      {open && (
        <div style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <tbody>
              {entry.vsDecks.map(vs => {
                const vsColor = vs.winRate >= 60 ? '#16a34a' : vs.winRate >= 40 ? '#d97706' : '#dc2626';
                return (
                  <tr key={vs.opponentDeck} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 14px', color: '#374151', fontWeight: 500 }}>
                      vs {vs.opponentDeck}
                    </td>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 700, color: vsColor }}>{vs.wins}勝{vs.losses}敗</span>
                      <span style={{ color: '#94a3b8', marginLeft: '4px' }}>({vs.winRate}%)</span>
                    </td>
                    <td style={{ padding: '7px 14px 7px 4px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      先攻 {vs.firstWins}-{vs.firstLosses} | 後攻 {vs.secondWins}-{vs.secondLosses}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PlayerStatsClient({ season }: Props) {
  const [selectedId, setSelectedId] = useState<string>(season.players[0]?.id ?? '');

  const player = season.players.find(p => p.id === selectedId);
  const stats = player ? computePlayerStats(season, selectedId) : null;

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
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px',
      }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>
          プレイヤーを選択
        </label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{
            width: '100%', maxWidth: '320px',
            border: '1px solid #d1d5db', borderRadius: '8px',
            padding: '10px 12px', fontSize: '1rem', color: '#1e293b',
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
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              <WinRateBadge wins={stats.totalWins} losses={stats.totalLosses} winRate={stats.winRate} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>先攻</span>
                <WinRateBadge
                  wins={stats.firstStats.wins} losses={stats.firstStats.losses}
                  winRate={stats.firstStats.total > 0 ? Math.round(stats.firstStats.wins / stats.firstStats.total * 1000) / 10 : 0}
                />
              </div>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>後攻</span>
                <WinRateBadge
                  wins={stats.secondStats.wins} losses={stats.secondStats.losses}
                  winRate={stats.secondStats.total > 0 ? Math.round(stats.secondStats.wins / stats.secondStats.total * 1000) / 10 : 0}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>最大連勝</span>
                <span style={{ fontWeight: 700, color: '#d97706', fontSize: '1.125rem' }}>{stats.maxWinStreak}連勝</span>
              </div>
            </div>
          </SectionCard>

          {/* デッキ別勝率 */}
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
                          <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>
                            {deck}
                            <FirstSecondSub fw={r.firstWins} fl={r.firstLosses} sw={r.secondWins} sl={r.secondLosses} />
                          </td>
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

          {/* 対プレイヤー成績 */}
          <SectionCard title="対プレイヤー成績">
            {vsEntries.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>データなし</p>
            ) : (
              <>
                <div className="table-scroll" style={{ marginBottom: '14px' }}>
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
                      {vsEntries.sort((a, b) => b[1].winRate - a[1].winRate).map(([id, r]) => (
                        <tr key={id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', color: '#1e293b', fontWeight: 500 }}>
                            {r.opponentName}
                            <FirstSecondSub fw={r.firstWins} fl={r.firstLosses} sw={r.secondWins} sl={r.secondLosses} />
                          </td>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '12px 14px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginBottom: '6px' }}>😊 有利プレイヤー</div>
                    {advantagePlayers.map(([, r]) => (
                      <div key={r.opponentName} style={{ fontWeight: 700, color: '#166534', fontSize: '0.9375rem' }}>
                        {r.opponentName} <span style={{ color: '#16a34a' }}>({r.winRate}%)</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#fff1f2', borderRadius: '8px', padding: '12px 14px', border: '1px solid #fecdd3' }}>
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginBottom: '6px' }}>😰 不利プレイヤー</div>
                    {disadvantagePlayers.map(([, r]) => (
                      <div key={r.opponentName} style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.9375rem' }}>
                        {r.opponentName} <span style={{ color: '#dc2626' }}>({r.winRate}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </SectionCard>

          {/* デッキ対面相性（アコーディオン） */}
          {stats.deckMatchups.length > 0 && (
            <SectionCard title="デッキ対面相性">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stats.deckMatchups.map(entry => (
                  <MatchupAccordionItem key={entry.myDeck} entry={entry} />
                ))}
              </div>
            </SectionCard>
          )}

          {/* 有利 / 不利テーマ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <SectionCard title="有利テーマ TOP3（1勝以上）">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[0, 1, 2].map(i => {
                  const t = stats.advantageThemes[i];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{RANK_MEDAL[String(i + 1)]}</span>
                      {t ? (
                        <>
                          <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem', wordBreak: 'break-word' }}>{t.deck}</span>
                          <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.875rem', flexShrink: 0 }}>{t.winRate}%</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>({t.wins}-{t.losses})</span>
                        </>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard title="不利テーマ TOP3（1敗以上）">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[0, 1, 2].map(i => {
                  const t = stats.disadvantageThemes[i];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{RANK_MEDAL[String(i + 1)]}</span>
                      {t ? (
                        <>
                          <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem', wordBreak: 'break-word' }}>{t.deck}</span>
                          <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.875rem', flexShrink: 0 }}>{t.winRate}%</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>({t.wins}-{t.losses})</span>
                        </>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
