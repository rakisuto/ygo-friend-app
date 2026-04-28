'use client';

import { useState } from 'react';
import type { Match, Season } from '../types';
import MatchTable from './MatchTable';

interface Props {
  season: Season;
  isAdmin?: boolean;
  onSessionSave?: (sessionId: string, matches: Match[]) => Promise<void>;
  onDateChange?: (sessionId: string, date: string) => Promise<void>;
}

const BADGE_COLORS: Record<number, { background: string; color: string; border: string }> = {
  0: { background: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  1: { background: '#ffedd5', color: '#9a3412', border: '#fdba74' },
  2: { background: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  3: { background: '#dcfce7', color: '#166534', border: '#86efac' },
};

export default function SessionTabs({ season, isAdmin, onSessionSave, onDateChange }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未定';
    const [y, m, d] = dateStr.split('-');
    return `${y}/${parseInt(m)}/${parseInt(d)}`;
  };

  return (
    <div>
      {/* タブバー（スマホで横スクロール） */}
      <div
        className="tab-scroll"
        style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', gap: '4px', width: 'max-content', minWidth: '100%' }}>
          {season.sessions.map((session, i) => (
            <button
              key={session.id}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 16px',
                background: activeTab === i ? '#eff6ff' : 'transparent',
                border: 'none',
                borderBottom: activeTab === i ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                textAlign: 'center' as const,
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: activeTab === i ? '#1d4ed8' : '#64748b', whiteSpace: 'nowrap' }}>
                {session.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: activeTab === i ? '#3b82f6' : '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {formatDate(session.date)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {season.sessions.map((session, i) => (
        <div key={session.id} style={{ display: activeTab === i ? 'block' : 'none' }}>

          {/* 先攻回数バッジ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>先攻回数:</span>
            {season.players.map(p => {
              const count = session.firstPlayerCounts[p.id];
              const colors = BADGE_COLORS[count] ?? { background: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
              return (
                <span
                  key={p.id}
                  className="gothic"
                  style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    padding: '3px 10px', borderRadius: '999px',
                    background: colors.background, color: colors.color,
                    border: `1px solid ${colors.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}：先攻{count}回
                </span>
              );
            })}
          </div>

          {/* 管理者用日付編集（独立した行） */}
          {isAdmin && onDateChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>開催日:</span>
              <input
                type="date"
                defaultValue={session.date}
                style={{
                  border: '1px solid #e2e8f0', borderRadius: '6px',
                  padding: '5px 8px', fontSize: '0.8125rem',
                  color: '#1e293b', background: '#fff',
                  maxWidth: '160px',
                }}
                onBlur={e => {
                  if (e.target.value && e.target.value !== session.date) {
                    onDateChange(session.id, e.target.value);
                  }
                }}
              />
            </div>
          )}

          <MatchTable
            session={session}
            players={season.players}
            isAdmin={isAdmin}
            onSave={onSessionSave ? matches => onSessionSave(session.id, matches) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
