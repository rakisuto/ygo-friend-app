'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DeckUsage } from '@/lib/tournament/stats';

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#64748b', '#a855f7', '#14b8a6',
];

// この割合未満のスライスはラベルを非表示にする（重なり防止）
const LABEL_MIN_PERCENT = 0.09;

interface Props { data: DeckUsage[] }

export default function DeckPieChart({ data }: Props) {
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
  const chartHeight = isMobile ? 280 : 380;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLabel = (props: any) => {
    const pct: number = props.percent ?? 0;
    const name: string = props.name ?? '';
    // 小スライスはラベル省略（凡例で確認可能）
    if (pct < LABEL_MIN_PERCENT) return '';
    return `${name} ${(pct * 100).toFixed(0)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="44%"
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={2}
          label={isMobile ? false : renderLabel}
          labelLine={!isMobile}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}回`, '使用回数']}
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
          wrapperStyle={{ paddingTop: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
