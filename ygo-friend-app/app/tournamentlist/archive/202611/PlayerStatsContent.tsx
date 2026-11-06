'use client';

import { useState } from 'react';
import type { Season } from '@/app/tournament/types';
import { computePlayerStats } from '@/lib/tournament/stats';
import type { DeckMatchupEntry } from '@/lib/tournament/stats';

const RANK_MEDAL: Record<string, string> = { '1': '🥇', '2': '🥈', '3': '🥉' };

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

const rateColor = (r: number) => (r >= 60 ? '#4ade80' : r >= 40 ? '#fbbf24' : '#f87171');

function WinRateBadge({ wins, losses, winRate }: { wins: number; losses: number; winRate: number }) {
  const color = rateColor(winRate);
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

/** 先攻/後攻内訳の小テキスト */
function FirstSecondSub({ fw, fl, sw, sl }: { fw: number; fl: number; sw: number; sl: number }) {
  return (
    <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 400, marginTop: '2px' }}>
      先攻 {fw}-{fl}　後攻 {sw}-{sl}
    </div>
  );
}

/** デッキ対面相性アコーディオン1行 */
function MatchupAccordionItem({ entry }: { entry: DeckMatchupEntry }) {
  const [open, setOpen] = useState(false);
  const total = entry.totalWins + entry.totalLosses;

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          border: 'none', cursor: 'pointer', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <span style={{
          fontSize: '0.7rem', color: 'rgba(148,163,184,0.8)', flexShrink: 0,
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'none',
        }}>▶</span>
        <span style={{ fontWeight: 600, color: 'rgba(226,232,240,0.95)', fontSize: '0.9375rem', flex: 1 }}>
          {entry.myDeck}
        </span>
        <span style={{ fontSize: '0.8125rem', color: 'rgba(148,163,184,0.9)', flexShrink: 0 }}>
          {total}戦&nbsp;
          <span style={{ color: '#4ade80' }}>{entry.totalWins}勝</span>
          <span style={{ color: '#f87171' }}>{entry.totalLosses}敗</span>
          &nbsp;<span style={{ fontWeight: 700, color: rateColor(entry.winRate) }}>{entry.winRate}%</span>
        </span>
      </button>

      {open && (
        <div style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <tbody>
              {entry.vsDecks.map(vs => (
                <tr key={vs.opponentDeck} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '7px 14px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>
                    vs {vs.opponentDeck}
                  </td>
                  <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: rateColor(vs.winRate) }}>{vs.wins}勝{vs.losses}敗</span>
                    <span style={{ color: 'rgba(148,163,184,0.7)', marginLeft: '4px' }}>({vs.winRate}%)</span>
                  </td>
                  <td style={{ padding: '7px 14px 7px 4px', textAlign: 'right', color: 'rgba(148,163,184,0.8)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    先攻 {vs.firstWins}-{vs.firstLosses} | 後攻 {vs.secondWins}-{vs.secondLosses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ThemeRanking({ title, themes, color }: { title: string; themes: { deck: string; wins: number; losses: number; winRate: number }[]; color: string }) {
  return (
    <SectionCard title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[0, 1, 2].map(i => {
          const t = themes[i];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{RANK_MEDAL[String(i + 1)]}</span>
              {t ? (
                <>
                  <span style={{ flex: 1, fontWeight: 600, color: 'rgba(226,232,240,0.95)', fontSize: '0.9375rem', wordBreak: 'break-word' }}>{t.deck}</span>
                  <span style={{ fontWeight: 700, color, fontSize: '0.875rem', flexShrink: 0 }}>{t.winRate}%</span>
                  <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.75rem', flexShrink: 0 }}>({t.wins}-{t.losses})</span>
                </>
              ) : (
                <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '0.9375rem' }}>—</span>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

interface Props { season: Season }

export default function PlayerStatsContent({ season }: Props) {
  const [selectedId, setSelectedId] = useState<string>(season.players[0]?.id ?? '');

  const player = season.players.find(p => p.id === selectedId);
  const stats = player ? computePlayerStats(season, selectedId) : null;

  const vsEntries = stats
    ? Object.entries(stats.vsPlayerStats).filter(([, r]) => r.wins + r.losses > 0)
    : [];

  const noData = stats && stats.totalWins + stats.totalLosses === 0;

  return (
    <div>
      {/* プレイヤー選択 */}
      <div style={{ ...glass, padding: '16px', marginBottom: '20px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(148,163,184,0.9)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          プレイヤーを選択
        </label>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{
            width: '100%', maxWidth: '320px',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            padding: '10px 12px', fontSize: '1rem', color: '#f1f5f9',
            background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
          }}
        >
          {season.players.map(p => (
            <option key={p.id} value={p.id} style={{ background: '#1e293b', color: '#f1f5f9' }}>{p.name}</option>
          ))}
        </select>
      </div>

      {!stats || noData ? (
        <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
          {noData ? 'まだ試合結果がありません' : 'プレイヤーを選択してください'}
        </div>
      ) : (
        <>
          {/* 総合成績 */}
          <SectionCard title="総合成績">
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
              <WinRateBadge wins={stats.totalWins} losses={stats.totalLosses} winRate={stats.winRate} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', display: 'block', marginBottom: '3px' }}>先攻</span>
                <WinRateBadge
                  wins={stats.firstStats.wins} losses={stats.firstStats.losses}
                  winRate={stats.firstStats.total > 0 ? Math.round(stats.firstStats.wins / stats.firstStats.total * 1000) / 10 : 0}
                />
              </div>
              <div style={{ minWidth: '100px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', display: 'block', marginBottom: '3px' }}>後攻</span>
                <WinRateBadge
                  wins={stats.secondStats.wins} losses={stats.secondStats.losses}
                  winRate={stats.secondStats.total > 0 ? Math.round(stats.secondStats.wins / stats.secondStats.total * 1000) / 10 : 0}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', display: 'block', marginBottom: '3px' }}>最大連勝</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.125rem' }}>{stats.maxWinStreak}連勝</span>
              </div>
            </div>
          </SectionCard>

          {/* デッキ別勝率 */}
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
                          <td style={{ padding: '8px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>
                            {deck}
                            <FirstSecondSub fw={r.firstWins} fl={r.firstLosses} sw={r.secondWins} sl={r.secondLosses} />
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{r.wins}</td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{r.losses}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <span style={{ fontWeight: 700, color: rateColor(r.winRate) }}>{r.winRate}%</span>
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
                    {vsEntries.sort((a, b) => b[1].winRate - a[1].winRate).map(([id, r]) => (
                      <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px', color: 'rgba(226,232,240,0.9)', fontWeight: 500 }}>
                          {r.opponentName}
                          <FirstSecondSub fw={r.firstWins} fl={r.firstLosses} sw={r.secondWins} sl={r.secondLosses} />
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>{r.wins}</td>
                        <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 600 }}>{r.losses}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: rateColor(r.winRate) }}>{r.winRate}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <ThemeRanking title="有利テーマ TOP3（1勝以上）" themes={stats.advantageThemes} color="#4ade80" />
            <ThemeRanking title="不利テーマ TOP3（1敗以上）" themes={stats.disadvantageThemes} color="#f87171" />
          </div>
        </>
      )}
    </div>
  );
}
