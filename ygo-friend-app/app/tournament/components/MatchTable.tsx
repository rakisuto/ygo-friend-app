'use client';

import { useState, useEffect } from 'react';
import type { Match, Player, Session } from '../types';
import { DECK_THEMES } from '@/data/deckThemes';

interface Props {
  session: Session;
  players: Player[];
  isAdmin?: boolean;
  onSave?: (matches: Match[]) => Promise<void>;
}

const COL = {
  firstHeader:  { background: '#1d4ed8', color: '#ffffff', padding: '8px 10px', textAlign: 'center' as const },
  firstDeckH:   { background: '#dbeafe', color: '#1e40af', padding: '8px 10px', textAlign: 'left' as const },
  secondHeader: { background: '#b91c1c', color: '#ffffff', padding: '8px 10px', textAlign: 'center' as const },
  secondDeckH:  { background: '#fee2e2', color: '#991b1b', padding: '8px 10px', textAlign: 'left' as const },
  winnerHeader: { background: '#fef9c3', color: '#92400e', padding: '8px 10px', textAlign: 'center' as const },
  numHeader:    { background: '#374151', color: '#ffffff', padding: '8px 10px', textAlign: 'center' as const, width: '40px' },
};

export default function MatchTable({ session, players, isAdmin, onSave }: Props) {
  const [edited, setEdited] = useState<Match[]>(session.matches);
  const [saving, setSaving] = useState(false);
  const [toastState, setToastState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (toastState === 'saved' || toastState === 'error') {
      const t = setTimeout(() => setToastState('idle'), 2500);
      return () => clearTimeout(t);
    }
  }, [toastState]);

  const playerMap = Object.fromEntries(players.map(p => [p.id, p.name]));
  // datalist は session ごとに一意な id を使う
  const datalistId = `deck-themes-${session.id}`;

  const update = (index: number, field: keyof Match, value: string | null) => {
    setEdited(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value || null } : m))
    );
    if (toastState === 'saved') setToastState('idle');
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setToastState('saving');
    try {
      await onSave(edited);
      setToastState('saved');
    } catch {
      setToastState('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* デッキテーマ予測変換用 datalist */}
      {isAdmin && (
        <datalist id={datalistId}>
          {DECK_THEMES.map(theme => (
            <option key={theme} value={theme} />
          ))}
        </datalist>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} className="gothic">
          <thead>
            <tr>
              <th style={COL.numHeader}>#</th>
              <th style={COL.firstHeader}>先攻</th>
              <th style={{ ...COL.firstDeckH, minWidth: '130px' }}>先攻デッキ</th>
              <th style={COL.secondHeader}>後攻</th>
              <th style={{ ...COL.secondDeckH, minWidth: '130px' }}>後攻デッキ</th>
              <th style={{ ...COL.winnerHeader, minWidth: '120px' }}>勝者</th>
            </tr>
          </thead>
          <tbody>
            {edited.map((match, i) => {
              const firstWon = match.winnerId === match.firstPlayerId;
              const secondWon = match.winnerId === match.secondPlayerId;
              const rowBg = firstWon || secondWon ? '#fefce8' : i % 2 === 0 ? '#ffffff' : '#f8fafc';
              return (
                <tr key={match.matchNumber} style={{ background: rowBg, borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace', borderRight: '1px solid #f1f5f9' }}>
                    {match.matchNumber}
                  </td>

                  {/* 先攻 */}
                  <td style={{
                    padding: '8px 10px', textAlign: 'center', fontWeight: 600,
                    background: '#eff6ff', color: firstWon ? '#d97706' : '#1d4ed8',
                    borderRight: '1px solid #dbeafe',
                    whiteSpace: 'nowrap',
                  }}>
                    {firstWon && '🏆 '}{playerMap[match.firstPlayerId]}
                  </td>

                  {/* 先攻デッキ */}
                  <td style={{ padding: '6px 8px', borderRight: '1px solid #f1f5f9' }}>
                    {isAdmin ? (
                      <input
                        list={datalistId}
                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px', fontSize: '0.875rem', background: '#fff', color: '#1e293b' }}
                        value={match.firstPlayerDeck ?? ''}
                        onChange={e => update(i, 'firstPlayerDeck', e.target.value)}
                        placeholder="デッキテーマ"
                        autoComplete="off"
                      />
                    ) : (
                      <span style={{ color: match.firstPlayerDeck ? '#475569' : '#cbd5e1' }}>
                        {match.firstPlayerDeck ?? '—'}
                      </span>
                    )}
                  </td>

                  {/* 後攻 */}
                  <td style={{
                    padding: '8px 10px', textAlign: 'center', fontWeight: 600,
                    background: '#fff1f2', color: secondWon ? '#d97706' : '#b91c1c',
                    borderRight: '1px solid #fee2e2',
                    whiteSpace: 'nowrap',
                  }}>
                    {secondWon && '🏆 '}{playerMap[match.secondPlayerId]}
                  </td>

                  {/* 後攻デッキ */}
                  <td style={{ padding: '6px 8px', borderRight: '1px solid #f1f5f9' }}>
                    {isAdmin ? (
                      <input
                        list={datalistId}
                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px', fontSize: '0.875rem', background: '#fff', color: '#1e293b' }}
                        value={match.secondPlayerDeck ?? ''}
                        onChange={e => update(i, 'secondPlayerDeck', e.target.value)}
                        placeholder="デッキテーマ"
                        autoComplete="off"
                      />
                    ) : (
                      <span style={{ color: match.secondPlayerDeck ? '#475569' : '#cbd5e1' }}>
                        {match.secondPlayerDeck ?? '—'}
                      </span>
                    )}
                  </td>

                  {/* 勝者 */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    {isAdmin ? (
                      <select
                        style={{
                          width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px',
                          padding: '4px 4px', fontSize: '0.875rem', background: '#fff', color: '#1e293b',
                          minWidth: '110px',
                        }}
                        value={match.winnerId ?? ''}
                        onChange={e => update(i, 'winnerId', e.target.value)}
                      >
                        <option value="">未定</option>
                        <option value={match.firstPlayerId}>{playerMap[match.firstPlayerId]}</option>
                        <option value={match.secondPlayerId}>{playerMap[match.secondPlayerId]}</option>
                      </select>
                    ) : match.winnerId ? (
                      <span style={{ fontWeight: 700, color: '#d97706' }}>{playerMap[match.winnerId]}</span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>未定</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAdmin && onSave && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '6px 20px',
              background: saving ? '#93c5fd' : '#2563eb',
              color: '#fff', border: 'none', borderRadius: '20px',
              fontSize: '0.875rem', cursor: saving ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>

          {/* Toast */}
          {toastState !== 'idle' && (
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600,
                ...(toastState === 'saving'
                  ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                  : toastState === 'saved'
                  ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
                  : { background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' }),
              }}
            >
              {toastState === 'saving' && '⏳ 保存中...'}
              {toastState === 'saved'  && '✅ 保存しました'}
              {toastState === 'error'  && '❌ 保存に失敗しました'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
