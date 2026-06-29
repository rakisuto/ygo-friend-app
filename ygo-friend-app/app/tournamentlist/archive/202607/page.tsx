import { kv } from '@/lib/kv';
import type { TeamMatch } from './types';
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

  let matches: TeamMatch[] = [];
  try {
    const stored = await kv.get<TeamMatch[]>('tournament:202607:matches');
    if (stored) matches = stored;
  } catch {
    // KV接続エラー時は空配列として扱う
  }

  return (
    <main className="page-main">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 className="reisho" style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
          2026年7月大会
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', marginTop: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
          2人チーム戦（チームA vs チームB）
        </p>
      </div>

      <ArchiveTabs matches={matches} activeTab={activeTab} />
    </main>
  );
}
