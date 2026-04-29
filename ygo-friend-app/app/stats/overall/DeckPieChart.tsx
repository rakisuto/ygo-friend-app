'use client';

import type { DeckUsage, DeckWinStat } from '@/lib/tournament/stats';

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#64748b', '#a855f7', '#14b8a6',
];

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

interface Props {
  data: DeckUsage[];
  winStats: DeckWinStat[];
}

function buildWinRankGroups(winStats: DeckWinStat[]): { rank: number; wins: number; items: DeckWinStat[] }[] {
  const groups: { rank: number; wins: number; items: DeckWinStat[] }[] = [];
  for (const stat of winStats) {
    if (groups.length === 0 || stat.wins !== groups[groups.length - 1].wins) {
      if (groups.length >= 3) break;
      groups.push({ rank: 0, wins: stat.wins, items: [stat] });
    } else {
      groups[groups.length - 1].items.push(stat);
    }
  }
  let r = 1;
  for (const g of groups) { g.rank = r; r += g.items.length; }
  return groups;
}

export default function DeckPieChart({ data, winStats }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const maxVal = data[0]?.value ?? 1;
  const top3Usage = data.slice(0, 3);
  const winRankGroups = buildWinRankGroups(winStats);

  if (data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>デッキ情報が入力されていません</p>;
  }

  return (
    <div>
      {/* ── 全デッキ使用回数バーチャート ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((d, i) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          const barW = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
          const color = COLORS[i % COLORS.length];
          return (
            <div key={d.name}>
              {/* デッキ名 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: '#1e293b', fontWeight: 500 }}>
                  {d.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto', flexShrink: 0 }}>
                  {d.value}回 ({pct.toFixed(1)}%)
                </span>
              </div>
              {/* バー */}
              <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${barW}%`, height: '100%', background: color, borderRadius: '4px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 使用率 TOP3 ── */}
      <RankingSection title="使用率 TOP3" style={{ marginTop: '24px' }}>
        {[0, 1, 2].map(i => {
          const item = top3Usage[i];
          const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : null;
          return (
            <RankRow
              key={i}
              rank={i + 1}
              highlight={i === 0}
              deckName={item?.name ?? null}
              right={item ? `${pct}%` : null}
              sub={item ? `${item.value}回` : null}
              rightColor={COLORS[i]}
            />
          );
        })}
      </RankingSection>

      {/* ── 勝利数 TOP3 ── */}
      {winRankGroups.length > 0 && (
        <RankingSection title="勝利数 TOP3" style={{ marginTop: '14px' }}>
          {winRankGroups.map((group, i) => {
            const names = group.items.map(d => d.name).join('、');
            const firstWins  = group.items.reduce((s, d) => s + d.firstWins, 0);
            const secondWins = group.items.reduce((s, d) => s + d.secondWins, 0);
            return (
              <RankRow
                key={i}
                rank={group.rank}
                highlight={group.rank === 1}
                deckName={names}
                right={`${group.wins}勝`}
                sub={`先攻${firstWins}・後攻${secondWins}`}
                rightColor="#16a34a"
              />
            );
          })}
        </RankingSection>
      )}
    </div>
  );
}

// ── 共通UIパーツ ──────────────────────────────────────────────────────────────

function RankingSection({
  title, children, style,
}: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <p style={{
        fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        margin: '0 0 8px',
      }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  );
}

function RankRow({
  rank, highlight, deckName, right, sub, rightColor,
}: {
  rank: number;
  highlight: boolean;
  deckName: string | null;
  right: string | null;
  sub: string | null;
  rightColor: string;
}) {
  const medal = RANK_MEDAL[rank - 1];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: highlight ? '#fffbeb' : '#f8fafc',
      borderRadius: '8px', padding: '10px 14px',
      border: `1px solid ${highlight ? '#fde68a' : '#e2e8f0'}`,
      minHeight: '44px',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0, minWidth: '24px' }}>
        {medal ?? <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.875rem' }}>{rank}位</span>}
      </span>
      {deckName ? (
        <>
          <span style={{ flex: 1, fontWeight: 600, color: '#1e293b', fontSize: '0.9375rem', wordBreak: 'break-word' }}>
            {deckName}
          </span>
          <span style={{ fontWeight: 700, color: rightColor, fontSize: '0.875rem', flexShrink: 0 }}>
            {right}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>
            {sub}
          </span>
        </>
      ) : (
        <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>—</span>
      )}
    </div>
  );
}
