'use client';

import { useEffect, useState } from 'react';

export default function CardBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const src = isMobile ? '/img/get_content_phone.jpg' : '/img/get_content.jpg';

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1 }} />
    </>
  );
}
