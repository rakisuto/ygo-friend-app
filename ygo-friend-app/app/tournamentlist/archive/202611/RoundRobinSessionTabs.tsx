'use client';

import { useState } from 'react';
import type { Season, DeckImageMap, DeckImageLibrary } from '@/app/tournament/types';
import DeckImageFrame from '@/app/tournament/components/DeckImageFrame';
import { computeStandings } from '@/lib/tournament/stats';

const glass: React.CSSProperties = {
  background: 'rgba(10, 15, 35, 0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

/** プレイヤーごとの差し色（先攻回数バッジ・勝敗サマリー共通） */
const PLAYER_ACCENTS = ['#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#c084fc', '#22d3ee'];

/** 先攻回数ごとのバッジ色 */
const FIRST_COUNT_BADGE: Record<number, { bg: string; color: string; border: string }> = {
  0: { bg: 'rgba(239,68,68,0.22)', color: '#fca5a5', border: 'rgba(239,68,68,0.5)' },
  1: { bg: 'rgba(249,115,22,0.22)', color: '#fdba74', border: 'rgba(249,115,22,0.5)' },
  2: { bg: 'rgba(59,130,246,0.22)', color: '#93c5fd', border: 'rgba(59,130,246,0.5)' },
  3: { bg: 'rgba(34,197,94,0.22)', color: '#86efac', border: 'rgba(34,197,94,0.5)' },
};

const thStyle: React.CSSProperties = {
  padding: '6px 4px',
  textAlign: 'center',
  color: 'rgba(148,163,184,0.9)',
  fontWeight: 700,
  fontSize: '0.625rem',
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  overflow: 'hidden',
};
const tdStyle: React.CSSProperties = {
  padding: '6px 4px',
  color: 'rgba(226,232,240,0.95)',
  fontSize: '0.8125rem',
  textAlign: 'center',
  overflow: 'hidden',
};

function PlayerCell({ name, iconPath, won }: { name?: string; iconPath?: string; won?: boolean }) {
  if (!name) return <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      {iconPath && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconPath} alt="" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, display: 'block' }} />
      )}
      {won && <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>🏆</span>}
      <span
        style={{
          fontSize: '0.625rem', color: won ? '#fde68a' : 'rgba(226,232,240,0.85)',
          fontWeight: won ? 700 : 400,
          maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word',
          lineHeight: 1.2, textAlign: 'center',
        }}
      >
        {name}
      </span>
    </div>
  );
}

interface Props { season: Season; deckImages?: DeckImageMap; deckImageLibrary?: DeckImageLibrary }

export default function RoundRobinSessionTabs({ season, deckImages, deckImageLibrary }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(100);

  const playerMap = Object.fromEntries(season.players.map(p => [p.id, p.name]));
  const playerIconMap = Object.fromEntries(season.players.map(p => [p.id, p.iconPath]));
  const accentOf = (playerId: string) => {
    const idx = season.players.findIndex(p => p.id === playerId);
    return PLAYER_ACCENTS[idx % PLAYER_ACCENTS.length];
  };
  const standings = computeStandings(season);
  const recordOf = Object.fromEntries(standings.map(s => [s.playerId, s]));

  const resolveLayers = (deckName: string | null) => {
    if (!deckName) return undefined;
    const presetId = deckImages?.[deckName.trim()];
    if (!presetId) return undefined;
    return deckImageLibrary?.find(p => p.id === presetId)?.layers;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未定';
    const [y, m, d] = dateStr.split('-');
    return `${y}/${parseInt(m)}/${parseInt(d)}`;
  };

  if (season.sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
        まだ試合結果がありません
      </div>
    );
  }

  return (
    <div>
      {/* プレイヤー別 勝敗サマリー */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {season.players.map(p => {
          const accent = accentOf(p.id);
          const rec = recordOf[p.id];
          return (
            <div
              key={p.id}
              style={{
                textAlign: 'center',
                padding: '14px 12px',
                background: 'rgba(10, 15, 35, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${accent}40`,
                borderRadius: '14px',
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${accent}20`,
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: accent, marginBottom: '6px', wordBreak: 'break-word' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', textShadow: `0 0 18px ${accent}` }}>
                {rec?.wins ?? 0}<span style={{ fontSize: '0.8125rem', margin: '0 6px 0 2px', fontWeight: 600, color: accent }}>勝</span>
                {rec?.losses ?? 0}<span style={{ fontSize: '0.8125rem', marginLeft: '2px', fontWeight: 600, color: 'rgba(148,163,184,0.9)' }}>敗</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 日付タブ */}
      <div
        className="tab-scroll"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: '10px',
          marginBottom: '20px',
          padding: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', width: 'max-content', minWidth: '100%' }}>
          {season.sessions.map((session, i) => (
            <button
              key={session.id}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 16px',
                background: activeTab === i ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === i ? '2px solid #93c5fd' : '2px solid transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                flexShrink: 0,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: activeTab === i ? '#fff' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                {session.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: activeTab === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {formatDate(session.date)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 試合結果テーブル（選択中の日付のみ） */}
      {season.sessions.map((session, i) => {
        const matches = [...session.matches].sort((a, b) => a.matchNumber - b.matchNumber);
        return (
          <div key={session.id} style={{ display: activeTab === i ? 'block' : 'none' }}>
            {/* 先攻回数バッジ（事前割り当てがあるシーズンのみ表示） */}
            {session.firstPlayerCounts && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', flexShrink: 0, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>先攻回数:</span>
                {season.players.map(p => {
                  const count = session.firstPlayerCounts![p.id];
                  const c = FIRST_COUNT_BADGE[count] ?? { bg: 'rgba(148,163,184,0.2)', color: '#cbd5e1', border: 'rgba(148,163,184,0.4)' };
                  return (
                    <span
                      key={p.id}
                      className="gothic"
                      style={{
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '999px',
                        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                        backdropFilter: 'blur(6px)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.name}：先攻{count}回
                    </span>
                  );
                })}
              </div>
            )}

            <div style={{ ...glass, overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🏟️</span>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '0.02em' }}>
                    試合結果
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(148,163,184,0.7)' }}>表示サイズ</span>
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.max(50, z - 10))}
                    style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1 }}
                  >
                    －
                  </button>
                  <span style={{ fontSize: '0.6875rem', color: '#e2e8f0', minWidth: '32px', textAlign: 'center' }}>{zoom}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.min(150, z + 10))}
                    style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1 }}
                  >
                    ＋
                  </button>
                </div>
              </div>
              <div className="table-scroll" style={{ zoom: `${zoom}%` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }} className="gothic">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <th style={{ ...thStyle, width: '8%' }}>R</th>
                      <th style={{ ...thStyle, width: '15%' }}>先攻</th>
                      <th style={{ ...thStyle, width: '23%' }}>先攻デッキ</th>
                      <th style={{ ...thStyle, width: '15%' }}>後攻</th>
                      <th style={{ ...thStyle, width: '23%' }}>後攻デッキ</th>
                      <th style={{ ...thStyle, width: '16%' }}>勝者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, idx) => {
                      const firstWon = match.winnerId === match.firstPlayerId;
                      const secondWon = match.winnerId === match.secondPlayerId;
                      return (
                        <tr
                          key={match.matchNumber}
                          style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#94a3b8' }}>R{match.matchNumber}</td>
                          <td style={tdStyle}>
                            <PlayerCell
                              name={playerMap[match.firstPlayerId]}
                              iconPath={playerIconMap[match.firstPlayerId]}
                              won={firstWon}
                            />
                          </td>
                          <td style={{ ...tdStyle, padding: '4px 3px' }}>
                            <DeckImageFrame
                              deckName={match.firstPlayerDeck}
                              mapping={resolveLayers(match.firstPlayerDeck)}
                              width="100%" height={56}
                              fallbackDark
                            />
                          </td>
                          <td style={tdStyle}>
                            <PlayerCell
                              name={playerMap[match.secondPlayerId]}
                              iconPath={playerIconMap[match.secondPlayerId]}
                              won={secondWon}
                            />
                          </td>
                          <td style={{ ...tdStyle, padding: '4px 3px' }}>
                            <DeckImageFrame
                              deckName={match.secondPlayerDeck}
                              mapping={resolveLayers(match.secondPlayerDeck)}
                              width="100%" height={56}
                              fallbackDark
                            />
                          </td>
                          <td style={tdStyle}>
                            {match.winnerId ? (
                              <span
                                style={{
                                  display: 'inline-block',
                                  background: `${accentOf(match.winnerId)}30`,
                                  color: accentOf(match.winnerId),
                                  border: `1px solid ${accentOf(match.winnerId)}60`,
                                  borderRadius: '999px',
                                  padding: '1px 5px',
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  maxWidth: '100%',
                                  whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.3,
                                }}
                              >
                                {playerMap[match.winnerId]}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
