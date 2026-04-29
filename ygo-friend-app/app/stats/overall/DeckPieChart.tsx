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

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

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
  const chartHeight = isMobile ? 260 : 340;

  const total = data.reduce((s, d) => s + d.value, 0);
  const top3 = data.slice(0, 3);

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
            formatter={(value: number) => [
              `${value}回 (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
              '使用回数',
            ]}
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
      <div style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          使用率 TOP3
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[0, 1, 2].map(i => {
            const item = top3[i];
            const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : null;
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: i === 0 ? '#fffbeb' : '#f8fafc',
                  borderRadius: '8px', padding: '10px 14px',
                  border: `1px solid ${i === 0 ? '#fde68a' : '#e2e8f0'}`,
                  minHeight: '44px',
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{RANK_MEDAL[i]}</span>
                {item ? (
                  <>
                    <span
                      style={{
                        flex: 1, fontWeight: 600, color: '#1e293b',
                        fontSize: '0.9375rem', wordBreak: 'break-word',
                      }}
                    >
                      {item.name}
                    </span>
                    <span style={{ fontWeight: 700, color: COLORS[i], fontSize: '0.875rem', flexShrink: 0 }}>
                      {pct}%
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', flexShrink: 0 }}>
                      {item.value}回
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#cbd5e1', fontSize: '0.9375rem' }}>—</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
