'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/tournament', label: '📋 試合表' },
  { href: '/stats/player', label: '👤 個人成績' },
  { href: '/stats/overall', label: '🏆 総合成績' },
  { href: '/tournament/admin', label: '⚙️ 管理画面' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Fixed header bar */}
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#ffffff', borderBottom: '1px solid #e2e8f0',
          height: '52px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}
      >
        <Link
          href="/tournament"
          style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}
        >
          🐉 NR杯
        </Link>
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="メニューを開く"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.375rem', color: '#475569', padding: '6px 4px',
            lineHeight: 1,
          }}
        >
          ☰
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)',
            zIndex: 200, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Slide-in drawer */}
      <nav
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 300,
          width: '260px', background: '#ffffff',
          boxShadow: '-6px 0 24px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          padding: '0',
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9375rem' }}>🐉 NR杯</span>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '1.125rem', color: '#94a3b8', padding: '4px',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: '12px 12px', flex: 1 }}>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block', padding: '11px 16px',
                  textDecoration: 'none',
                  color: isActive ? '#2563eb' : '#334155',
                  background: isActive ? '#eff6ff' : 'transparent',
                  borderRadius: '8px', marginBottom: '4px',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9375rem',
                  borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer below fixed header */}
      <div style={{ height: '52px' }} />
    </>
  );
}
