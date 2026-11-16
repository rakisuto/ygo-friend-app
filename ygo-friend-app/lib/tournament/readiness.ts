import type { Match, DeckImageMap, DeckImageLibrary } from '@/app/tournament/types';

/** デッキ名に画像が紐づいている(紐づけ先のプリセットが存在し、画像が1枚以上ある)か */
export function hasDeckImage(deckName: string, deckImages: DeckImageMap, library: DeckImageLibrary): boolean {
  const presetId = deckImages[deckName.trim()];
  if (!presetId) return false;
  const preset = library.find(p => p.id === presetId);
  return !!preset && preset.layers.length > 0;
}

/**
 * 試合を確定・アナウンスできない理由の一覧(空なら問題なし)。
 * 確定とアナウンスで同じ条件を使う: 先攻/後攻が決まっている・両デッキ名が入力済み・両デッキに画像が設定済み・勝者が入力済み。
 */
export function matchIssues(m: Match, deckImages: DeckImageMap, library: DeckImageLibrary): string[] {
  const issues: string[] = [];
  if (!m.winnerId) issues.push('勝者が未入力');
  if (m.firstUndecided) issues.push('先攻・後攻が未定');

  const decks: [string, string | null][] = [['先攻', m.firstPlayerDeck], ['後攻', m.secondPlayerDeck]];
  for (const [side, deck] of decks) {
    if (!deck?.trim()) {
      issues.push(`${side}のデッキ名が未入力`);
    } else if (!hasDeckImage(deck, deckImages, library)) {
      issues.push(`${side}のデッキ画像が未設定`);
    }
  }
  return issues;
}
