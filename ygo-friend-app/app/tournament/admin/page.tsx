'use client';

import { useState, useEffect, useRef } from 'react';
import { generateSeason } from '@/lib/tournament/generator';
import type { Match, Season } from '../types';
import SessionTabs from '../components/SessionTabs';

type Mode = 'view' | 'generate';

function DateInput({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500 w-10">{label}</span>
      <div className="flex items-center border border-gray-300 rounded focus-within:border-blue-400">
        <input
          ref={ref}
          type="date"
          className="px-3 py-2 focus:outline-none bg-transparent"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => ref.current?.showPicker?.()}
          className="px-2 py-2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
          title="カレンダーを開く"
        >
          📅
        </button>
      </div>
    </div>
  );
}

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
      const newSeason = generateSeason(
        playerNames.map(n => n.trim()),
        dates,
        seasonName.trim()
      );
      const res = await adminFetch('/api/tournament', {
        method: 'POST',
        body: JSON.stringify(newSeason),
      });
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
    const res = await adminFetch(`/api/tournament/session/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ matches }),
    });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    setSeason(prev =>
      prev
        ? { ...prev, sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, matches } : s) }
        : prev
    );
  };

  const handleDateChange = async (sessionId: string, date: string) => {
    const res = await adminFetch(`/api/tournament/session/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ date }),
    });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    setSeason(prev =>
      prev
        ? { ...prev, sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, date } : s) }
        : prev
    );
  };

  if (season === undefined) {
    return (
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ color: '#94a3b8' }}>読み込み中...</p>
      </main>
    );
  }

  if (!pin) {
    return (
      <main style={{ maxWidth: '400px', margin: '5rem auto 0', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>管理者ページ</h1>
        {pinError && <p className="text-red-500 text-sm mb-3">{pinError}</p>}
        <div className="flex flex-col gap-3">
          <input
            type="password"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
            placeholder="管理者PIN"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            autoFocus
          />
          <button
            onClick={handlePinSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </div>
      </main>
    );
  }

  if (mode === 'generate' || !season) {
    return (
      <main style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">スケジュール生成</h1>
          {season && (
            <button
              onClick={() => setMode('view')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← キャンセル
            </button>
          )}
        </div>

        {genError && (
          <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded">{genError}</p>
        )}

        <section className="mb-6">
          <label className="block text-sm font-semibold mb-2">シーズン名</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
            value={seasonName}
            onChange={e => setSeasonName(e.target.value)}
            placeholder="例: Season 5"
          />
        </section>

        <section className="mb-6">
          <label className="block text-sm font-semibold mb-2">プレイヤー名（4人）</label>
          <div className="flex flex-col gap-2">
            {playerNames.map((name, i) => (
              <input
                key={i}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                value={name}
                onChange={e =>
                  setPlayerNames(prev => prev.map((n, j) => (j === i ? e.target.value : n)))
                }
                placeholder={`プレイヤー${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <label className="block text-sm font-semibold mb-2">開催日（4日程）</label>
          <div className="flex flex-col gap-2">
            {dates.map((date, i) => (
              <DateInput
                key={i}
                label={`第${i + 1}回`}
                value={date}
                onChange={v => setDates(prev => prev.map((d, j) => (j === i ? v : d)))}
              />
            ))}
          </div>
        </section>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {generating ? '生成中...' : 'スケジュールを生成・保存'}
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="reisho" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>{season.name}</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            参加プレイヤー: {season.players.map(p => p.name).join('・')}
          </p>
        </div>
        <button
          onClick={() => setMode('generate')}
          style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '0.375rem', background: 'transparent', cursor: 'pointer' }}
        >
          再生成
        </button>
      </div>

      <SessionTabs
        season={season}
        isAdmin
        onSessionSave={handleSessionSave}
        onDateChange={handleDateChange}
      />
    </main>
  );
}
