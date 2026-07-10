'use client';

import { useEffect, useState } from 'react';
import type { DeckImageLayer, DeckImageMapping } from '../types';
import { searchCards, getImageUrl } from '@/app/draft/SearchModal';
import type { YgoCard } from '@/app/types/ygoprodeck';

interface Props {
  deckName: string;
  initialMapping?: DeckImageMapping;
  onSave: (mapping: DeckImageMapping | null) => Promise<void>;
  onClose: () => void;
}

const PREVIEW_W = 120;
const PREVIEW_H = 180;
const MAX_LAYERS = 3;

function defaultLayer(imageUrl: string): DeckImageLayer {
  return { imageUrl, offsetX: 50, offsetY: 50, scale: 100 };
}

function CompositePreview({ layers, deckName }: { layers: DeckImageLayer[]; deckName: string; activeIndex?: number }) {
  if (layers.length === 0) {
    return (
      <div style={{
        width: PREVIEW_W, height: PREVIEW_H, borderRadius: '8px', border: '1px dashed #cbd5e1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem',
      }}>
        画像未設定
      </div>
    );
  }
  const stripWidth = PREVIEW_W / layers.length;
  return (
    <div style={{ position: 'relative', width: PREVIEW_W, height: PREVIEW_H, overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#0f172a', display: 'flex' }}>
      {layers.map((layer, i) => (
        <div key={i} style={{ position: 'relative', width: stripWidth, height: PREVIEW_H, overflow: 'hidden', borderRight: i < layers.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none' }}>
          <img
            src={layer.imageUrl}
            alt=""
            style={{ position: 'absolute', width: `${layer.scale}%`, maxWidth: 'none', left: `${layer.offsetX}%`, top: `${layer.offsetY}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
      ))}
      <span style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.65)', color: '#fff',
        fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center', padding: '4px',
      }}>
        {deckName}
      </span>
    </div>
  );
}

export default function DeckImagePicker({ deckName, initialMapping, onSave, onClose }: Props) {
  const [layers, setLayers] = useState<DeckImageLayer[]>(Array.isArray(initialMapping) ? initialMapping : []);
  const [activeIndex, setActiveIndex] = useState<number | null>(layers.length > 0 ? 0 : null);
  const [saving, setSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<'api' | 'vault'>('api');
  const [keyword, setKeyword] = useState(deckName);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YgoCard[]>([]);
  const [searchError, setSearchError] = useState('');
  const [vaultImages, setVaultImages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/card-images')
      .then(r => r.json())
      .then(data => setVaultImages(Array.isArray(data.images) ? data.images : []))
      .catch(() => setVaultImages([]));
  }, []);

  const addLayer = (imageUrl: string) => {
    setLayers(prev => {
      const next = [...prev, defaultLayer(imageUrl)];
      setActiveIndex(next.length - 1);
      return next;
    });
    setAddOpen(false);
  };

  const removeLayer = (index: number) => {
    setLayers(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(null);
  };

  const updateActiveLayer = (patch: Partial<DeckImageLayer>) => {
    if (activeIndex === null) return;
    setLayers(prev => prev.map((l, i) => i === activeIndex ? { ...l, ...patch } : l));
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    setSearchError('');
    const { cards, error } = await searchCards(keyword.trim());
    setSearchResults(cards);
    setSearchError(error);
    setSearching(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(layers.length > 0 ? layers : null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const activeLayer = activeIndex !== null ? layers[activeIndex] : null;

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
          maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
          🖼️ 表示画像を設定
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px' }}>
          デッキ「{deckName}」に紐づく画像です。同じデッキ名を使う全ての試合に反映されます。複数テーマの掛け合わせは画像を追加すると枚数分割で並びます（最大{MAX_LAYERS}枚）。
        </p>

        {/* レイヤー一覧 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {layers.map((layer, i) => (
            <div
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                position: 'relative', width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                border: activeIndex === i ? '2px solid #2563eb' : '1px solid #d1d5db',
                cursor: 'pointer', background: '#0f172a',
              }}
            >
              <img src={layer.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeLayer(i); }}
                style={{
                  position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff',
                  border: 'none', width: '18px', height: '18px', fontSize: '0.6875rem', cursor: 'pointer', lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          {layers.length < MAX_LAYERS && (
            <button
              type="button"
              onClick={() => setAddOpen(v => !v)}
              style={{
                width: '52px', height: '52px', borderRadius: '8px',
                border: '1px dashed #94a3b8', background: '#f8fafc', cursor: 'pointer',
                color: '#64748b', fontSize: '1.25rem',
              }}
            >
              +
            </button>
          )}
        </div>

        {/* 画像追加パネル */}
        {addOpen && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setAddTab('api')}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer',
                  background: addTab === 'api' ? '#2563eb' : '#fff', color: addTab === 'api' ? '#fff' : '#475569',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}
              >
                API検索
              </button>
              <button
                type="button"
                onClick={() => setAddTab('vault')}
                style={{
                  flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer',
                  background: addTab === 'vault' ? '#2563eb' : '#fff', color: addTab === 'vault' ? '#fff' : '#475569',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}
              >
                保管庫から選ぶ
              </button>
            </div>

            {addTab === 'api' ? (
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  <input
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="カード名で検索"
                    style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '0.875rem', color: '#1e293b' }}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8125rem', cursor: searching ? 'default' : 'pointer', opacity: searching ? 0.6 : 1 }}
                  >
                    {searching ? '検索中...' : '検索'}
                  </button>
                </div>
                {searchError && <p style={{ fontSize: '0.8125rem', color: '#f59e0b', margin: '0 0 8px' }}>{searchError}</p>}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {searchResults.map(card => (
                    <div
                      key={card.id}
                      onClick={() => addLayer(getImageUrl(card))}
                      title={card.name}
                      style={{ flexShrink: 0, width: '80px', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <img src={getImageUrl(card)} alt={card.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {vaultImages.map(img => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => addLayer(img)}
                    style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', padding: 0, cursor: 'pointer', background: '#0f172a' }}
                  >
                    <img src={img} alt={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
                {vaultImages.length === 0 && (
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>保管庫に画像がありません</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 合成プレビュー */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <CompositePreview layers={layers} deckName={deckName} />
        </div>

        {/* アクティブレイヤーの位置・拡大率調整 */}
        {activeLayer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              {(activeIndex ?? 0) + 1}枚目の位置調整
            </p>
            <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
              横位置: {activeLayer.offsetX}%
              <input type="range" min={0} max={100} value={activeLayer.offsetX} onChange={e => updateActiveLayer({ offsetX: Number(e.target.value) })} style={{ width: '100%' }} />
            </label>
            <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
              縦位置: {activeLayer.offsetY}%
              <input type="range" min={0} max={100} value={activeLayer.offsetY} onChange={e => updateActiveLayer({ offsetY: Number(e.target.value) })} style={{ width: '100%' }} />
            </label>
            <label style={{ fontSize: '0.75rem', color: '#64748b' }}>
              拡大率: {activeLayer.scale}%
              <input type="range" min={100} max={300} value={activeLayer.scale} onChange={e => updateActiveLayer({ scale: Number(e.target.value) })} style={{ width: '100%' }} />
            </label>
          </div>
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
