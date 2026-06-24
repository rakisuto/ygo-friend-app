'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { DraftState, Theme, BanRule, DraftSession, SessionPlayer } from '@/app/types/draft';
import { initialDraftState } from '@/app/types/draft';

/* ─── ドラフト設定モーダル ─── */
function DraftSetupModal({
  banRules,
  onStart,
  onClose,
}: {
  banRules: BanRule[];
  onStart: (session: DraftSession) => void;
  onClose: () => void;
}) {
  const [playerCount, setPlayerCount] = useState(4);
  const [setups, setSetups] = useState<{ name: string; banRuleId: string | null }[]>([
    { name: 'Player1', banRuleId: null },
    { name: 'Player2', banRuleId: null },
    { name: 'Player3', banRuleId: null },
    { name: 'Player4', banRuleId: null },
  ]);
  const [totalRounds, setTotalRounds] = useState(2);

  function setCount(n: number) {
    setPlayerCount(n);
    setSetups(prev => {
      const next = [...prev];
      while (next.length < n) next.push({ name: `Player${next.length + 1}`, banRuleId: null });
      return next.slice(0, n);
    });
  }

  function updateSetup(i: number, field: 'name' | 'banRuleId', value: string | null) {
    setSetups(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  function handleStart() {
    if (!confirm('ドラフトを開始しますか？')) {
      onClose();
      return;
    }
    const players: SessionPlayer[] = setups.map(s => ({
      name: s.name.trim() || `Player${setups.indexOf(s) + 1}`,
      themes: [],
      banRuleId: s.banRuleId,
    }));
    const turnOrder = players.map((_, i) => i);
    const session: DraftSession = {
      isActive: true,
      currentRound: 1,
      totalRounds,
      currentTurnIndex: 0,
      turnOrder,
      players,
    };
    onStart(session);
  }

  const label: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' };
  const select: React.CSSProperties = { padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#1e293b', outline: 'none', background: '#fff' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f8fafc', borderRadius: '16px', width: 'min(94vw, 560px)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>🎴 ドラフト設定</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Player count */}
          <div>
            <span style={label}>プレイヤー数（2〜4人）</span>
            <select value={playerCount} onChange={e => setCount(Number(e.target.value))} style={select}>
              {[2, 3, 4].map(n => <option key={n} value={n}>{n}人</option>)}
            </select>
          </div>

          {/* Player setups */}
          <div>
            <span style={label}>プレイヤー設定</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {setups.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#fff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b', flexShrink: 0, width: '24px' }}>P{i + 1}</span>
                  <input
                    value={s.name}
                    onChange={e => updateSetup(i, 'name', e.target.value)}
                    placeholder={`Player${i + 1}`}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
                  />
                  <select value={s.banRuleId ?? ''} onChange={e => updateSetup(i, 'banRuleId', e.target.value || null)} style={{ ...select, flexShrink: 0 }}>
                    <option value="">BANなし</option>
                    {banRules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div>
            <span style={label}>ドラフト巡数（1〜10巡）</span>
            <select value={totalRounds} onChange={e => setTotalRounds(Number(e.target.value))} style={select}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}巡</option>)}
            </select>
          </div>

          {/* Order preview */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 14px' }}>
            <p style={{ ...label, marginBottom: '6px' }}>ドラフト順番（固定型）</p>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
              {setups.map((s, i) => `P${i + 1}(${s.name.trim() || `Player${i + 1}`})`).join(' → ')} を{totalRounds}巡繰り返す
            </p>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
          <button
            onClick={handleStart}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
          >
            開始しますか？
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── メインページ ─── */
export default function DraftPage() {
  const [candidateThemes, setCandidateThemes] = useState<Theme[]>([]);
  const [banRules, setBanRules] = useState<BanRule[]>([]);
  const [session, setSession] = useState<DraftSession | null>(null);
  const [state, setState] = useState<DraftState>(initialDraftState);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const playerAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/draft/state').then(r => r.json()),
      fetch('/api/draft/themes').then(r => r.json()),
      fetch('/api/draft/ban-rules').then(r => r.json()),
      fetch('/api/draft/session').then(r => r.json()),
    ]).then(([stateData, themesData, rulesData, sessionData]) => {
      setCandidateThemes((themesData as Theme[]) ?? []);
      setBanRules((rulesData as BanRule[]) ?? []);
      if (sessionData && (sessionData as DraftSession).isActive !== undefined) {
        const s = sessionData as DraftSession;
        setSession(s);
        if (!s.isActive && s.currentTurnIndex > 0) setIsDone(true);
        // Sync state from session players
        setState({ players: s.players.map(p => ({ name: p.name, themes: p.themes })) });
      } else if (stateData) {
        setState(stateData as DraftState);
      }
    }).catch(() => {});
  }, []);

  // Derived values when session is active
  const isSessionActive = session?.isActive ?? false;
  const playerCount = session?.turnOrder.length ?? 0;
  const currentPlayerIdx = isSessionActive
    ? session!.turnOrder[session!.currentTurnIndex % session!.turnOrder.length]
    : -1;
  const currentRound = session?.currentRound ?? 1;
  const totalRounds = session?.totalRounds ?? 1;

  // BAN card IDs for current player
  const currentBanRuleId = isSessionActive ? (session!.players[currentPlayerIdx]?.banRuleId ?? null) : null;
  const currentBanRule = currentBanRuleId ? banRules.find(r => r.id === currentBanRuleId) ?? null : null;
  const bannedIds = new Set(currentBanRule?.bannedCardIds ?? []);

  // Already assigned IDs (across all players)
  const assignedIds = new Set(
    (isSessionActive ? session!.players : state.players).flatMap(p => p.themes.map(t => t.cardId))
  );

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function persistState(next: DraftState) {
    setState(next);
    setSaving(true);
    try {
      await fetch('/api/draft/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
    } finally { setSaving(false); }
  }

  async function persistSession(next: DraftSession) {
    setSession(next);
    await fetch('/api/draft/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) });
  }

  async function handleStartSession(newSession: DraftSession) {
    setSetupModalOpen(false);
    setIsDone(false);
    setSelectedTheme(null);
    // Reset state with new player names
    const newState: DraftState = { players: newSession.players.map(p => ({ name: p.name, themes: [] })) };
    await persistState(newState);
    await persistSession(newSession);
    setState(newState);
  }

  function handleSelectCandidate(theme: Theme) {
    if (assignedIds.has(theme.cardId)) return;
    if (isSessionActive && bannedIds.has(theme.cardId)) { showToast('このテーマは現在のプレイヤーのBANルールにより選択できません'); return; }
    setSelectedTheme(prev => prev?.cardId === theme.cardId ? null : theme);
  }

  async function handleAddToPlayer(playerIndex: number) {
    if (!selectedTheme) { showToast('テーマを選択してください'); return; }

    // Session mode: only current player can add
    if (isSessionActive && playerIndex !== currentPlayerIdx) {
      showToast(`今は ${session!.players[currentPlayerIdx].name} の番です`);
      return;
    }

    const players = isSessionActive ? session!.players : state.players;
    if (players[playerIndex].themes.some(t => t.cardId === selectedTheme.cardId)) {
      showToast('すでに追加済みです');
      return;
    }

    // Update state
    const newState: DraftState = {
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: [...p.themes, selectedTheme] } : p
      ),
    };
    await persistState(newState);
    setSelectedTheme(null);

    if (isSessionActive) {
      // Update session
      const updatedPlayers: SessionPlayer[] = session!.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: [...p.themes, selectedTheme] } : p
      );
      const nextTurnIndex = session!.currentTurnIndex + 1;
      const totalPicks = session!.totalRounds * playerCount;
      const isComplete = nextTurnIndex >= totalPicks;
      const nextRound = Math.floor(nextTurnIndex / playerCount) + 1;

      const nextSession: DraftSession = {
        ...session!,
        players: updatedPlayers,
        currentTurnIndex: nextTurnIndex,
        currentRound: Math.min(nextRound, session!.totalRounds),
        isActive: !isComplete,
      };
      await persistSession(nextSession);
      if (isComplete) {
        setIsDone(true);
        showToast('🎉 ドラフト終了！');
      }
    }
  }

  function handleRemoveTheme(playerIndex: number, themeIndex: number) {
    const next: DraftState = {
      players: state.players.map((p, i) =>
        i === playerIndex ? { ...p, themes: p.themes.filter((_, ti) => ti !== themeIndex) } : p
      ),
    };
    persistState(next);
    // Also update session if active
    if (session) {
      const nextSession: DraftSession = {
        ...session,
        players: session.players.map((p, i) =>
          i === playerIndex ? { ...p, themes: p.themes.filter((_, ti) => ti !== themeIndex) } : p
        ),
      };
      persistSession(nextSession);
    }
  }

  function handleSaveName(playerIndex: number) {
    const next: DraftState = {
      players: state.players.map((p, i) => i === playerIndex ? { ...p, name: editingName || p.name } : p),
    };
    persistState(next);
    setEditingPlayer(null);
  }

  async function handleReset() {
    if (!confirm('ドラフト状態をリセットしますか？（候補リストは残ります）')) return;
    await Promise.all([
      fetch('/api/draft/state', { method: 'DELETE' }),
      fetch('/api/draft/session', { method: 'DELETE' }),
    ]);
    setState(initialDraftState);
    setSession(null);
    setSelectedTheme(null);
    setIsDone(false);
  }

  async function handleSaveImage() {
    const el = playerAreaRef.current;
    if (!el) return;
    try {
      const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
      const origSrcs = imgs.map(img => img.src);
      imgs.forEach(img => {
        if (img.src.startsWith('http')) img.src = `/api/image-proxy?url=${encodeURIComponent(img.src)}`;
      });
      await Promise.all(imgs.map(img => new Promise<void>(resolve => {
        if (img.complete) { resolve(); return; }
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })));
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: '#f8fafc' });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'draft.png';
      a.click();
      imgs.forEach((img, i) => { img.src = origSrcs[i]; });
    } catch (e) { console.error(e); }
  }

  // Display players (from state, which is synced)
  const displayPlayers = state.players;

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>🎴 ドラフト</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isSessionActive && !isDone && (
            <button
              onClick={() => setSetupModalOpen(true)}
              style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer' }}
            >
              🎯 選択開始
            </button>
          )}
          <Link href="/draft/draft-settings" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
            ⚙ 設定
          </Link>
        </div>
      </div>

      {/* Turn indicator */}
      {isSessionActive && (
        <div style={{
          background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          borderRadius: '12px', padding: '16px 24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', margin: '0 0 4px 0' }}>
              {currentRound}巡目 / 全{totalRounds}巡
            </p>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>
              {session!.players[currentPlayerIdx]?.name} の番です
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: '0 0 2px 0' }}>進捗</p>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>
              {session!.currentTurnIndex} / {totalRounds * playerCount} 選択完了
            </p>
          </div>
        </div>
      )}

      {/* Draft done banner */}
      {isDone && (
        <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px', color: '#fff', textAlign: 'center', fontWeight: 700, fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
          🎉 ドラフト終了！「画像として保存」でシェアしよう
        </div>
      )}

      {/* Candidate themes */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>🃏 テーマ候補</p>

        {candidateThemes.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9375rem', textAlign: 'center', padding: '16px 0' }}>
            <Link href="/draft/draft-settings" style={{ color: '#2563eb' }}>⚙ 設定</Link> でテーマを追加してください
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {candidateThemes.map(theme => {
              const isAssigned = assignedIds.has(theme.cardId);
              const isBanned = isSessionActive && bannedIds.has(theme.cardId);
              const isSelected = selectedTheme?.cardId === theme.cardId;
              const isDisabled = isAssigned || isBanned;
              return (
                <div
                  key={theme.cardId}
                  onClick={() => handleSelectCandidate(theme)}
                  title={isBanned ? `🚫 ${session!.players[currentPlayerIdx]?.name} のBANテーマ` : theme.cardName}
                  style={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderRadius: '8px', overflow: 'hidden', position: 'relative',
                    border: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                    boxShadow: isSelected ? '0 0 0 2px #bfdbfe' : 'none',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.imageUrl}
                    alt={theme.cardName}
                    style={{
                      width: '80px', height: '80px', objectFit: 'cover', display: 'block',
                      opacity: isDisabled ? 0.25 : 1,
                      filter: isDisabled ? 'grayscale(80%)' : 'none',
                      transition: 'opacity 0.2s, filter 0.2s',
                    }}
                  />
                  {isBanned && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.15)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚫</span>
                    </div>
                  )}
                  {isAssigned && !isBanned && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(148,163,184,0.4)', borderRadius: '6px' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedTheme && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedTheme.imageUrl} alt={selectedTheme.cardName} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.9375rem', color: '#1d4ed8', fontWeight: 600 }}>{selectedTheme.cardName}</span>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', marginLeft: 'auto' }}>
              {isSessionActive ? `「追加 ▼」で ${session!.players[currentPlayerIdx]?.name} に追加` : '「追加 ▼」でプレイヤーに割り当て'}
            </span>
            <button onClick={() => setSelectedTheme(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>
          </div>
        )}
      </div>

      {/* Player area */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>👥 プレイヤーエリア</p>
        <div
          ref={playerAreaRef}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${displayPlayers.length}, 1fr)`, gap: '16px' }}
        >
          {displayPlayers.map((player, pi) => {
            const isCurrentTurn = isSessionActive && pi === currentPlayerIdx;
            return (
              <div
                key={pi}
                style={{
                  background: isCurrentTurn ? '#eff6ff' : '#f8fafc',
                  border: isCurrentTurn ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '10px', padding: '12px',
                  minHeight: '200px', display: 'flex', flexDirection: 'column',
                  transition: 'border 0.2s, background 0.2s',
                }}
              >
                {/* Player name */}
                <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                  {isCurrentTurn && (
                    <div style={{ fontSize: '0.6875rem', color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>▶ 選択中</div>
                  )}
                  {editingPlayer === pi ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(pi); if (e.key === 'Escape') setEditingPlayer(null); }}
                        style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem', outline: 'none' }} />
                      <button onClick={() => handleSaveName(pi)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>OK</button>
                    </div>
                  ) : (
                    <span onClick={() => { setEditingPlayer(pi); setEditingName(player.name); }}
                      style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b', borderBottom: '2px dashed #cbd5e1', paddingBottom: '2px', cursor: 'text' }}
                      title="クリックで編集">
                      {player.name}
                    </span>
                  )}
                  {/* BAN rule badge */}
                  {isSessionActive && session!.players[pi]?.banRuleId && (
                    <div style={{ fontSize: '0.6875rem', color: '#dc2626', marginTop: '4px' }}>
                      🚫 {banRules.find(r => r.id === session!.players[pi].banRuleId)?.name ?? 'BANあり'}
                    </div>
                  )}
                </div>

                {/* Assigned themes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                  {player.themes.map((theme, ti) => (
                    <div key={ti}
                      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                      onMouseEnter={e => {
                        const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
                        if (btn) btn.style.opacity = '1';
                      }}
                      onMouseLeave={e => {
                        const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
                        if (btn) btn.style.opacity = '0';
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={theme.imageUrl} alt={theme.cardName}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
                        title={theme.cardName} />
                      <span style={{ fontSize: '0.6875rem', color: '#475569', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-all', maxWidth: '80px' }}>
                        {theme.cardName}
                      </span>
                      <button onClick={() => handleRemoveTheme(pi, ti)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}>
                        ×
                      </button>
                    </div>
                  ))}
                  {player.themes.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', width: '100%', margin: 'auto 0' }}>テーマなし</p>
                  )}
                </div>

                {/* Add button */}
                <button onClick={() => handleAddToPlayer(pi)}
                  style={{
                    marginTop: '10px', padding: '6px', borderRadius: '6px',
                    border: `1px dashed ${isCurrentTurn ? '#3b82f6' : '#93c5fd'}`,
                    background: selectedTheme ? (isCurrentTurn ? '#dbeafe' : '#eff6ff') : '#f1f5f9',
                    color: selectedTheme ? '#1d4ed8' : '#94a3b8',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  追加 ▼
                </button>
              </div>
            );
          })}
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
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9375rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* Setup modal */}
      {setupModalOpen && (
        <DraftSetupModal
          banRules={banRules}
          onStart={handleStartSession}
          onClose={() => setSetupModalOpen(false)}
        />
      )}
    </div>
  );
}
