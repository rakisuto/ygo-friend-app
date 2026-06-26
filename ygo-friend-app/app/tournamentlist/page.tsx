'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TOURNAMENTS } from '@/data/tournaments';
import type { TournamentFormat, TournamentStatus, TournamentMeta } from '@/app/types/tournament';

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

export default function TournamentListPage() {
  const [metaMap, setMetaMap] = useState<Record<string, TournamentMeta>>({});

  useEffect(() => {
    Promise.all(
      TOURNAMENTS.map(t =>
        fetch(`/api/tournaments/${t.id}/meta`)
          .then(r => r.json())
          .then((data: TournamentMeta) => ({ id: t.id, data }))
          .catch(() => ({ id: t.id, data: { status: t.status, winner: t.winner } as TournamentMeta }))
      )
    ).then(results => {
      const map: Record<string, TournamentMeta> = {};
      for (const { id, data } of results) map[id] = data;
      setMetaMap(map);
    });
  }, []);

  return (
    <main className="page-main" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          大会一覧
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[...TOURNAMENTS].reverse().map(t => {
          const meta = metaMap[t.id];
          const status: TournamentStatus = meta?.status ?? t.status;
          const winner = meta?.winner ?? t.winner;
          const sc = STATUS_COLOR[status];
          return (
            <Link
              key={t.id}
              href={t.archiveUrl}
              style={{
                display: 'block', background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: '12px', padding: '16px 20px', textDecoration: 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{t.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{FORMAT_LABEL[t.format]}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: sc.bg, color: sc.color }}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
              {status === 'finished' && winner && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>優勝: {winner}</div>
              )}
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '4px' }}>
                大会結果・プレイヤー成績・総合成績
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
