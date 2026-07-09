import { kv } from '@/lib/kv';
import type { Season, DeckImageMap } from '@/app/tournament/types';
import ArchiveTabs from './ArchiveTabs';

export const revalidate = 0;

type Tab = 'result' | 'player' | 'overall';
const VALID_TABS: Tab[] = ['result', 'player', 'overall'];

function parseTab(raw: string | undefined): Tab {
  if (raw && (VALID_TABS as string[]).includes(raw)) return raw as Tab;
  return 'result';
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Archive202607Page({ searchParams }: PageProps) {
  const { tab: rawTab } = await searchParams;
  const activeTab = parseTab(rawTab);

  let season: Season | null = null;
  let deckImages: DeckImageMap = {};
  try {
    season = await kv.get<Season>('tournament:season:202607');
  } catch {
    // KV接続エラー時はnullとして扱う
  }
  try {
    deckImages = (await kv.get<DeckImageMap>('tournament:202607:deckImages')) ?? {};
  } catch {
    // KV接続エラー時は空として扱う
  }

  return (
    <main className="page-main">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          2026年7月大会
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginTop: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          {season?.teamNames?.A || 'チームA'} vs {season?.teamNames?.B || 'チームB'}
        </p>
      </div>

      {season ? (
        <ArchiveTabs season={season} activeTab={activeTab} deckImages={deckImages} />
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          スケジュールはまだ生成されていません。
        </p>
      )}
    </main>
  );
}
