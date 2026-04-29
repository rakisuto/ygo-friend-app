'use client';

import { useState, useEffect, useRef } from 'react';
import { generateSeason } from '@/lib/tournament/generator';
import type { Match, Season } from '../types';
import SessionTabs from '../components/SessionTabs';

type Mode = 'view' | 'generate';

// ── DateInput sub-component ──────────────────────────────────────────────────
function DateInput({ value, label, onChange }: { value: string; label: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '0.8125rem', color: '#64748b', width: '36px', flexShrink: 0 }}>{label}</span>
      <div
        style={{
          display: 'flex', alignItems: 'center',
          border: '1px solid #d1d5db', borderRadius: '8px',
          background: '#fff', overflow: 'hidden',
        }}
      >
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ padding: '8px 12px', border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9375rem', color: '#1e293b', cursor: 'pointer' }}
        />
        <button
          type="button"
          onClick={() => ref.current?.showPicker?.()}
          tabIndex={-1}
          title="カレンダーを開く"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', color: '#94a3b8', fontSize: '1rem' }}
        >
          📅
        </button>
      </div>
    </div>
  );
}

// ── HoverButton ──────────────────────────────────────────────────────────────
function HoverButton({
  onClick, disabled, children, variant = 'primary', style: extraStyle,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline-danger' | 'ghost';
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
    primary: {
      background: hover && !disabled ? '#1d4ed8' : '#2563eb',
      color: '#fff',
      boxShadow: hover && !disabled ? '0 4px 12px rgba(37,99,235,0.35)' : '0 1px 3px rgba(0,0,0,0.1)',
    },
    secondary: {
      background: hover && !disabled ? '#16a34a' : '#22c55e',
      color: '#fff',
      boxShadow: hover && !disabled ? '0 4px 12px rgba(34,197,94,0.35)' : '0 1px 3px rgba(0,0,0,0.1)',
    },
    danger: {
      background: hover && !disabled ? '#b91c1c' : '#dc2626',
      color: '#fff',
      boxShadow: hover && !disabled ? '0 4px 12px rgba(220,38,38,0.35)' : '0 1px 3px rgba(0,0,0,0.1)',
    },
    'outline-danger': {
      background: hover && !disabled ? '#fee2e2' : 'transparent',
      color: '#dc2626',
      border: '1px solid #fca5a5',
      boxShadow: 'none',
    },
    ghost: {
      background: hover && !disabled ? '#f1f5f9' : 'transparent',
      color: '#64748b',
      boxShadow: 'none',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...extraStyle }}
    >
      {children}
    </button>
  );
}

// ── Card component ───────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#fff', borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        padding: '24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [season, setSeason] = useState<Season | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>('view');

  const [seasonName, setSeasonName] = useState('');
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [dates, setDates] = useState(['', '', '', '']);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [description, setDescription] = useState('');
  const [descToast, setDescToast] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (season) setDescription(season.description ?? '');
  }, [season]);

  useEffect(() => {
    fetch('/api/tournament')
      .then(r => r.json())
      .then(data => setSeason(data ?? null))
      .catch(() => setSeason(null));
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
      headers: {
        'Content-Type': 'application/json',
        'x-admin-pin': pin,
        ...((options.headers as Record<string, string>) ?? {}),
      },
    });

  const handleGenerate = async () => {
    setGenError('');
    if (!seasonName.trim()) { setGenError('シーズン名を入力してください'); return; }
    if (playerNames.some(n => !n.trim())) { setGenError('プレイヤー名を4人分入力してください'); return; }
    if (dates.some(d => !d)) { setGenError('日程を4つ選択してください'); return; }

    setGenerating(true);
    try {
      const newSeason = generateSeason(playerNames.map(n => n.trim()), dates, seasonName.trim());
      const res = await adminFetch('/api/tournament', { method: 'POST', body: JSON.stringify(newSeason) });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setGenError(`保存に失敗しました: ${body.error ?? res.status}`);
        return;
      }
      setSeason(newSeason);
      setMode('view');
    } catch (e) {
      setGenError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSessionSave = async (sessionId: string, matches: Match[]) => {
    const res = await adminFetch(`/api/tournament/session/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ matches }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    setSeason(prev => prev ? { ...prev, sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, matches } : s) } : prev);
  };

  const handleDateChange = async (sessionId: string, date: string) => {
    const res = await adminFetch(`/api/tournament/session/${sessionId}`, { method: 'PATCH', body: JSON.stringify({ date }) });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    setSeason(prev => prev ? { ...prev, sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, date } : s) } : prev);
  };

  const handleDescriptionSave = async () => {
    setDescToast('saving');
    try {
      const res = await adminFetch('/api/tournament', { method: 'PATCH', body: JSON.stringify({ description: description.trim() }) });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) { setDescToast('error'); return; }
      setSeason(prev => prev ? { ...prev, description: description.trim() } : prev);
      setDescToast('saved');
    } catch {
      setDescToast('error');
    } finally {
      setTimeout(() => setDescToast('idle'), 2500);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await adminFetch('/api/tournament', { method: 'DELETE' });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) return;
      setSeason(null);
      setMode('view');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading ──
  if (season === undefined) {
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
          <h1 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
            ⚙️ 管理者ページ
          </h1>
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

  // ── Generate form ──
  if (mode === 'generate' || !season) {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>スケジュール生成</h1>
          {season && (
            <HoverButton onClick={() => setMode('view')} variant="ghost">
              ← キャンセル
            </HoverButton>
          )}
        </div>

        {genError && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#dc2626', fontSize: '0.875rem' }}>
            {genError}
          </div>
        )}

        <Card style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            シーズン名
          </label>
          <input
            value={seasonName}
            onChange={e => setSeasonName(e.target.value)}
            placeholder="例: Season 5"
            style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9375rem', outline: 'none', color: '#1e293b', boxSizing: 'border-box' }}
          />
        </Card>

        <Card style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            プレイヤー名（4人）
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playerNames.map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b', width: '24px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <input
                  value={name}
                  onChange={e => setPlayerNames(prev => prev.map((n, j) => j === i ? e.target.value : n))}
                  placeholder={`プレイヤー${i + 1}`}
                  style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '8px', padding: '9px 12px', fontSize: '0.9375rem', outline: 'none', color: '#1e293b' }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            開催日（4日程）
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dates.map((date, i) => (
              <DateInput
                key={i}
                label={`第${i + 1}回`}
                value={date}
                onChange={v => setDates(prev => prev.map((d, j) => j === i ? v : d))}
              />
            ))}
          </div>
        </Card>

        <HoverButton
          onClick={handleGenerate}
          disabled={generating}
          variant="secondary"
          style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
        >
          {generating ? '生成中...' : '🎯 スケジュールを生成・保存'}
        </HoverButton>
      </main>
    );
  }

  // ── View mode ──
  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <h1 className="reisho" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b' }}>
              {season.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
              参加プレイヤー: {season.players.map(p => p.name).join('・')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <HoverButton onClick={() => setMode('generate')} variant="outline-danger">
              🔄 再生成
            </HoverButton>
            <HoverButton onClick={() => setShowDeleteConfirm(true)} variant="danger">
              🗑️ 削除
            </HoverButton>
          </div>
        </div>

        {/* 大会概要 */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <label style={{
            display: 'block', fontSize: '0.8125rem', fontWeight: 700,
            color: '#374151', marginBottom: '10px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            📝 大会概要
          </label>
          <textarea
            value={description}
            onChange={e => {
              if (e.target.value.length <= 1000) setDescription(e.target.value);
            }}
            placeholder="大会のルール・使用禁止カード・その他メモなどを入力（1000文字以内）"
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1px solid #d1d5db', borderRadius: '8px',
              padding: '10px 14px', fontSize: '0.9375rem', lineHeight: '1.7',
              color: '#1e293b', background: '#f8fafc',
              resize: 'vertical', outline: 'none',
              fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: description.length >= 900 ? '#d97706' : '#94a3b8' }}>
              {description.length} / 1000 文字
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {descToast !== 'idle' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600,
                  ...(descToast === 'saving'
                    ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                    : descToast === 'saved'
                    ? { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
                    : { background: '#fff1f2', color: '#dc2626', border: '1px solid #fecdd3' }),
                }}>
                  {descToast === 'saving' && '⏳ 保存中...'}
                  {descToast === 'saved'  && '✅ 保存しました'}
                  {descToast === 'error'  && '❌ 保存に失敗しました'}
                </span>
              )}
              <HoverButton
                onClick={handleDescriptionSave}
                disabled={descToast === 'saving'}
                variant="primary"
                style={{ padding: '7px 20px' }}
              >
                保存
              </HoverButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Session tabs card */}
      <Card>
        <SessionTabs
          season={season}
          isAdmin
          onSessionSave={handleSessionSave}
          onDateChange={handleDateChange}
        />
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 500, padding: '1rem',
          }}
        >
          <Card style={{ maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              🗑️ スケジュールを削除
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9375rem', marginBottom: '8px' }}>
              <strong>{season.name}</strong> のすべてのデータを削除します。
            </p>
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '24px' }}>
              この操作は取り消せません。
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <HoverButton onClick={() => setShowDeleteConfirm(false)} variant="ghost">
                キャンセル
              </HoverButton>
              <HoverButton onClick={handleDelete} disabled={deleting} variant="danger">
                {deleting ? '削除中...' : '削除する'}
              </HoverButton>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
