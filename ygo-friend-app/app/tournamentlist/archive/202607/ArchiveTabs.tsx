'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { TeamMatch } from './types';
import TeamResultContent from './TeamResultContent';
import TeamPlayerStatsContent from './TeamPlayerStatsContent';
import TeamOverallStatsContent from './TeamOverallStatsContent';

type Tab = 'result' | 'player' | 'overall';

const TABS: { key: Tab; label: string }[] = [
  { key: 'result', label: '大会結果' },
  { key: 'player', label: 'プレイヤー成績' },
  { key: 'overall', label: '総合成績' },
];

interface Props {
  matches: TeamMatch[];
  activeTab: Tab;
}

export default function ArchiveTabs({ matches, activeTab }: Props) {
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
        style={{ borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', gap: '4px', width: 'max-content', minWidth: '100%' }}>
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              style={{
                padding: '10px 16px',
                background: activeTab === key ? '#eff6ff' : 'transparent',
                border: 'none',
                borderBottom: activeTab === key ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                borderRadius: '6px 6px 0 0',
                flexShrink: 0,
              }}
            >
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: activeTab === key ? '#1d4ed8' : '#64748b',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'result' && <TeamResultContent matches={matches} />}
      {activeTab === 'player' && <TeamPlayerStatsContent matches={matches} />}
      {activeTab === 'overall' && <TeamOverallStatsContent matches={matches} />}
    </div>
  );
}
