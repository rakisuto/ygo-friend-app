'use client';

import { useEffect, useState } from 'react';

const PANEL_COUNT = 8;
const SKEW_DEG = 6; // 斜め角度（度）

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
              overflow: 'hidden',
              // skewX でパネルを傾ける — clip-path と違い隣接パネルと自然に重なるため白線が出ない
              transform: `skewX(-${SKEW_DEG}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{
                // skewX の逆補正 + 少し幅広にして傾いた端を埋める
                width: '120%',
                height: '100%',
                marginLeft: '-10%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
                transform: `skewX(${SKEW_DEG}deg)`,
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
          background: 'rgba(0, 0, 0, 0.52)',
          zIndex: 1,
        }}
      />
    </>
  );
}
