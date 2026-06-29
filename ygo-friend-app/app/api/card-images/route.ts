import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'img', 'card', '202607');
    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.png'))
      .sort();
    return NextResponse.json({ images: files.map(f => `/img/card/202607/${f}`) });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
