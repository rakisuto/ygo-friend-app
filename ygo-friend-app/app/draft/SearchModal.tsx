'use client';

import type { YgoCard, YgoApiResponse } from '@/app/types/ygoprodeck';

function getImageUrl(card: YgoCard): string {
  return card.card_images[0]?.image_url_cropped ?? card.card_images[0]?.image_url ?? '';
}

interface Props {
  onSelect: (card: YgoCard) => void;
  onClose: () => void;
  results: YgoCard[];
  error: string;
}

export function SearchModal({ onSelect, onClose, results, error }: Props) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '14px', padding: '24px',
          width: 'min(92vw, 680px)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', margin: 0 }}>
            検索結果{results.length > 0 && <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.875rem' }}> ({results.length}件)</span>}
          </p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {error ? (
          <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
        ) : (
          <>
            <div style={{
              display: 'flex', gap: '10px',
              overflowX: 'auto', paddingBottom: '8px',
              WebkitOverflowScrolling: 'touch',
            }}>
              {results.map((card) => (
                <div
                  key={card.id}
                  onClick={() => onSelect(card)}
                  title={card.name}
                  style={{
                    flexShrink: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    padding: '6px', borderRadius: '8px', border: '2px solid #e2e8f0',
                    transition: 'border-color 0.15s, transform 0.15s',
                    width: '120px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6';
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                    (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(card)}
                    alt={card.name}
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                    loading="lazy"
                  />
                  <span style={{
                    fontSize: '0.6875rem', color: '#475569', textAlign: 'center',
                    lineHeight: 1.3, wordBreak: 'break-all',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              カードをクリックして選択
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export async function searchCards(keyword: string): Promise<{ cards: YgoCard[]; error: string }> {
  try {
    const res = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) throw new Error('not found');
    const json: YgoApiResponse = await res.json();
    const cards = json.data?.slice(0, 20) ?? [];
    if (cards.length === 0) return { cards: [], error: '該当するカードが見つかりませんでした' };
    return { cards, error: '' };
  } catch {
    return { cards: [], error: '該当するカードが見つかりませんでした' };
  }
}

export { getImageUrl };
