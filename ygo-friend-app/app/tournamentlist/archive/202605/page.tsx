import { kv } from '@/lib/kv';
import type { Season } from '@/app/tournament/types';
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

export default async function Archive202605Page({ searchParams }: PageProps) {
  const { tab: rawTab } = await searchParams;
  const activeTab = parseTab(rawTab);

  let season: Season | null = null;
  try {
    season = await kv.get<Season>('tournament:season');
  } catch {
    // KV接続エラー時はnullとして扱う
  }

  if (!season) {
    return (
      <main className="page-main">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>2026年5月大会</h1>
        <p style={{ color: '#94a3b8' }}>スケジュールはまだ生成されていません。</p>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#1e293b' }}>
          {season.name}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          参加プレイヤー: {season.players.map(p => p.name).join('・')}
        </p>
      </div>

      <ArchiveTabs season={season} activeTab={activeTab} />
    </main>
  );
}
