'use client';

import { useState } from 'react';

const glass: React.CSSProperties = {
  background: 'rgba(10, 15, 35, 0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export default function DescriptionAccordion({ description }: { description?: string }) {
  const [open, setOpen] = useState(false);
  if (!description) return null;

  return (
    <div style={{ ...glass, overflow: 'hidden', marginBottom: '16px' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9375rem', color: '#f1f5f9' }}>
          📝 大会概要
        </span>
        <span style={{
          color: 'rgba(148,163,184,0.9)', fontSize: '0.75rem',
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>
          ▼
        </span>
      </button>
      {open && (
        <div style={{
          padding: '0 16px 16px', color: 'rgba(226,232,240,0.9)', fontSize: '0.875rem',
          lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px',
        }}>
          {description}
        </div>
      )}
    </div>
  );
}
