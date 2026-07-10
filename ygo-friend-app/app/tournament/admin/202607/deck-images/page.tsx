'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DeckImageLayer, DeckImageLibrary, DeckImagePreset } from '../../../types';
import DeckImageLayerEditor, { CompositePreview } from '../../../components/DeckImageLayerEditor';

// ── HoverButton ──────────────────────────────────────────────────────────────
function HoverButton({
  onClick, disabled, children, variant = 'primary', style: extraStyle,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: React.CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const base: React.CSSProperties = {
    border: 'none', borderRadius: '8px', cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600, fontSize: '0.875rem', padding: '9px 20px',
    transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
    transform: hover && !disabled ? 'translateY(-1px)' : 'none',
    opacity: disabled ? 0.6 : 1,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: hover && !disabled ? '#1d4ed8' : '#2563eb', color: '#fff', boxShadow: hover && !disabled ? '0 4px 12px rgba(37,99,235,0.35)' : '0 1px 3px rgba(0,0,0,0.1)' },
    secondary: { background: hover && !disabled ? '#16a34a' : '#22c55e', color: '#fff', boxShadow: hover && !disabled ? '0 4px 12px rgba(34,197,94,0.35)' : '0 1px 3px rgba(0,0,0,0.1)' },
    danger: { background: hover && !disabled ? '#b91c1c' : '#dc2626', color: '#fff', boxShadow: hover && !disabled ? '0 4px 12px rgba(220,38,38,0.35)' : '0 1px 3px rgba(0,0,0,0.1)' },
    ghost: { background: hover && !disabled ? '#f1f5f9' : 'transparent', color: '#64748b', boxShadow: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ...base, ...variants[variant], ...extraStyle }}>
      {children}
    </button>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: '24px', ...style }}>
      {children}
    </div>
  );
}

// ── Edit/Create modal ─────────────────────────────────────────────────────────
function PresetEditModal({
  preset, onSave, onClose,
}: {
  preset: DeckImagePreset | null; // null = 新規作成
  onSave: (label: string, layers: DeckImageLayer[]) => Promise<void>;
  onClose: () => void;
}) {
  const [layers, setLayers] = useState<DeckImageLayer[]>(preset?.layers ?? []);
  const [activeIndex, setActiveIndex] = useState<number | null>(layers.length > 0 ? 0 : null);
  const [label, setLabel] = useState(preset?.label ?? '');
  const [saving, setSaving] = useState(false);

  const isDirty =
    JSON.stringify(layers) !== JSON.stringify(preset?.layers ?? []) ||
    label !== (preset?.label ?? '');

  const handleClose = () => {
    if (isDirty && !window.confirm('編集内容を破棄しますか？')) return;
    onClose();
  };

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSave = async () => {
    if (layers.length === 0) return;
    setSaving(true);
    try {
      await onSave(label.trim() || '無題', layers);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '20px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {preset ? '🖼️ 画像を編集' : '🆕 画像を新規作成'}
          </h3>
          <button type="button" onClick={handleClose} aria-label="閉じる" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        <DeckImageLayerEditor
          layers={layers}
          setLayers={setLayers}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          label={label}
          setLabel={setLabel}
          maxLayers={5}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={handleClose} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || layers.length === 0}
            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', cursor: saving || layers.length === 0 ? 'default' : 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: saving || layers.length === 0 ? 0.5 : 1 }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DeckImageLibraryPage() {
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [library, setLibrary] = useState<DeckImageLibrary | undefined>(undefined);
  const [editingPreset, setEditingPreset] = useState<DeckImagePreset | null | undefined>(undefined); // undefined = 非表示, null = 新規作成

  useEffect(() => {
    fetch('/api/tournament/202607/deck-image-library')
      .then(r => r.json())
      .then(data => setLibrary(Array.isArray(data) ? data : []))
      .catch(() => setLibrary([]));
  }, []);

  const handlePinSubmit = () => {
    if (!pinInput.trim()) return;
    setPin(pinInput.trim());
    setPinError('');
  };

  const handleUnauthorized = () => {
    setPinError('PINが正しくありません');
    setPin('');
    setPinInput('');
  };

  const adminFetch = (url: string, options: RequestInit) =>
    fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin, ...((options.headers as Record<string, string>) ?? {}) },
    });

  const handleSaveNew = async (label: string, layers: DeckImageLayer[]) => {
    const res = await adminFetch('/api/tournament/202607/deck-image-library', { method: 'POST', body: JSON.stringify({ label, layers }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    const preset = await res.json();
    setLibrary(prev => [...(prev ?? []), preset]);
  };

  const handleSaveEdit = async (id: string, label: string, layers: DeckImageLayer[]) => {
    const res = await adminFetch('/api/tournament/202607/deck-image-library', { method: 'PATCH', body: JSON.stringify({ id, label, layers }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    const updated = await res.json();
    setLibrary(prev => (prev ?? []).map(p => p.id === id ? updated : p));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('この画像を削除しますか？紐づいているデッキ名の表示も解除されます。')) return;
    const res = await adminFetch('/api/tournament/202607/deck-image-library', { method: 'DELETE', body: JSON.stringify({ id }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    setLibrary(prev => (prev ?? []).filter(p => p.id !== id));
  };

  // ── Loading ──
  if (library === undefined) {
    return (
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ color: '#94a3b8' }}>読み込み中...</p>
      </main>
    );
  }

  // ── PIN screen ──
  if (!pin) {
    return (
      <main style={{ maxWidth: '400px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <Card>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>⚙️ 画像ライブラリ管理</h1>
          {pinError && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#dc2626', fontSize: '0.875rem' }}>
              {pinError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              placeholder="管理者PIN"
              autoFocus
              style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '1rem', outline: 'none', color: '#1e293b' }}
            />
            <HoverButton onClick={handlePinSubmit} variant="primary" style={{ padding: '10px', fontSize: '0.9375rem' }}>
              ログイン
            </HoverButton>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <Link href="/tournament/admin/202607" style={{ fontSize: '0.8125rem', color: '#64748b', textDecoration: 'none' }}>← 大会設定に戻る</Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>🖼️ デッキ画像ライブラリ管理</h1>
        </div>
        <HoverButton onClick={() => setEditingPreset(null)} variant="secondary">
          🆕 新規作成
        </HoverButton>
      </div>

      {library.length === 0 ? (
        <Card>
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>まだ保存された画像がありません。</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {library.map(preset => (
            <Card key={preset.id} style={{ padding: '12px' }}>
              <CompositePreview layers={preset.layers} label={preset.label} width={176} height={110} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <HoverButton onClick={() => setEditingPreset(preset)} variant="ghost" style={{ flex: 1, padding: '7px', fontSize: '0.8125rem' }}>
                  ✏️ 編集
                </HoverButton>
                <HoverButton onClick={() => handleDelete(preset.id)} variant="danger" style={{ flex: 1, padding: '7px', fontSize: '0.8125rem' }}>
                  🗑️ 削除
                </HoverButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editingPreset !== undefined && (
        <PresetEditModal
          preset={editingPreset}
          onSave={(label, layers) => editingPreset ? handleSaveEdit(editingPreset.id, label, layers) : handleSaveNew(label, layers)}
          onClose={() => setEditingPreset(undefined)}
        />
      )}
    </main>
  );
}
