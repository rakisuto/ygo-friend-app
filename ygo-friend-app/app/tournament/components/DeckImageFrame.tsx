'use client';

import type { DeckImageMapping } from '../types';

interface Props {
  deckName: string | null;
  mapping?: DeckImageMapping;
  width?: number;
  height?: number;
  fallbackDark?: boolean;
}

export default function DeckImageFrame({ deckName, mapping, width = 56, height = 84, fallbackDark }: Props) {
  if (!deckName) {
    return (
      <span style={{ color: fallbackDark ? 'rgba(148,163,184,0.4)' : '#cbd5e1' }}>—</span>
    );
  }

  if (!mapping) {
    return (
      <span style={{ color: fallbackDark ? 'rgba(148,163,184,0.8)' : '#475569' }}>{deckName}</span>
    );
  }

  return (
    <div
      style={{
        position: 'relative', width, height, overflow: 'hidden',
        borderRadius: '6px', border: '1px solid rgba(148,163,184,0.35)',
        background: '#0f172a', flexShrink: 0,
      }}
    >
      <img
        src={mapping.imagePath}
        alt={deckName}
        style={{
          position: 'absolute',
          width: `${mapping.scale}%`,
          maxWidth: 'none',
          left: `${mapping.offsetX}%`,
          top: `${mapping.offsetY}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <span
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', color: '#fff',
          fontSize: '0.625rem', fontWeight: 600, textAlign: 'center',
          padding: '2px 3px', lineHeight: 1.2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        {deckName}
      </span>
    </div>
  );
}
