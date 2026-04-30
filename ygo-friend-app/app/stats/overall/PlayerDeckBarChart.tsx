'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { PlayerDeckUsage } from '@/lib/tournament/stats';

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#64748b', '#a855f7', '#14b8a6',
];

interface Props {
  playerUsages: PlayerDeckUsage[];
  /** 全体使用回数順で並んだデッキ名（DeckPieChartのCOLORSと色を揃えるため） */
  deckOrder: string[];
}

export default function PlayerDeckBarChart({ playerUsages, deckOrder }: Props) {
  // 各プレイヤーが実際に使用したデッキのみ表示（0回のデッキは凡例に出さない）
  const usedDecks = deckOrder.filter(d =>
    playerUsages.some(p => (p.decks[d] ?? 0) > 0)
  );

  const chartData = playerUsages.map(p => ({
    player: p.playerName,
    ...Object.fromEntries(usedDecks.map(d => [d, p.decks[d] ?? 0])),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis
          dataKey="player"
          tick={{ fontSize: 13, fill: '#374151' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '8px', border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.8125rem',
            backgroundColor: '#ffffff', opacity: 1,
          }}
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : 0;
            if (v === 0) return [null, null] as unknown as [string, string];
            return [`${v}回`, name];
          }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '12px', fontSize: '0.75rem' }}
          formatter={(value) => (
            <span style={{ color: '#374151', fontSize: '0.75rem' }}>{value}</span>
          )}
        />
        {usedDecks.map((deck, i) => (
          <Bar
            key={deck}
            dataKey={deck}
            stackId="a"
            fill={COLORS[i % COLORS.length]}
            radius={i === usedDecks.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
