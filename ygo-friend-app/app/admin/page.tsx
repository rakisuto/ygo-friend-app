'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Tournament, TournamentFormat, TournamentStatus } from '@/app/types/tournament';

const FORMAT_LABEL: Record<TournamentFormat, string> = {
  individual: '個人戦',
  team: 'チーム戦',
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  upcoming: '開催前',
  ongoing: '開催中',
  finished: '終了',
};

const STATUS_COLOR: Record<TournamentStatus, { bg: string; color: string }> = {
  upcoming: { bg: '#dbeafe', color: '#1e40af' },
  ongoing: { bg: '#dcfce7', color: '#166534' },
  finished: { bg: '#f1f5f9', color: '#64748b' },
};

export default function AdminIndexPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  // New tournament form
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newFormat, setNewFormat] = useState<TournamentFormat>('individual');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then((data: Tournament[]) => setTournaments(data))
      .catch(() => setTournaments([]))
      .finally(() => setLoading(false));
  }, []);

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pinInput.trim()) { setPinError('PINを入力してください'); return; }
    setPin(pinInput);
    setPinVerified(true);
    setPinError('');
  }

  async function handleAddTournament(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!newId.match(/^\d{4,6}$/)) {
      setFormError('大会IDは4〜6桁の数字で入力してください');
      return;
    }
    if (!newName.trim()) {
      setFormError('大会名を入力してください');
      return;
    }
    setSaving(true);
    const newTournament: Tournament = {
      id: newId,
      name: newName,
      format: newFormat,
      status: 'upcoming',
      winner: null,
      archiveUrl: `/tournamentlist/archive/${newId}`,
    };
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
      body: JSON.stringify(newTournament),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setFormError(data.error ?? '保存に失敗しました');
      return;
    }
    setTournaments(prev => [...prev, newTournament]);
    setShowModal(false);
    setNewId('');
    setNewName('');
    setNewFormat('individual');
  }

  if (!pinVerified) {
    return (
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>
          🔧 管理画面
        </h1>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <p style={{ marginBottom: '1rem', color: '#475569', fontSize: '0.9rem' }}>管理者PINを入力してください</p>
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="PIN"
              style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            />
            {pinError && <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>{pinError}</p>}
            <button
              type="submit"
              style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              認証
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>🔧 管理画面</h1>
        <button
          onClick={() => { setShowModal(true); setFormError(''); }}
          style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          ＋ 新規大会を追加
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>読み込み中...</p>
      ) : tournaments.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>大会がまだ登録されていません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...tournaments].reverse().map(t => {
            const sc = STATUS_COLOR[t.status];
            return (
              <div
                key={t.id}
                style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{t.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{FORMAT_LABEL[t.format]}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '99px', background: sc.bg, color: sc.color,
                    }}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </div>
                  {t.status === 'finished' && t.winner && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                      優勝: {t.winner}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/admin/${t.id}`)}
                  style={{
                    padding: '7px 14px', background: '#f1f5f9', color: '#334155',
                    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  設定へ ▶
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 新規大会追加モーダル */}
      {showModal && (
        <>
          <div
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            zIndex: 300, background: '#fff', borderRadius: '16px', padding: '1.5rem',
            width: 'min(480px, calc(100vw - 2rem))', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>新規大会を追加</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleAddTournament} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>大会ID（4〜6桁の数字）</span>
                <input
                  value={newId}
                  onChange={e => setNewId(e.target.value)}
                  placeholder="例: 202609"
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>大会名</span>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="例: 2026年9月大会"
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>大会形式</span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {(['individual', 'team'] as TournamentFormat[]).map(f => (
                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.95rem' }}>
                      <input type="radio" value={f} checked={newFormat === f} onChange={() => setNewFormat(f)} />
                      {FORMAT_LABEL[f]}
                    </label>
                  ))}
                </div>
              </label>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                アーカイブURL: <span style={{ color: '#334155' }}>/tournamentlist/archive/{newId || '……'}</span>
              </div>
              {formError && <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>{formError}</p>}
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px', background: saving ? '#93c5fd' : '#2563eb',
                  color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );
}
