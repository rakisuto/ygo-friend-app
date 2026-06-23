'use client';

import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { DraftState, Player, Theme } from '@/app/types/draft';
import type { YgoCard, YgoApiResponse } from '@/app/types/ygoprodeck';
import { initialDraftState } from '@/app/types/draft';

function getImageUrl(card: YgoCard): string {
  return card.card_images[0]?.image_url_cropped ?? card.card_images[0]?.image_url ?? '';
}

export default function DraftPage() {
  const [state, setState] = useState<DraftState>(initialDraftState);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YgoCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<YgoCard | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const playerAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/draft')
      .then((r) => r.json())
      .then((data: DraftState | null) => {
        if (data) setState(data);
      })
      .catch(() => {});
  }, []);

  async function saveState(next: DraftState) {
    setState(next);
    setSaving(true);
    try {
      await fetch('/api/draft', {
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
    try {
      const res = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(searchQuery)}&language=ja`
      );
      if (!res.ok) throw new Error('Not found');
      const json: YgoApiResponse = await res.json();
      const cards = json.data?.slice(0, 20) ?? [];
      if (cards.length === 0) {
        setSearchError('該当するカードが見つかりませんでした');
      } else {
        setSearchResults(cards);
        setModalOpen(true);
      }
    } catch {
      setSearchError('該当するカードが見つかりませんでした');
    } finally {
      setSearching(false);
    }
  }

  function handleSelectCard(card: YgoCard) {
    setSelectedCard(card);
    setModalOpen(false);
  }

  function handleAddToPlayer(playerIndex: number) {
    if (!selectedCard) return;
    const theme: Theme = {
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      imageUrl: getImageUrl(selectedCard),
    };
    const next: DraftState = {
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: [...p.themes, theme] } : p
      ),
    };
    saveState(next);
    setSelectedCard(null);
  }

  function handleRemoveTheme(playerIndex: number, themeIndex: number) {
    const next: DraftState = {
      players: state.players.map((p, i) =>
        i === playerIndex
          ? { ...p, themes: p.themes.filter((_, ti) => ti !== themeIndex) }
          : p
      ),
    };
    saveState(next);
  }

  function handleStartEditName(playerIndex: number, currentName: string) {
    setEditingPlayer(playerIndex);
    setEditingName(currentName);
  }

  function handleSaveName(playerIndex: number) {
    const next: DraftState = {
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, name: editingName || p.name } : p
      ),
    };
    saveState(next);
    setEditingPlayer(null);
  }

  async function handleReset() {
    if (!confirm('リセットしますか？すべての情報が削除されます。')) return;
    await fetch('/api/draft', { method: 'DELETE' });
    setState(initialDraftState);
    setSelectedCard(null);
  }

  async function handleSaveImage() {
    if (!playerAreaRef.current) return;
    try {
      const dataUrl = await toPng(playerAreaRef.current, { cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'draft.png';
      a.click();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <main className="page-main">
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          🃏 ドラフト管理
        </h1>
      </div>

      {/* Search card */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px',
        marginBottom: '24px',
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
            placeholder="カード名・テーマ名を入力..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '8px',
              border: '1px solid #cbd5e1', fontSize: '1rem',
              outline: 'none', color: '#1e293b',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: searching ? '#94a3b8' : '#2563eb', color: '#fff',
              fontWeight: 600, fontSize: '0.9375rem', cursor: searching ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {searching ? '検索中...' : '検索'}
          </button>
        </div>
        {searchError && (
          <p style={{ color: '#f59e0b', fontSize: '0.875rem', marginTop: '8px' }}>{searchError}</p>
        )}
        {selectedCard && (
          <div style={{
            marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getImageUrl(selectedCard)} alt={selectedCard.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.9375rem', color: '#1d4ed8', fontWeight: 600 }}>{selectedCard.name}</span>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', marginLeft: 'auto' }}>↓ プレイヤー枠をクリックして追加</span>
            <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>
          </div>
        )}
      </div>

      {/* Player area */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px',
        marginBottom: '24px',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          👥 プレイヤーエリア
        </p>
        <div ref={playerAreaRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {state.players.map((player: Player, pi: number) => (
            <div
              key={pi}
              onClick={() => selectedCard && handleAddToPlayer(pi)}
              style={{
                background: selectedCard ? '#f0f9ff' : '#f8fafc',
                border: selectedCard ? '2px dashed #3b82f6' : '1px solid #e2e8f0',
                borderRadius: '10px', padding: '12px',
                minHeight: '160px', display: 'flex', flexDirection: 'column',
                cursor: selectedCard ? 'pointer' : 'default',
                transition: 'border 0.15s, background 0.15s',
              }}
            >
              {/* Player name */}
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                {editingPlayer === pi ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(pi);
                        if (e.key === 'Escape') setEditingPlayer(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1, padding: '4px 8px', borderRadius: '6px',
                        border: '1px solid #93c5fd', fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveName(pi); }}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: 'none',
                        background: '#2563eb', color: '#fff', fontSize: '0.75rem', cursor: 'pointer',
                      }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleStartEditName(pi, player.name); }}
                    style={{
                      fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b',
                      borderBottom: '2px dashed #cbd5e1', paddingBottom: '2px',
                      cursor: 'text',
                    }}
                    title="クリックで編集"
                  >
                    {player.name}
                  </span>
                )}
              </div>

              {/* Themes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {player.themes.map((theme: Theme, ti: number) => (
                  <div key={ti} style={{ position: 'relative' }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
                      if (btn) btn.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
                      if (btn) btn.style.opacity = '0';
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.imageUrl}
                      alt={theme.cardName}
                      style={{ width: '100%', borderRadius: '6px', display: 'block' }}
                      title={theme.cardName}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveTheme(pi, ti); }}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: '#ef4444', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '20px', height: '20px',
                        fontSize: '0.75rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.15s',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {player.themes.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', margin: 'auto 0' }}>
                    {selectedCard ? 'クリックして追加' : 'テーマなし'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
        <button
          onClick={handleSaveImage}
          style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            background: '#16a34a', color: '#fff', fontWeight: 600,
            fontSize: '0.9375rem', cursor: 'pointer',
          }}
        >
          📷 画像として保存
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 24px', borderRadius: '8px', border: '1px solid #fca5a5',
            background: '#fff', color: '#ef4444', fontWeight: 600,
            fontSize: '0.9375rem', cursor: 'pointer',
          }}
        >
          🗑️ リセット
        </button>
      </div>
      {saving && (
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>保存中...</p>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '14px', padding: '24px',
              width: 'min(92vw, 680px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', margin: 0 }}>
                検索結果 <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.875rem' }}>({searchResults.length}件)</span>
              </p>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '1.25rem', lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable card row */}
            <div style={{
              display: 'flex', gap: '10px',
              overflowX: 'auto', paddingBottom: '8px',
              WebkitOverflowScrolling: 'touch',
            }}>
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  title={card.name}
                  style={{
                    flexShrink: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '6px', borderRadius: '8px', border: '2px solid #e2e8f0',
                    transition: 'border-color 0.15s, transform 0.15s',
                    width: '120px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6';
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(card)}
                    alt={card.name}
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                    loading="lazy"
                  />
                  <span style={{
                    fontSize: '0.6875rem', color: '#475569', textAlign: 'center',
                    lineHeight: 1.3, wordBreak: 'break-all',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {card.name}
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              カードをクリックして選択
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
