'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
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

/** 勝率TOP3をランクグループ（同率まとめ）で返す */
function buildWinRankGroups(winStats: DeckWinStat[]): { rank: number; winRate: number; items: DeckWinStat[] }[] {
  const groups: { rank: number; winRate: number; items: DeckWinStat[] }[] = [];
  let rankCounter = 1;

  for (const stat of winStats) {
    if (groups.length === 0 || stat.winRate !== groups[groups.length - 1].winRate) {
      if (groups.length >= 3) break;
      groups.push({ rank: rankCounter, winRate: stat.winRate, items: [stat] });
    } else {
      groups[groups.length - 1].items.push(stat);
    }
    rankCounter++;
  }

  // rankCounter がグループ内で増えすぎないよう、rank はグループ開始時の値を使う
  // 再計算: 1, 1+prev_group_size, ...
  let r = 1;
  for (const g of groups) {
    g.rank = r;
    r += g.items.length;
  }

  return groups.slice(0, 3);
}

export default function DeckPieChart({ data, winStats }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (data.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>デッキ情報が入力されていません</p>;
  }

  const outerRadius = isMobile ? 80 : 105;
  const innerRadius = isMobile ? 32 : 44;
  const chartHeight = isMobile ? 260 : 340;

  const total = data.reduce((s, d) => s + d.value, 0);
  const top3Usage = data.slice(0, 3);
  const top3Names = new Set(top3Usage.map(d => d.name));
  const winRankGroups = buildWinRankGroups(winStats.filter(s => top3Names.has(s.name)));

  return (
    <div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const v = typeof value === 'number' ? value : 0;
              return [`${v}回 (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`, name];
            }}
            contentStyle={{
              borderRadius: '8px', border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.875rem',
            }}
          />
          <Legend
            iconType="circle"
            formatter={(value) => (
              <span style={{ fontSize: isMobile ? '0.75rem' : '0.8125rem', color: '#374151' }}>
                {value}
              </span>
            )}
            wrapperStyle={{ paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* 使用率 TOP3 */}
      <RankingSection title="使用率 TOP3">
        {[0, 1, 2].map(i => {
          const item = top3Usage[i];
          const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : null;
          return (
            <RankRow
              key={i}
              rank={i + 1}
              highlight={i === 0}
              left={item ? item.name : null}
              right={item ? `${pct}%` : null}
              sub={item ? `${item.value}回` : null}
              rightColor={COLORS[i]}
            />
          );
        })}
      </RankingSection>

      {/* 勝率 TOP3 */}
      {winRankGroups.length > 0 && (
        <RankingSection title="勝率 TOP3" note="使用率TOP3のデッキのみ対象" style={{ marginTop: '14px' }}>
          {[0, 1, 2].map(i => {
            const group = winRankGroups[i];
            if (!group) {
              return <RankRow key={i} rank={i + 1} highlight={false} left={null} right={null} sub={null} rightColor="#16a34a" />;
            }
            const names = group.items.map(d => d.name).join('、');
            const totalGroupWins = group.items.reduce((s, d) => s + d.wins, 0);
            const totalGroupLosses = group.items.reduce((s, d) => s + d.losses, 0);
            return (
              <RankRow
                key={i}
                rank={group.rank}
                highlight={group.rank === 1}
                left={names}
                right={`${group.winRate}%`}
                sub={`${totalGroupWins}勝${totalGroupLosses}敗`}
                rightColor="#16a34a"
              />
            );
          })}
        </RankingSection>
      )}
    </div>
  );
}

// ─── 共通UIパーツ ───────────────────────────────────────

function RankingSection({
  title, note, children, style,
}: { title: string; note?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px', marginTop: '16px' }}>
        <p style={{
          fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0,
        }}>
          {title}
        </p>
        {note && (
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>※ {note}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {children}
      </div>
    </div>
  );
}

function RankRow({
  rank, highlight, left, right, sub, rightColor,
}: {
  rank: number;
  highlight: boolean;
  left: string | null;
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
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
        {medal ?? <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.875rem' }}>{rank}位</span>}
      </span>
      {left ? (
        <>
          <span style={{
            flex: 1, fontWeight: 600, color: '#1e293b',
            fontSize: '0.9375rem', wordBreak: 'break-word',
          }}>
            {left}
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
