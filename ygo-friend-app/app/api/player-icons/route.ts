import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'img', 'icon');
    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.png'))
      .sort();
    return NextResponse.json({ icons: files.map(f => `/img/icon/${f}`) });
  } catch {
    return NextResponse.json({ icons: [] });
  }
}
