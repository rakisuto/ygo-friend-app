'use client';

import { useEffect, useState } from 'react';

const PANEL_COUNT = 8;

function getPanelClipPath(index: number, total: number): string {
  const skew = 10; // percent
  if (index === 0) {
    // leftmost: flat left edge
    return `polygon(0% 0%, ${100 - skew}% 0%, 100% 100%, 0% 100%)`;
  }
  if (index === total - 1) {
    // rightmost: flat right edge
    return `polygon(${skew}% 0%, 100% 0%, 100% 100%, 0% 100%)`;
  }
  return `polygon(${skew}% 0%, 100% 0%, ${100 - skew}% 100%, 0% 100%)`;
}

export default function CardBackground() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/card-images')
      .then(r => r.json())
      .then(data => setImages(data.images ?? []))
      .catch(() => {});
  }, []);

  if (images.length === 0) return null;

  const panels = Array.from({ length: PANEL_COUNT }, (_, i) => images[i % images.length]);

  return (
    <>
      {/* Panel container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {panels.map((src, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              position: 'relative',
              clipPath: getPanelClipPath(i, PANEL_COUNT),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 1,
        }}
      />
    </>
  );
}
