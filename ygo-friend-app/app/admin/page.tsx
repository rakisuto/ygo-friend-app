'use client';

import { useRouter } from 'next/navigation';
import { TOURNAMENTS } from '@/data/tournaments';
import type { TournamentFormat, TournamentStatus } from '@/app/types/tournament';

const FORMAT_LABEL: Record<TournamentFormat, string> = {
  individual: '個人戦',
  team: 'チーム戦',
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  upcoming: '開催前',
  ongoing: '開催中',
  finished: '終了',
};

const STATUS_COLOR: Record<TournamentStatus, { bg: string; color: string }> = {
  upcoming: { bg: '#dbeafe', color: '#1e40af' },
  ongoing: { bg: '#dcfce7', color: '#166534' },
  finished: { bg: '#f1f5f9', color: '#64748b' },
};

export default function AdminIndexPage() {
  const router = useRouter();

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
        🔧 管理画面
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...TOURNAMENTS].reverse().map(t => {
          const sc = STATUS_COLOR[t.status];
          return (
            <div
              key={t.id}
              style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{t.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{FORMAT_LABEL[t.format]}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: '99px', background: sc.bg, color: sc.color,
                  }}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                {t.status === 'finished' && t.winner && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    優勝: {t.winner}
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push(`/admin/${t.id}`)}
                style={{
                  padding: '7px 14px', background: '#f1f5f9', color: '#334155',
                  border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                設定へ ▶
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
