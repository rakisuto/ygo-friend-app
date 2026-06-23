'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Theme } from '@/app/types/draft';
import type { YgoCard } from '@/app/types/ygoprodeck';
import { SearchModal, searchCards, getImageUrl } from '@/app/draft/SearchModal';

export default function DraftSettingsPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<YgoCard[]>([]);
  const [searchError, setSearchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  useEffect(() => {
    fetch('/api/draft/themes')
      .then((r) => r.json())
      .then((data: Theme[]) => setThemes(data ?? []))
      .catch(() => {});
  }, []);

  async function persistThemes(next: Theme[]) {
    setThemes(next);
    setSaving(true);
    try {
      await fetch('/api/draft/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    const { cards, error } = await searchCards(searchQuery);
    setSearchResults(cards);
    setSearchError(error);
    setSearching(false);
    setModalOpen(true);
  }

  function handleSelectCard(card: YgoCard) {
    setModalOpen(false);
    if (themes.some((t) => t.cardId === card.id)) return;
    persistThemes([...themes, { cardId: card.id, cardName: card.name, imageUrl: getImageUrl(card) }]);
  }

  function handleDelete(index: number) {
    persistThemes(themes.filter((_, i) => i !== index));
  }

  function handleMove(index: number, dir: -1 | 1) {
    const next = [...themes];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    persistThemes(next);
  }

  function handleStartEditName(index: number, current: string) {
    setEditingNameIndex(index);
    setEditingNameValue(current);
  }

  function handleSaveName(index: number) {
    const trimmed = editingNameValue.trim();
    if (!trimmed) { setEditingNameIndex(null); return; }
    const next = themes.map((t, i) => i === index ? { ...t, cardName: trimmed } : t);
    persistThemes(next);
    setEditingNameIndex(null);
  }

  async function handleReset() {
    if (!confirm('候補リストをすべて削除しますか？')) return;
    await fetch('/api/draft/themes', { method: 'DELETE' });
    setThemes([]);
  }

  const btnBase: React.CSSProperties = {
    padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569',
  };

  return (
    <main className="page-main">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          🔧 ドラフト設定
        </h1>
        <Link href="/draft" style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none' }}>
          ← ドラフトに戻る
        </Link>
      </div>

      {/* Search card */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          🔍 テーマ検索
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="カード名を入力..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', color: '#1e293b' }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: searching ? '#94a3b8' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: searching ? 'not-allowed' : 'pointer' }}
          >
            {searching ? '検索中...' : '検索'}
          </button>
        </div>
      </div>

      {/* Theme list */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            📋 候補リスト（{themes.length}件）
          </p>
          {saving && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保存中...</span>}
        </div>

        {themes.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem', textAlign: 'center', padding: '24px 0' }}>
            テーマがありません。検索して追加してください。
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {themes.map((theme, i) => (
              <div
                key={theme.cardId}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.imageUrl}
                  alt={theme.cardName}
                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                />

                {/* Editable name */}
                {editingNameIndex === i ? (
                  <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                    <input
                      autoFocus
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(i);
                        if (e.key === 'Escape') setEditingNameIndex(null);
                      }}
                      style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.9375rem', outline: 'none', color: '#1e293b' }}
                    />
                    <button onClick={() => handleSaveName(i)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer' }}>OK</button>
                    <button onClick={() => setEditingNameIndex(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.8125rem', cursor: 'pointer' }}>取消</button>
                  </div>
                ) : (
                  <span
                    onClick={() => handleStartEditName(i, theme.cardName)}
                    style={{
                      flex: 1, fontSize: '0.9375rem', color: '#1e293b', fontWeight: 500,
                      borderBottom: '1px dashed #cbd5e1', paddingBottom: '1px', cursor: 'text',
                    }}
                    title="クリックで名称を編集"
                  >
                    {theme.cardName}
                  </span>
                )}

                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button onClick={() => handleMove(i, -1)} disabled={i === 0} style={{ ...btnBase, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => handleMove(i, 1)} disabled={i === themes.length - 1} style={{ ...btnBase, opacity: i === themes.length - 1 ? 0.3 : 1 }}>↓</button>
                  <button onClick={() => handleDelete(i)} style={{ ...btnBase, color: '#ef4444', borderColor: '#fca5a5' }}>削除</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {themes.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleReset}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              🗑️ 候補リストをリセット
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <SearchModal
          results={searchResults}
          error={searchError}
          onSelect={handleSelectCard}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
