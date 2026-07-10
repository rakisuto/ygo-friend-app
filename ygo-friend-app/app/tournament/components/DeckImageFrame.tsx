'use client';

import type { DeckImageMapping } from '../types';

interface Props {
  deckName: string | null;
  mapping?: DeckImageMapping;
  width?: number;
  height?: number;
  fallbackDark?: boolean;
}

export default function DeckImageFrame({ deckName, mapping, width = 96, height = 60, fallbackDark }: Props) {
  if (!deckName) {
    return (
      <span style={{ color: fallbackDark ? 'rgba(148,163,184,0.4)' : '#cbd5e1' }}>—</span>
    );
  }

  // 旧形式(単一オブジェクト)のデータが残っている場合はテキスト表示にフォールバック
  const layers = Array.isArray(mapping) ? mapping : [];

  if (layers.length === 0) {
    return (
      <span style={{ color: fallbackDark ? 'rgba(148,163,184,0.8)' : '#475569' }}>{deckName}</span>
    );
  }

  const stripWidth = width / layers.length;

  return (
    <div
      style={{
        position: 'relative', width, height, overflow: 'hidden',
        borderRadius: '6px', border: '1px solid rgba(148,163,184,0.35)',
        background: '#0f172a', flexShrink: 0, display: 'flex',
      }}
    >
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            position: 'relative', width: stripWidth, height, overflow: 'hidden',
            borderRight: i < layers.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none',
          }}
        >
          <img
            src={layer.imageUrl}
            alt={deckName}
            style={{
              position: 'absolute',
              width: `${layer.scale}%`,
              maxWidth: 'none',
              left: `${layer.offsetX}%`,
              top: `${layer.offsetY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      ))}
      <span
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: '0.75rem', fontWeight: 700, textAlign: 'center',
          padding: '3px 4px', lineHeight: 1.25,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden', wordBreak: 'break-all',
        }}
      >
        {deckName}
      </span>
    </div>
  );
}
