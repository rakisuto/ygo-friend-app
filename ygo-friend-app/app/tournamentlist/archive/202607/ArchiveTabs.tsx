'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { Season, DeckImageMap } from '@/app/tournament/types';
import { seasonToTeamMatches } from './adapt';
import TeamSessionTabs from './TeamSessionTabs';
import TeamPlayerStatsContent from './TeamPlayerStatsContent';
import TeamOverallStatsContent from './TeamOverallStatsContent';

type Tab = 'result' | 'player' | 'overall';

const TABS: { key: Tab; label: string }[] = [
  { key: 'result', label: '大会結果' },
  { key: 'player', label: 'プレイヤー成績' },
  { key: 'overall', label: '総合成績' },
];

interface Props {
  season: Season;
  activeTab: Tab;
  deckImages?: DeckImageMap;
}

export default function ArchiveTabs({ season, activeTab, deckImages }: Props) {
  const matches = seasonToTeamMatches(season);
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (tab: Tab) => {
    router.push(`${pathname}?tab=${tab}`);
  };

  return (
    <div>
      {/* タブバー */}
      <div
        className="tab-scroll"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: '10px',
          marginBottom: '20px',
          padding: '4px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', width: 'max-content', minWidth: '100%' }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              style={{
                padding: '10px 16px',
                background: activeTab === key ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === key ? '2px solid #93c5fd' : '2px solid transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                flexShrink: 0,
              }}
            >
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: activeTab === key ? '#fff' : 'rgba(255,255,255,0.7)',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'result' && <TeamSessionTabs season={season} deckImages={deckImages} />}
      {activeTab === 'player' && <TeamPlayerStatsContent matches={matches} />}
      {activeTab === 'overall' && <TeamOverallStatsContent matches={matches} />}
    </div>
  );
}
