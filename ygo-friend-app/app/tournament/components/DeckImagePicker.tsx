'use client';

import { useEffect, useState } from 'react';
import type { DeckImageLayer, DeckImagePreset } from '../types';
import DeckImageLayerEditor, { CompositePreview } from './DeckImageLayerEditor';

interface Props {
  deckName: string;
  library: DeckImagePreset[];
  currentPresetId?: string;
  onBindExisting: (presetId: string | null) => Promise<void>;
  onCreateNew: (label: string, layers: DeckImageLayer[]) => Promise<void>;
  onClose: () => void;
}

const MAX_LAYERS = 5;

export default function DeckImagePicker({ deckName, library, currentPresetId, onBindExisting, onCreateNew, onClose }: Props) {
  const currentPreset = currentPresetId ? library.find(p => p.id === currentPresetId) : undefined;

  const [tab, setTab] = useState<'create' | 'library'>('create');
  const [layers, setLayers] = useState<DeckImageLayer[]>(currentPreset?.layers ?? []);
  const [activeIndex, setActiveIndex] = useState<number | null>(layers.length > 0 ? 0 : null);
  const [label, setLabel] = useState(currentPreset?.label ?? deckName);
  const [saving, setSaving] = useState(false);

  const handleSaveNew = async () => {
    if (layers.length === 0) return;
    setSaving(true);
    try {
      await onCreateNew(label.trim() || deckName, layers);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handlePickExisting = async (presetId: string) => {
    setSaving(true);
    try {
      await onBindExisting(presetId);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleUnbind = async () => {
    setSaving(true);
    try {
      await onBindExisting(null);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    JSON.stringify(layers) !== JSON.stringify(currentPreset?.layers ?? []) ||
    label !== (currentPreset?.label ?? deckName);

  const handleClose = () => {
    if (isDirty && !window.confirm('編集内容を破棄しますか？')) return;
    onClose();
  };

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '14px', padding: '20px',
          maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
            🖼️ 表示画像を設定
          </h3>
          <button
            type="button"
            onClick={handleClose}
            aria-label="閉じる"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px' }}>
          デッキ「{deckName}」に使う画像です。同じデッキ名を使う全ての試合に反映されます。
        </p>

        {/* 新規作成 / 保存済みから選ぶ */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setTab('create')}
            style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer',
              background: tab === 'create' ? '#2563eb' : '#fff', color: tab === 'create' ? '#fff' : '#475569',
              fontWeight: 700, fontSize: '0.875rem',
            }}
          >
            🆕 新規作成
          </button>
          <button
            type="button"
            onClick={() => setTab('library')}
            style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer',
              background: tab === 'library' ? '#2563eb' : '#fff', color: tab === 'library' ? '#fff' : '#475569',
              fontWeight: 700, fontSize: '0.875rem',
            }}
          >
            📚 保存済みから選ぶ
          </button>
        </div>

        {tab === 'library' ? (
          <div style={{ marginBottom: '8px' }}>
            {library.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>
                まだ保存された画像がありません。「新規作成」から作ってください。
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                {library.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePickExisting(preset.id)}
                    disabled={saving}
                    style={{
                      padding: 0, border: preset.id === currentPresetId ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '8px', cursor: saving ? 'default' : 'pointer', background: '#fff', overflow: 'hidden',
                    }}
                  >
                    <CompositePreview layers={preset.layers} label={preset.label} width={118} height={72} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <DeckImageLayerEditor
            layers={layers}
            setLayers={setLayers}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            label={label}
            setLabel={setLabel}
            searchDefaultKeyword={deckName}
            maxLayers={MAX_LAYERS}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div>
            {currentPresetId && (
              <button
                type="button"
                onClick={handleUnbind}
                disabled={saving}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: saving ? 'default' : 'pointer', fontSize: '0.8125rem' }}
              >
                画像を外す
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              キャンセル
            </button>
            {tab === 'create' && (
              <button
                type="button"
                onClick={handleSaveNew}
                disabled={saving || layers.length === 0}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: saving || layers.length === 0 ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving || layers.length === 0 ? 0.5 : 1 }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
