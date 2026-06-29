'use client';

import Link from 'next/link';
import { useState } from 'react';

const TOURNAMENTS = [
  { id: '202605', label: '2026年5月大会' },
  { id: '202607', label: '2026年7月大会' },
];

export default function AdminIndexPage() {
  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>
        🔧 管理画面
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
        {TOURNAMENTS.map((t, i) => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px', background: '#fff',
              borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{t.label}</span>
            <Link
              href={`/tournament/admin/${t.id}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#2563eb', color: '#fff', fontWeight: 600,
                fontSize: '0.875rem', padding: '8px 18px', borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              設定へ ▶
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
