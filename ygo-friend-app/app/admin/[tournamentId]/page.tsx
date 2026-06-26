'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import type { Tournament, TournamentFormat, TournamentStatus } from '@/app/types/tournament';

const FORMAT_LABEL: Record<TournamentFormat, string> = {
  individual: '個人戦',
  team: 'チーム戦',
};

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'upcoming', label: '開催前' },
  { value: 'ongoing', label: '開催中' },
  { value: 'finished', label: '終了' },
];

export default function TournamentAdminPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params);

  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Meta form state
  const [metaName, setMetaName] = useState('');
  const [metaFormat, setMetaFormat] = useState<TournamentFormat>('individual');
  const [metaStatus, setMetaStatus] = useState<TournamentStatus>('upcoming');
  const [metaWinner, setMetaWinner] = useState('');
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSaveMsg, setMetaSaveMsg] = useState('');

  useEffect(() => {
    fetch(`/api/tournaments/${tournamentId}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data: Tournament | null) => {
        if (data) {
          setTournament(data);
          setMetaName(data.name);
          setMetaFormat(data.format);
          setMetaStatus(data.status);
          setMetaWinner(data.winner ?? '');
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pinInput.trim()) { setPinError('PINを入力してください'); return; }
    setPin(pinInput);
    setPinVerified(true);
    setPinError('');
  }

  async function handleMetaSave(e: React.FormEvent) {
    e.preventDefault();
    setMetaSaving(true);
    setMetaSaveMsg('');
    const payload: Partial<Tournament> = {
      name: metaName,
      format: metaFormat,
      status: metaStatus,
      winner: metaStatus === 'finished' ? (metaWinner || null) : null,
    };
    const res = await fetch(`/api/tournaments/${tournamentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
      body: JSON.stringify(payload),
    });
    setMetaSaving(false);
    if (res.ok) {
      setTournament(prev => prev ? { ...prev, ...payload } : prev);
      setMetaSaveMsg('保存しました');
      setTimeout(() => setMetaSaveMsg(''), 3000);
    } else {
      const d = await res.json();
      setMetaSaveMsg(`エラー: ${d.error ?? '保存に失敗しました'}`);
    }
  }

  if (!pinVerified) {
    return (
      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link href="/admin" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>← 管理画面に戻る</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 1.5rem', color: '#1e293b' }}>
          🔧 大会設定
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

  if (loading) {
    return (
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p style={{ color: '#94a3b8' }}>読み込み中...</p>
      </main>
    );
  }

  if (notFound || !tournament) {
    return (
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
        <Link href="/admin" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>← 管理画面に戻る</Link>
        <p style={{ marginTop: '2rem', color: '#dc2626' }}>大会が見つかりません（ID: {tournamentId}）</p>
      </main>
    );
  }

  const isFinished = metaStatus === 'finished';

  return (
    <main style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/admin" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>← 管理画面に戻る</Link>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 1.5rem', color: '#1e293b' }}>
        🔧 {tournament.name} 設定
      </h1>

      {isFinished && (
        <div style={{
          background: '#fef9c3', border: '1px solid #fde047', borderRadius: '10px',
          padding: '12px 16px', marginBottom: '1.25rem', fontSize: '0.88rem', color: '#713f12',
        }}>
          ⚠ この大会は終了済みです。ステータスを変更すると編集が再開できます。
        </div>
      )}

      {/* メタ情報エリア */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '1rem' }}>大会メタ情報</h2>
        <form onSubmit={handleMetaSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>大会名</span>
            <input
              value={metaName}
              onChange={e => setMetaName(e.target.value)}
              disabled={isFinished}
              style={{
                padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                fontSize: '0.95rem', background: isFinished ? '#f1f5f9' : '#fff', color: isFinished ? '#94a3b8' : '#0f172a',
              }}
            />
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>大会形式</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              {(['individual', 'team'] as TournamentFormat[]).map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isFinished ? 'not-allowed' : 'pointer', fontSize: '0.95rem', color: isFinished ? '#94a3b8' : '#0f172a' }}>
                  <input type="radio" value={f} checked={metaFormat === f} onChange={() => setMetaFormat(f)} disabled={isFinished} />
                  {FORMAT_LABEL[f]}
                </label>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>ステータス</span>
            <select
              value={metaStatus}
              onChange={e => setMetaStatus(e.target.value as TournamentStatus)}
              style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
              優勝者 / 優勝チーム
              {!isFinished && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '6px' }}>（ステータスが「終了」のときのみ有効）</span>}
            </span>
            <input
              value={metaWinner}
              onChange={e => setMetaWinner(e.target.value)}
              disabled={!isFinished}
              placeholder={isFinished ? '優勝者名を入力' : 'ステータスを「終了」にすると入力できます'}
              style={{
                padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                fontSize: '0.95rem', background: !isFinished ? '#f1f5f9' : '#fff', color: !isFinished ? '#94a3b8' : '#0f172a',
              }}
            />
          </label>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
            アーカイブURL:{' '}
            <Link href={tournament.archiveUrl} style={{ color: '#2563eb', textDecoration: 'none' }}>
              {tournament.archiveUrl}
            </Link>
          </div>

          {metaSaveMsg && (
            <p style={{ color: metaSaveMsg.startsWith('エラー') ? '#dc2626' : '#16a34a', fontSize: '0.85rem' }}>
              {metaSaveMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={metaSaving}
            style={{
              padding: '10px', background: metaSaving ? '#93c5fd' : '#2563eb',
              color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600,
              cursor: metaSaving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', alignSelf: 'flex-start',
              minWidth: '120px',
            }}
          >
            {metaSaving ? '保存中...' : 'メタ情報を保存'}
          </button>
        </form>
      </div>

      {/* 大会データ設定エリア（将来の拡張用プレースホルダー） */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0',
        opacity: isFinished ? 0.5 : 1, pointerEvents: isFinished ? 'none' : 'auto',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: '0.75rem' }}>大会データ設定</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
          この大会の試合データ・セッション管理は{' '}
          <Link href="/tournament/admin" style={{ color: '#2563eb', textDecoration: 'none' }}>
            /tournament/admin
          </Link>{' '}
          から操作してください。
        </p>
      </div>
    </main>
  );
}
