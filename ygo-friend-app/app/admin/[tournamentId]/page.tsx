'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { TOURNAMENTS } from '@/data/tournaments';
import type { TournamentMeta, TournamentStatus } from '@/app/types/tournament';

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'upcoming', label: '開催前' },
  { value: 'ongoing', label: '開催中' },
  { value: 'finished', label: '終了' },
];

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', padding: '24px', ...style }}>
      {children}
    </div>
  );
}

export default function TournamentAdminPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params);
  const tournament = TOURNAMENTS.find(t => t.id === tournamentId);

  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [meta, setMeta] = useState<TournamentMeta>({ status: 'upcoming', winner: null });
  const [metaStatus, setMetaStatus] = useState<TournamentStatus>('upcoming');
  const [metaWinner, setMetaWinner] = useState('');
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaveMsg, setMetaSaveMsg] = useState('');

  useEffect(() => {
    if (!tournament) return;
    fetch(`/api/tournaments/${tournamentId}/meta`)
      .then(r => r.json())
      .then((data: TournamentMeta) => {
        setMeta(data);
        setMetaStatus(data.status);
        setMetaWinner(data.winner ?? '');
      })
      .catch(() => {});
  }, [tournamentId, tournament]);

  if (!tournament) {
    return (
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link href="/admin" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>← 管理画面に戻る</Link>
        <p style={{ marginTop: '2rem', color: '#dc2626' }}>大会が見つかりません（ID: {tournamentId}）</p>
      </main>
    );
  }

  const handlePinSubmit = () => {
    if (!pinInput.trim()) return;
    setPin(pinInput.trim());
    setPinError('');
  };

  const handleMetaSave = async () => {
    setMetaSaving(true);
    setMetaSaveMsg('');
    const payload: TournamentMeta = {
      status: metaStatus,
      winner: metaStatus === 'finished' ? (metaWinner.trim() || null) : null,
    };
    const res = await fetch(`/api/tournaments/${tournamentId}/meta`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
      body: JSON.stringify(payload),
    });
    setMetaSaving(false);
    if (res.ok) {
      setMeta(payload);
      setMetaWinner(payload.winner ?? '');
      setMetaSaveMsg('保存しました');
      setTimeout(() => setMetaSaveMsg(''), 3000);
    } else {
      setMetaSaveMsg('保存に失敗しました');
    }
  };

  const isFinished = meta.status === 'finished';

  if (!pin) {
    return (
      <main style={{ maxWidth: '400px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <Card>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>⚙️ 管理者ページ</h1>
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
            <button
              onClick={handlePinSubmit}
              style={{ padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}
            >
              ログイン
            </button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <Link href="/admin" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>← 管理画面に戻る</Link>

      <Card style={{ marginTop: '20px' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '16px' }}>
          📋 {tournament.name} — メタ情報
        </h2>

        {isFinished && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.875rem', color: '#713f12' }}>
            ⚠ この大会は終了済みです。ステータスを変更すると編集が再開できます。
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>大会名</span>
          <span style={{ fontSize: '0.95rem', color: '#1e293b' }}>{tournament.name}</span>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>大会形式</span>
          <span style={{ fontSize: '0.95rem', color: '#1e293b' }}>{tournament.format === 'team' ? 'チーム戦' : '個人戦'}</span>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>ステータス</span>
          <select
            value={metaStatus}
            onChange={e => setMetaStatus(e.target.value as TournamentStatus)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff', width: 'fit-content' }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            {tournament.format === 'team' ? '優勝チーム' : '優勝者'}
          </span>
          <input
            value={metaWinner}
            onChange={e => setMetaWinner(e.target.value)}
            disabled={metaStatus !== 'finished'}
            placeholder={metaStatus !== 'finished' ? 'ステータスを「終了」にすると入力できます' : '名前を入力'}
            style={{
              padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1',
              fontSize: '0.9rem', background: metaStatus !== 'finished' ? '#f1f5f9' : '#fff',
              color: metaStatus !== 'finished' ? '#94a3b8' : '#0f172a', width: '100%', boxSizing: 'border-box',
            }}
          />

          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>アーカイブURL</span>
          <Link href={tournament.archiveUrl} style={{ color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none' }}>
            {tournament.archiveUrl} →
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleMetaSave}
            disabled={metaSaving}
            style={{ padding: '8px 20px', background: metaSaving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: metaSaving ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
          >
            {metaSaving ? '保存中...' : 'メタ情報を保存'}
          </button>
          {metaSaveMsg && (
            <span style={{ fontSize: '0.85rem', color: metaSaveMsg.includes('失敗') ? '#dc2626' : '#16a34a' }}>
              {metaSaveMsg}
            </span>
          )}
        </div>
      </Card>

      {/* 大会データ設定エリア */}
      <Card style={{ marginTop: '16px', opacity: isFinished ? 0.5 : 1, pointerEvents: isFinished ? 'none' : 'auto' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>大会データ設定</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          この大会（{tournament.name}）のデータ管理画面は今後実装予定です。
        </p>
      </Card>
    </main>
  );
}
