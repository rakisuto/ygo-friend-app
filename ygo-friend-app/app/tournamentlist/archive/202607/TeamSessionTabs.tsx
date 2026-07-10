'use client';

import { useState } from 'react';
import type { Season, Match, TeamKey, DeckImageMap, DeckImageLibrary } from '@/app/tournament/types';
import DeckImageFrame from '@/app/tournament/components/DeckImageFrame';

function calcPoints(m: Match): number {
  if (!m.winnerId) return 0;
  return m.winnerId === m.secondPlayerId ? 2 : 1;
}

/** その試合でそのプレイヤーが獲得した勝ち点(結果なし/敗北は0)。 */
function pointsForPlayer(m: Match, playerId: string): number {
  if (m.winnerId !== playerId) return 0;
  return calcPoints(m);
}

function calcTeamPoints(season: Season): { A: number; B: number } {
  const teamOf = new Map(season.players.map(p => [p.id, p.team]));
  return season.sessions.flatMap(s => s.matches).reduce(
    (acc, m) => {
      if (!m.winnerId) return acc;
      const team = teamOf.get(m.winnerId);
      const pts = calcPoints(m);
      if (team === 'A') acc.A += pts;
      if (team === 'B') acc.B += pts;
      return acc;
    },
    { A: 0, B: 0 }
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

const teamConfig: Record<TeamKey, { gradient: string; accent: string }> = {
  A: { gradient: 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(29,78,216,0.3))', accent: '#60a5fa' },
  B: { gradient: 'linear-gradient(135deg, rgba(220,38,38,0.5), rgba(185,28,28,0.3))', accent: '#f87171' },
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

function PlayerCell({ name, iconPath, points }: { name?: string; iconPath?: string; points?: number }) {
  if (!name) return <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{ position: 'relative' }}>
        {iconPath && (
          <img src={iconPath} alt="" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0, display: 'block' }} />
        )}
        {points !== undefined && (
          <span style={{
            position: 'absolute', bottom: '-5px', right: '-6px',
            background: points > 0 ? '#16a34a' : 'rgba(100,116,139,0.9)',
            color: '#fff', borderRadius: '999px', fontSize: '0.5625rem', fontWeight: 700,
            padding: '0 4px', lineHeight: '1.3', border: '1px solid rgba(15,23,42,0.6)',
          }}>
            {points}
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: '0.625rem', color: 'rgba(226,232,240,0.85)',
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

export default function TeamSessionTabs({ season, deckImages, deckImageLibrary }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(100);
  const teamPoints = calcTeamPoints(season);
  const playerMap = Object.fromEntries(season.players.map(p => [p.id, p.teamPlayerName || p.name]));
  const playerIconMap = Object.fromEntries(season.players.map(p => [p.id, p.iconPath]));

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
      {/* チーム勝ち点サマリー */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['A', 'B'] as TeamKey[]).map(team => {
          const cfg = teamConfig[team];
          return (
            <div
              key={team}
              style={{
                flex: 1, minWidth: '140px', textAlign: 'center',
                padding: '18px 20px',
                background: cfg.gradient,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${cfg.accent}40`,
                borderRadius: '14px',
                boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 ${cfg.accent}20`,
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.accent, marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {season.teamNames?.[team] || `チーム${team}`} 合計勝ち点
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: `0 0 20px ${cfg.accent}` }}>
                {teamPoints[team]}<span style={{ fontSize: '1rem', marginLeft: '4px', fontWeight: 600, color: cfg.accent }}>点</span>
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
                      <th style={{ ...thStyle, width: '9%' }}>R</th>
                      <th style={{ ...thStyle, width: '13%' }}>先攻</th>
                      <th style={{ ...thStyle, width: '26%' }}>先攻デッキ</th>
                      <th style={{ ...thStyle, width: '13%' }}>後攻</th>
                      <th style={{ ...thStyle, width: '26%' }}>後攻デッキ</th>
                      <th style={{ ...thStyle, width: '13%' }}>勝者</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, idx) => {
                      const pts = calcPoints(match);
                      const winnerTeam = match.winnerId === match.firstPlayerId
                        ? season.players.find(p => p.id === match.firstPlayerId)?.team
                        : match.winnerId === match.secondPlayerId
                        ? season.players.find(p => p.id === match.secondPlayerId)?.team
                        : null;
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
                              points={pointsForPlayer(match, match.firstPlayerId)}
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
                              points={pointsForPlayer(match, match.secondPlayerId)}
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
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <PlayerCell name={playerMap[match.winnerId]} iconPath={playerIconMap[match.winnerId]} />
                                <span style={{
                                  display: 'inline-block',
                                  background: winnerTeam === 'A' ? 'rgba(37,99,235,0.35)' : 'rgba(220,38,38,0.35)',
                                  color: winnerTeam === 'A' ? '#93c5fd' : '#fca5a5',
                                  border: `1px solid ${winnerTeam === 'A' ? '#3b82f6' : '#ef4444'}50`,
                                  borderRadius: '999px',
                                  padding: '0 8px',
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                }}>
                                  {pts}点
                                </span>
                              </div>
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

      {/* 勝ち点説明 */}
      <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: '8px', fontSize: '0.8125rem', color: 'rgba(148,163,184,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <strong style={{ color: 'rgba(203,213,225,0.9)' }}>勝ち点ルール:</strong> 後攻プレイヤーが勝利 → 2点 ／ 先攻プレイヤーが勝利 → 1点
      </div>
    </div>
  );
}
