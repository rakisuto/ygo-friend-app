'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toPng } from 'html-to-image';
import type { DraftState, Theme, Player } from '@/app/types/draft';
import { initialDraftState } from '@/app/types/draft';

export default function DraftPage() {
  const [state, setState] = useState<DraftState>(initialDraftState);
  const [candidateThemes, setCandidateThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const playerAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/draft/state').then((r) => r.json()),
      fetch('/api/draft/themes').then((r) => r.json()),
    ]).then(([stateData, themesData]) => {
      if (stateData) setState(stateData as DraftState);
      setCandidateThemes((themesData as Theme[]) ?? []);
    }).catch(() => {});
  }, []);

  // cardIds already assigned to any player
  const assignedIds = new Set(state.players.flatMap((p) => p.themes.map((t) => t.cardId)));

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function persistState(next: DraftState) {
    setState(next);
    setSaving(true);
    try {
      await fetch('/api/draft/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleSelectCandidate(theme: Theme) {
    if (assignedIds.has(theme.cardId)) return;
    setSelectedTheme((prev) => prev?.cardId === theme.cardId ? null : theme);
  }

  function handleAddToPlayer(playerIndex: number) {
    if (!selectedTheme) { showToast('テーマを選択してください'); return; }
    const player = state.players[playerIndex];
    if (player.themes.some((t) => t.cardId === selectedTheme.cardId)) { showToast('すでに追加済みです'); return; }
    persistState({
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: [...p.themes, selectedTheme] } : p
      ),
    });
    setSelectedTheme(null);
  }

  function handleRemoveTheme(playerIndex: number, themeIndex: number) {
    persistState({
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: p.themes.filter((_, ti) => ti !== themeIndex) } : p
      ),
    });
  }

  function handleSaveName(playerIndex: number) {
    persistState({
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, name: editingName || p.name } : p
      ),
    });
    setEditingPlayer(null);
  }

  async function handleReset() {
    if (!confirm('ドラフト状態をリセットしますか？（候補リストは残ります）')) return;
    await fetch('/api/draft/state', { method: 'DELETE' });
    setState(initialDraftState);
    setSelectedTheme(null);
  }

  async function handleSaveImage() {
    if (!playerAreaRef.current) return;
    try {
      const dataUrl = await toPng(playerAreaRef.current, { cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'draft.png';
      a.click();
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          🎴 ドラフト
        </h1>
        <Link
          href="/draft/draft-settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0',
            background: '#fff', color: '#475569', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          }}
        >
          ⚙ 設定
        </Link>
      </div>

      {/* Candidate themes */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          🃏 テーマ候補
        </p>

        {candidateThemes.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem', textAlign: 'center', padding: '16px 0' }}>
            <Link href="/draft/draft-settings" style={{ color: '#2563eb' }}>⚙ 設定</Link> でテーマを追加してください
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {candidateThemes.map((theme) => {
              const isAssigned = assignedIds.has(theme.cardId);
              const isSelected = selectedTheme?.cardId === theme.cardId;
              return (
                <div
                  key={theme.cardId}
                  onClick={() => handleSelectCandidate(theme)}
                  title={theme.cardName}
                  style={{
                    cursor: isAssigned ? 'default' : 'pointer',
                    borderRadius: '8px', overflow: 'hidden',
                    border: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                    boxShadow: isSelected ? '0 0 0 2px #bfdbfe' : 'none',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.imageUrl}
                    alt={theme.cardName}
                    style={{
                      width: '80px', height: '80px', objectFit: 'cover', display: 'block',
                      opacity: isAssigned ? 0.3 : 1,
                      filter: isAssigned ? 'grayscale(80%)' : 'none',
                      transition: 'opacity 0.2s, filter 0.2s',
                    }}
                  />
                  {isAssigned && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(148,163,184,0.45)',
                      borderRadius: '6px',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedTheme && (
          <div style={{
            marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedTheme.imageUrl} alt={selectedTheme.cardName} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.9375rem', color: '#1d4ed8', fontWeight: 600 }}>{selectedTheme.cardName}</span>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', marginLeft: 'auto' }}>↓ 「追加」ボタンでプレイヤーに割り当て</span>
            <button onClick={() => setSelectedTheme(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>
          </div>
        )}
      </div>

      {/* Player area */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px',
      }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          👥 プレイヤーエリア
        </p>
        <div ref={playerAreaRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {state.players.map((player: Player, pi: number) => (
            <div
              key={pi}
              style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: '10px', padding: '12px',
                minHeight: '200px', display: 'flex', flexDirection: 'column',
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
                      style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <button onClick={() => handleSaveName(pi)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>OK</button>
                  </div>
                ) : (
                  <span
                    onClick={() => { setEditingPlayer(pi); setEditingName(player.name); }}
                    style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b', borderBottom: '2px dashed #cbd5e1', paddingBottom: '2px', cursor: 'text' }}
                    title="クリックで編集"
                  >
                    {player.name}
                  </span>
                )}
              </div>

              {/* Assigned themes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                {player.themes.map((theme: Theme, ti: number) => (
                  <div
                    key={ti}
                    style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
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
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
                      title={theme.cardName}
                    />
                    <span style={{ fontSize: '0.6875rem', color: '#475569', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-all', maxWidth: '80px' }}>
                      {theme.cardName}
                    </span>
                    <button
                      onClick={() => handleRemoveTheme(pi, ti)}
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        background: '#ef4444', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '0.6875rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.15s',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {player.themes.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', width: '100%', margin: 'auto 0' }}>テーマなし</p>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => handleAddToPlayer(pi)}
                style={{
                  marginTop: '10px', padding: '6px', borderRadius: '6px',
                  border: '1px dashed #93c5fd',
                  background: selectedTheme ? '#eff6ff' : '#f1f5f9',
                  color: selectedTheme ? '#1d4ed8' : '#94a3b8',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                追加 ▼
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={handleSaveImage} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}>
          📷 画像として保存
        </button>
        <button onClick={handleReset} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#ef4444', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer' }}>
          🗑️ リセット
        </button>
      </div>
      {saving && <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>保存中...</p>}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: '8px',
          fontSize: '0.9375rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
