'use client';

import { useEffect, useState } from 'react';

// 境界の斜め幅（px）— 小さいほど境界線が細い
const SLANT_PX = 20;

function getClipPath(i: number, n: number, s: number): string {
  const S = `${s}px`;
  if (i === 0)     return `polygon(0 0, 100% 0, calc(100% - ${S}) 100%, 0 100%)`;
  if (i === n - 1) return `polygon(${S} 0, 100% 0, 100% 100%, 0 100%)`;
  return           `polygon(${S} 0, 100% 0, calc(100% - ${S}) 100%, 0 100%)`;
}

export default function CardBackground() {
  const [images, setImages] = useState<string[]>([]);
  const [panelCount, setPanelCount] = useState(8);

  useEffect(() => {
    const update = () => setPanelCount(window.innerWidth < 600 ? 4 : 8);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    fetch('/api/card-images')
      .then(r => r.json())
      .then(data => setImages(data.images ?? []))
      .catch(() => {});
  }, []);

  if (images.length === 0) return null;

  const N = panelCount;
  const panels = Array.from({ length: N }, (_, i) => images[i % images.length]);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {panels.map((src, i) => {
          const isFirst = i === 0;
          // 各パネルを左隣に SLANT_PX だけ食い込ませてギャップをゼロにする
          const leftCalc = isFirst
            ? '0px'
            : `calc(${i * 100 / N}% - ${SLANT_PX}px)`;
          const widthCalc = isFirst
            ? `${100 / N}%`
            : `calc(${100 / N}% + ${SLANT_PX}px)`;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: leftCalc,
                width: widthCalc,
                clipPath: getClipPath(i, N, SLANT_PX),
                zIndex: i,
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
          );
        })}
      </div>

      {/* オーバーレイ */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1 }} />
    </>
  );
}
