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

export default function TeamResultContent({ matches }: Props) {
  const displayMatches = matches.length > 0 ? matches : buildEmptyMatches();
  const teamPoints = calcTeamPoints(displayMatches);

  const thStyle: React.CSSProperties = {
    padding: '10px 10px',
    textAlign: 'left',
    color: '#64748b',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontSize: '0.8125rem',
  };
  const tdStyle: React.CSSProperties = {
    padding: '10px 10px',
    color: '#1e293b',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
  };

  return (
    <div>
      {/* チーム勝ち点サマリー */}
      <div
        style={{
          display: 'flex', gap: '12px', marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {(['A', 'B'] as const).map(team => (
          <div
            key={team}
            style={{
              flex: 1, minWidth: '140px',
              background: team === 'A' ? '#eff6ff' : '#fef2f2',
              border: `1px solid ${team === 'A' ? '#bfdbfe' : '#fecaca'}`,
              borderRadius: '10px',
              padding: '14px 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              チーム{team} 合計勝ち点
            </div>
            <div style={{
              fontSize: '1.75rem', fontWeight: 800,
              color: team === 'A' ? '#2563eb' : '#dc2626',
            }}>
              {teamPoints[team]}点
            </div>
          </div>
        ))}
      </div>

      {/* 試合結果テーブル */}
      <div
        style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            🏟️ 試合結果
          </h2>
        </div>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }} className="gothic">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
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
                        ? '2px solid #e2e8f0'
                        : '1px solid #f1f5f9',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={tdStyle}>{match.date || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#475569' }}>
                      第{match.round}R
                    </td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{match.game}</td>
                    <td style={tdStyle}>{match.firstPlayer || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{match.firstPlayerDeck || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={tdStyle}>{match.secondPlayer || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>{match.secondPlayerDeck || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                    <td style={{ ...tdStyle, fontWeight: match.winner ? 700 : 400 }}>
                      {match.winner ? (
                        <span style={{ color: match.winnerTeam === 'A' ? '#2563eb' : '#dc2626' }}>
                          {match.winner}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700 }}>
                      {match.winnerTeam ? (
                        <span
                          style={{
                            display: 'inline-block',
                            background: match.winnerTeam === 'A' ? '#eff6ff' : '#fef2f2',
                            color: match.winnerTeam === 'A' ? '#2563eb' : '#dc2626',
                            borderRadius: '6px',
                            padding: '2px 10px',
                            fontSize: '0.875rem',
                          }}
                        >
                          {pts}点
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ height: '1px' }} />
      </div>

      {/* 勝ち点説明 */}
      <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8125rem', color: '#64748b' }}>
        <strong>勝ち点ルール:</strong> 後攻プレイヤーが勝利 → 2点 ／ 先攻プレイヤーが勝利 → 1点
      </div>
    </div>
  );
}
