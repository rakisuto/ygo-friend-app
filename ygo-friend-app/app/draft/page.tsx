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
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) throw new Error('Not found');
      const json: YgoApiResponse = await res.json();
      const cards = json.data?.slice(0, 20) ?? [];
      if (cards.length === 0) setSearchError('該当するカードが見つかりませんでした');
      setSearchResults(cards);
    } catch {
      setSearchError('該当するカードが見つかりませんでした');
    } finally {
      setSearching(false);
    }
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">ドラフト管理</h1>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="テーマ名を入力..."
          className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
        >
          {searching ? '検索中...' : '検索'}
        </button>
      </div>

      {/* Search results */}
      {searchError && <p className="text-yellow-400 mb-4">{searchError}</p>}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">
            {selectedCard
              ? `選択中: ${selectedCard.name} — プレイヤー枠をクリックして追加`
              : 'カードをクリックして選択'}
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {searchResults.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                className={`cursor-pointer rounded overflow-hidden border-2 transition-all ${
                  selectedCard?.id === card.id
                    ? 'border-blue-400 scale-105'
                    : 'border-transparent hover:border-gray-500'
                }`}
                title={card.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(card)}
                  alt={card.name}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player area */}
      <div ref={playerAreaRef} className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="text-center text-lg font-semibold mb-4 text-gray-300">プレイヤーエリア</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {state.players.map((player: Player, pi: number) => (
            <div
              key={pi}
              onClick={() => selectedCard && handleAddToPlayer(pi)}
              className={`bg-gray-700 rounded-lg p-3 min-h-40 flex flex-col ${
                selectedCard ? 'cursor-pointer ring-2 ring-blue-400 hover:ring-blue-300' : ''
              }`}
            >
              {/* Player name */}
              <div className="mb-3 text-center">
                {editingPlayer === pi ? (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName(pi);
                        if (e.key === 'Escape') setEditingPlayer(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-2 py-1 rounded bg-gray-600 text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveName(pi); }}
                      className="px-2 py-1 bg-blue-600 rounded text-xs"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleStartEditName(pi, player.name); }}
                    className="font-bold text-sm cursor-pointer hover:text-blue-300 border-b border-dashed border-gray-500"
                    title="クリックで編集"
                  >
                    {player.name}
                  </span>
                )}
              </div>

              {/* Themes */}
              <div className="flex flex-col gap-2 flex-1">
                {player.themes.map((theme: Theme, ti: number) => (
                  <div key={ti} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.imageUrl}
                      alt={theme.cardName}
                      className="w-full h-auto rounded"
                      title={theme.cardName}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveTheme(pi, ti); }}
                      className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {player.themes.length === 0 && (
                  <p className="text-xs text-gray-500 text-center mt-auto">テーマなし</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleSaveImage}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
        >
          画像として保存
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-700 hover:bg-red-800 rounded font-semibold"
        >
          リセット
        </button>
      </div>

      {saving && (
        <p className="text-center text-xs text-gray-500 mt-2">保存中...</p>
      )}
    </div>
  );
}
