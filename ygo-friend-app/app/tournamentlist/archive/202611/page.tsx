import { kv } from '@/lib/kv';
import type { Season, DeckImageMap, DeckImageLibrary } from '@/app/tournament/types';
import ArchiveTabs from './ArchiveTabs';

export const revalidate = 0;

type Tab = 'description' | 'result' | 'player' | 'overall';
const VALID_TABS: Tab[] = ['description', 'result', 'player', 'overall'];

function parseTab(raw: string | undefined): Tab {
  if (raw && (VALID_TABS as string[]).includes(raw)) return raw as Tab;
  return 'result';
}

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Archive202611Page({ searchParams }: PageProps) {
  const { tab: rawTab } = await searchParams;
  const activeTab = parseTab(rawTab);

  let season: Season | null = null;
  let deckImages: DeckImageMap = {};
  let deckImageLibrary: DeckImageLibrary = [];
  let connectionError = false;
  try {
    season = await kv.get<Season>('tournament:season:202611');
  } catch {
    // 「データが無い」と区別するため、接続エラーとして表示する
    connectionError = true;
  }
  // デッキ画像は2026年7月大会で登録したものを読み取り専用で共有する(同名デッキなら画像が出る)
  try {
    deckImages = (await kv.get<DeckImageMap>('tournament:202607:deckImages')) ?? {};
  } catch {
    // KV接続エラー時は空として扱う
  }
  try {
    deckImageLibrary = (await kv.get<DeckImageLibrary>('tournament:202607:deckImageLibrary')) ?? [];
  } catch {
    // KV接続エラー時は空として扱う
  }

  return (
    <main className="page-main">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          {season?.name || '2026年11月大会'}
        </h1>
        {season && (
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginTop: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            参加プレイヤー: {season.players.map(p => p.name).join('・')}
          </p>
        )}
      </div>

      {season ? (
        <ArchiveTabs season={season} activeTab={activeTab} deckImages={deckImages} deckImageLibrary={deckImageLibrary} />
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          {connectionError
            ? 'データベースに接続できません。しばらくしてからもう一度お試しください。'
            : 'スケジュールはまだ生成されていません。'}
        </p>
      )}
    </main>
  );
}
