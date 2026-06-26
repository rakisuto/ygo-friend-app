'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Theme, BanRule } from '@/app/types/draft';
import type { YgoCard } from '@/app/types/ygoprodeck';
import { SearchModal, searchCards, getImageUrl } from '@/app/draft/SearchModal';

/* ─── BANルール管理モーダル ─── */
function BanRulesModal({
  themes,
  onClose,
}: {
  themes: Theme[];
  onClose: () => void;
}) {
  const [rules, setRules] = useState<BanRule[]>([]);
  const [saving, setSaving] = useState(false);
  // editing: null=一覧, 'new'=新規, rule.id=編集
  const [editing, setEditing] = useState<'new' | string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBanned, setEditBanned] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/draft/ban-rules').then(r => r.json()).then((d: BanRule[]) => setRules(d ?? []));
  }, []);

  async function persistRules(next: BanRule[]) {
    setRules(next);
    setSaving(true);
    try {
      await fetch('/api/draft/ban-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } finally { setSaving(false); }
  }

  function startCreate() {
    setEditing('new');
    setEditName('');
    setEditBanned(new Set());
  }

  function startEdit(rule: BanRule) {
    setEditing(rule.id);
    setEditName(rule.name);
    setEditBanned(new Set(rule.bannedCardIds));
  }

  function handleSave() {
    const name = editName.trim().slice(0, 30);
    if (!name || editBanned.size === 0) return;
    const bannedCardIds = Array.from(editBanned);
    if (editing === 'new') {
      persistRules([...rules, { id: crypto.randomUUID(), name, bannedCardIds }]);
    } else {
      persistRules(rules.map(r => r.id === editing ? { ...r, name, bannedCardIds } : r));
    }
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('このBANルールを削除しますか？')) return;
    persistRules(rules.filter(r => r.id !== id));
  }

  function toggleBan(cardId: number) {
    setEditBanned(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId); else next.add(cardId);
      return next;
    });
  }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px',
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#f8fafc', borderRadius: '16px', width: 'min(96vw, 1200px)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>🚫 BANルール管理</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保存中...</span>}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem' }}>✕</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Edit / Create form */}
          {editing !== null ? (
            <div style={card}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                {editing === 'new' ? '新規BANルール作成' : 'BANルール編集'}
              </p>

              <label style={{ display: 'block', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>ルール名（最大30文字）</span>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value.slice(0, 30))}
                  placeholder="例: えびルール"
                  style={{ display: 'block', width: '100%', marginTop: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </label>

              <p style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600, marginBottom: '10px' }}>BANテーマ選択（1件以上）</p>
              {themes.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>候補リストにテーマがありません</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {themes.map(t => {
                    const checked = editBanned.has(t.cardId);
                    return (
                      <label
                        key={t.cardId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          padding: '6px 10px', borderRadius: '8px', border: `2px solid ${checked ? '#ef4444' : '#e2e8f0'}`,
                          background: checked ? '#fef2f2' : '#fff', transition: 'all 0.12s',
                        }}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleBan(t.cardId)} style={{ accentColor: '#ef4444' }} />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.imageUrl} alt={t.cardName} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '3px' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#374151' }}>{t.cardName}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>キャンセル</button>
                <button
                  onClick={handleSave}
                  disabled={!editName.trim() || editBanned.size === 0}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: (!editName.trim() || editBanned.size === 0) ? '#94a3b8' : '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <>
              {rules.length < 99 && (
                <button
                  onClick={startCreate}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                >
                  ＋ 新規作成
                </button>
              )}

              {rules.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  BANルールがありません。「＋ 新規作成」から追加してください。
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rules.map(rule => {
                    const bannedThemes = themes.filter(t => rule.bannedCardIds.includes(t.cardId));
                    return (
                      <div key={rule.id} style={{ ...card, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>{rule.name}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => startEdit(rule)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' }}>編集</button>
                            <button onClick={() => handleDelete(rule.id)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', fontSize: '0.8125rem', color: '#ef4444' }}>削除</button>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                          🚫 {bannedThemes.length > 0 ? bannedThemes.map(t => t.cardName).join('、') : `${rule.bannedCardIds.length}件（候補リスト外）`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── メインページ ─── */
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
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetch('/api/draft/themes').then(r => r.json()).then((d: Theme[]) => setThemes(d ?? [])).catch(() => {});
  }, []);

  async function persistThemes(next: Theme[]) {
    setThemes(next);
    setSaving(true);
    try {
      await fetch('/api/draft/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    } finally { setSaving(false); }
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
    if (themes.some(t => t.cardId === card.id)) return;
    persistThemes([...themes, { cardId: card.id, cardName: card.name, imageUrl: getImageUrl(card) }]);
  }

  function handleDelete(index: number) { persistThemes(themes.filter((_, i) => i !== index)); }

  function handleMove(index: number, dir: -1 | 1) {
    const next = [...themes];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    persistThemes(next);
  }

  function handleSaveName(index: number) {
    const trimmed = editingNameValue.trim();
    if (!trimmed) { setEditingNameIndex(null); return; }
    persistThemes(themes.map((t, i) => i === index ? { ...t, cardName: trimmed } : t));
    setEditingNameIndex(null);
  }

  async function handleReset() {
    if (!confirm('候補リストをすべて削除しますか？')) return;
    await fetch('/api/draft/themes', { method: 'DELETE' });
    setThemes([]);
  }

  const btnBase: React.CSSProperties = { padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8125rem', color: '#475569' };

  return (
    <main className="page-main">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>🔧 ドラフト設定</h1>
        <Link href="/draft" style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'none' }}>← ドラフトに戻る</Link>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>🔍 テーマ検索</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="カード名を入力..."
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', color: '#1e293b' }} />
          <button onClick={handleSearch} disabled={searching}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: searching ? '#94a3b8' : '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: searching ? 'not-allowed' : 'pointer' }}>
            {searching ? '検索中...' : '検索'}
          </button>
        </div>
      </div>

      {/* Theme list */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>📋 候補リスト（{themes.length}件）</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>保存中...</span>}
            {/* View toggle */}
            {themes.length > 0 && (
              <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {(['list', 'grid'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    title={mode === 'list' ? 'リスト表示' : 'グリッド表示'}
                    style={{
                      padding: '5px 10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                      background: viewMode === mode ? '#2563eb' : '#fff',
                      color: viewMode === mode ? '#fff' : '#64748b',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {mode === 'list' ? '☰' : '⊞'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {themes.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem', textAlign: 'center', padding: '24px 0' }}>テーマがありません。検索して追加してください。</p>
        ) : viewMode === 'list' ? (
          /* ── リスト表示 ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {themes.map((theme, i) => (
              <div key={theme.cardId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={theme.imageUrl} alt={theme.cardName} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                {editingNameIndex === i ? (
                  <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
                    <input autoFocus value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(i); if (e.key === 'Escape') setEditingNameIndex(null); }}
                      style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.9375rem', outline: 'none', color: '#1e293b' }} />
                    <button onClick={() => handleSaveName(i)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer' }}>OK</button>
                    <button onClick={() => setEditingNameIndex(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.8125rem', cursor: 'pointer' }}>取消</button>
                  </div>
                ) : (
                  <span onClick={() => { setEditingNameIndex(i); setEditingNameValue(theme.cardName); }}
                    style={{ flex: 1, fontSize: '0.9375rem', color: '#1e293b', fontWeight: 500, borderBottom: '1px dashed #cbd5e1', paddingBottom: '1px', cursor: 'text' }}
                    title="クリックで名称を編集">
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
        ) : (
          /* ── グリッド表示 ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
            {themes.map((theme, i) => (
              <div key={theme.cardId} style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={theme.imageUrl} alt={theme.cardName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                {editingNameIndex === i ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input autoFocus value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(i); if (e.key === 'Escape') setEditingNameIndex(null); }}
                      style={{ width: '100%', padding: '3px 6px', borderRadius: '5px', border: '1px solid #93c5fd', fontSize: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <button onClick={() => handleSaveName(i)} style={{ flex: 1, padding: '3px', borderRadius: '5px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.6875rem', cursor: 'pointer' }}>OK</button>
                      <button onClick={() => setEditingNameIndex(null)} style={{ flex: 1, padding: '3px', borderRadius: '5px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.6875rem', cursor: 'pointer' }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <span onClick={() => { setEditingNameIndex(i); setEditingNameValue(theme.cardName); }}
                    style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 500, textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-all', cursor: 'text', borderBottom: '1px dashed #cbd5e1', width: '100%', textAlignLast: 'center' }}
                    title="クリックで名称を編集">
                    {theme.cardName}
                  </span>
                )}
                <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
                  <button onClick={() => handleMove(i, -1)} disabled={i === 0} style={{ ...btnBase, flex: 1, padding: '3px', opacity: i === 0 ? 0.3 : 1, textAlign: 'center' }}>↑</button>
                  <button onClick={() => handleMove(i, 1)} disabled={i === themes.length - 1} style={{ ...btnBase, flex: 1, padding: '3px', opacity: i === themes.length - 1 ? 0.3 : 1, textAlign: 'center' }}>↓</button>
                  <button onClick={() => handleDelete(i)} style={{ ...btnBase, flex: 1, padding: '3px', color: '#ef4444', borderColor: '#fca5a5', textAlign: 'center' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {themes.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              🗑️ 候補リストをリセット
            </button>
          </div>
        )}
      </div>

      {/* BAN rules section */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>🚫 BANルール</p>
          <button onClick={() => setBanModalOpen(true)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
            BANルール管理
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '10px', marginBottom: 0 }}>
          候補リストのテーマから特定プレイヤーが選択できないテーマをまとめたルールセットを作成できます。
        </p>
      </div>

      {/* Modals */}
      {modalOpen && <SearchModal results={searchResults} error={searchError} onSelect={handleSelectCard} onClose={() => setModalOpen(false)} />}
      {banModalOpen && <BanRulesModal themes={themes} onClose={() => setBanModalOpen(false)} />}
    </main>
  );
}
