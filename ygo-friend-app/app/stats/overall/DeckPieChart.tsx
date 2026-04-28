'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { DeckUsage } from '@/lib/tournament/stats';

const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#64748b',
];

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

  const outerRadius = isMobile ? 90 : 120;
  const innerRadius = isMobile ? 36 : 50;
  const chartHeight = isMobile ? 260 : 340;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={2}
          label={isMobile
            ? false
            : ({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={!isMobile}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value}回`, '使用回数']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '0.875rem' }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.8125rem', paddingTop: '8px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
