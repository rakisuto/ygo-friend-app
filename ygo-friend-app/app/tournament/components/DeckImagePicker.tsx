'use client';

import { useEffect, useState } from 'react';
import type { DeckImageMapping } from '../types';

interface Props {
  deckName: string;
  initialMapping?: DeckImageMapping;
  onSave: (mapping: DeckImageMapping | null) => Promise<void>;
  onClose: () => void;
}

const PREVIEW_W = 100;
const PREVIEW_H = 150;

export default function DeckImagePicker({ deckName, initialMapping, onSave, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [imagePath, setImagePath] = useState(initialMapping?.imagePath ?? '');
  const [offsetX, setOffsetX] = useState(initialMapping?.offsetX ?? 50);
  const [offsetY, setOffsetY] = useState(initialMapping?.offsetY ?? 50);
  const [scale, setScale] = useState(initialMapping?.scale ?? 100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/card-images')
      .then(r => r.json())
      .then(data => setImages(Array.isArray(data.images) ? data.images : []))
      .catch(() => setImages([]));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(imagePath ? { imagePath, offsetX, offsetY, scale } : null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '14px', padding: '20px',
          maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
          🖼️ 表示画像を設定
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px' }}>
          デッキ「{deckName}」に紐づく画像です。同じデッキ名を使う全ての試合に反映されます。
        </p>

        {/* 画像候補グリッド */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', maxHeight: '160px', overflowY: 'auto' }}>
          <button
            type="button"
            onClick={() => setImagePath('')}
            style={{
              width: '52px', height: '52px', borderRadius: '8px',
              border: imagePath === '' ? '2px solid #2563eb' : '1px solid #d1d5db',
              background: '#f8fafc', cursor: 'pointer', fontSize: '0.7rem', color: '#94a3b8',
            }}
          >
            なし
          </button>
          {images.map(img => (
            <button
              key={img}
              type="button"
              onClick={() => setImagePath(img)}
              style={{
                width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                border: imagePath === img ? '2px solid #2563eb' : '1px solid #d1d5db',
                padding: 0, cursor: 'pointer', background: '#0f172a',
              }}
            >
              <img src={img} alt={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
          {images.length === 0 && (
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              public/img/card/202607/ に画像がありません
            </span>
          )}
        </div>

        {imagePath && (
          <>
            {/* プレビュー */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  position: 'relative', width: PREVIEW_W, height: PREVIEW_H, overflow: 'hidden',
                  borderRadius: '8px', border: '1px solid #e2e8f0', background: '#0f172a',
                }}
              >
                <img
                  src={imagePath}
                  alt={deckName}
                  style={{
                    position: 'absolute',
                    width: `${scale}%`,
                    maxWidth: 'none',
                    left: `${offsetX}%`,
                    top: `${offsetY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.65)', color: '#fff',
                    fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', padding: '3px',
                  }}
                >
                  {deckName}
                </span>
              </div>
            </div>

            {/* 位置・拡大率調整 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
                横位置: {offsetX}%
                <input type="range" min={0} max={100} value={offsetX} onChange={e => setOffsetX(Number(e.target.value))} style={{ width: '100%' }} />
              </label>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
                縦位置: {offsetY}%
                <input type="range" min={0} max={100} value={offsetY} onChange={e => setOffsetY(Number(e.target.value))} style={{ width: '100%' }} />
              </label>
              <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
                拡大率: {scale}%
                <input type="range" min={100} max={300} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: '100%' }} />
              </label>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: saving ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
