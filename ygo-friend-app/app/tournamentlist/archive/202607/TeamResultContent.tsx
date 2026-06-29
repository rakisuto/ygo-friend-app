'use client';

import type { TeamMatch } from './types';

function calcPoints(match: TeamMatch): number {
  if (!match.winnerTeam) return 0;
  if (match.winnerTeam === match.secondPlayerTeam) return 2;
  return 1;
}

function calcTeamPoints(matches: TeamMatch[]): { A: number; B: number } {
  return matches.reduce(
    (acc, match) => {
      const pts = calcPoints(match);
      if (match.winnerTeam === 'A') acc.A += pts;
      if (match.winnerTeam === 'B') acc.B += pts;
      return acc;
    },
    { A: 0, B: 0 }
  );
}

const ROUNDS = [1, 2, 3, 4] as const;
const GAMES = ['A1vsB1', 'A2vsB2'] as const;

function buildEmptyMatches(): TeamMatch[] {
  const matches: TeamMatch[] = [];
  for (const round of ROUNDS) {
    for (const game of GAMES) {
      matches.push({
        date: '',
        round,
        game,
        firstPlayer: '',
        firstPlayerTeam: game === 'A1vsB1' ? 'A' : 'A',
        firstPlayerDeck: '',
        secondPlayer: '',
        secondPlayerTeam: 'B',
        secondPlayerDeck: '',
        winner: '',
        winnerTeam: null,
      });
    }
  }
  return matches;
}

interface Props {
  matches: TeamMatch[];
}

const glass: React.CSSProperties = {
  background: 'rgba(10, 15, 35, 0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export default function TeamResultContent({ matches }: Props) {
  const displayMatches = matches.length > 0 ? matches : buildEmptyMatches();
  const teamPoints = calcTeamPoints(displayMatches);

  const thStyle: React.CSSProperties = {
    padding: '12px 12px',
    textAlign: 'left',
    color: 'rgba(148,163,184,0.9)',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 12px',
    color: 'rgba(226,232,240,0.95)',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  };

  const teamConfig = {
    A: { gradient: 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(29,78,216,0.3))', accent: '#60a5fa', label: 'チームA' },
    B: { gradient: 'linear-gradient(135deg, rgba(220,38,38,0.5), rgba(185,28,28,0.3))', accent: '#f87171', label: 'チームB' },
  };

  return (
    <div>
      {/* チーム勝ち点サマリー */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['A', 'B'] as const).map(team => {
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
                {cfg.label} 合計勝ち点
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textShadow: `0 0 20px ${cfg.accent}` }}>
                {teamPoints[team]}<span style={{ fontSize: '1rem', marginLeft: '4px', fontWeight: 600, color: cfg.accent }}>点</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 試合結果テーブル */}
      <div style={{ ...glass, overflow: 'hidden', marginBottom: '12px' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🏟️</span>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '0.02em' }}>
            試合結果
          </h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }} className="gothic">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                <th style={thStyle}>日付</th>
                <th style={thStyle}>ラウンド</th>
                <th style={thStyle}>試合</th>
                <th style={thStyle}>先攻</th>
                <th style={thStyle}>先攻デッキ</th>
                <th style={thStyle}>後攻</th>
                <th style={thStyle}>後攻デッキ</th>
                <th style={thStyle}>勝者</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>勝ち点</th>
              </tr>
            </thead>
            <tbody>
              {displayMatches.map((match, i) => {
                const pts = calcPoints(match);
                const isRoundStart = i === 0 || displayMatches[i - 1].round !== match.round;
                return (
                  <tr
                    key={i}
                    style={{
                      borderTop: isRoundStart && i !== 0
                        ? '1px solid rgba(255,255,255,0.15)'
                        : '1px solid rgba(255,255,255,0.05)',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <td style={tdStyle}>{match.date || <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#94a3b8' }}>
                      第{match.round}R
                    </td>
                    <td style={{ ...tdStyle, color: 'rgba(148,163,184,0.8)' }}>{match.game}</td>
                    <td style={tdStyle}>{match.firstPlayer || <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>}</td>
                    <td style={{ ...tdStyle, color: 'rgba(148,163,184,0.8)' }}>{match.firstPlayerDeck || <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>}</td>
                    <td style={tdStyle}>{match.secondPlayer || <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>}</td>
                    <td style={{ ...tdStyle, color: 'rgba(148,163,184,0.8)' }}>{match.secondPlayerDeck || <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>}</td>
                    <td style={{ ...tdStyle, fontWeight: match.winner ? 700 : 400 }}>
                      {match.winner ? (
                        <span style={{ color: match.winnerTeam === 'A' ? '#60a5fa' : '#f87171' }}>
                          {match.winner}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(148,163,184,0.4)' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                      {match.winnerTeam ? (
                        <span style={{
                          display: 'inline-block',
                          background: match.winnerTeam === 'A' ? 'rgba(37,99,235,0.35)' : 'rgba(220,38,38,0.35)',
                          color: match.winnerTeam === 'A' ? '#93c5fd' : '#fca5a5',
                          border: `1px solid ${match.winnerTeam === 'A' ? '#3b82f6' : '#ef4444'}50`,
                          borderRadius: '6px',
                          padding: '2px 12px',
                          fontSize: '0.875rem',
                        }}>
                          {pts}点
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

      {/* 勝ち点説明 */}
      <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', borderRadius: '8px', fontSize: '0.8125rem', color: 'rgba(148,163,184,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <strong style={{ color: 'rgba(203,213,225,0.9)' }}>勝ち点ルール:</strong> 後攻プレイヤーが勝利 → 2点 ／ 先攻プレイヤーが勝利 → 1点
      </div>
    </div>
  );
}
