'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

const glass: React.CSSProperties = {
  background: 'rgba(10, 15, 35, 0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
};

export default function DescriptionTabContent({ description }: { description?: string }) {
  if (!description) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', padding: '3rem 0' }}>
        大会概要はまだ登録されていません
      </div>
    );
  }

  return (
    <div style={{ ...glass, padding: '20px 22px' }}>
      <div className="markdown-body-dark">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
          {description}
        </ReactMarkdown>
      </div>
    </div>
  );
}
