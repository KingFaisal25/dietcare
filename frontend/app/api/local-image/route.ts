import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Resolve to the Laravel public/gambar directory using process.cwd()
// process.cwd() in Next.js is the frontend root (c:\dietcaresalma\frontend)
const GAMBAR_DIR = path.resolve(process.cwd(), '..', 'public', 'gambar');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileParam = searchParams.get('file') ?? '';

  if (!fileParam) {
    return new NextResponse('Missing file parameter', { status: 400 });
  }

  // Decode: handles both %20 and + encoding for spaces
  const decoded = decodeURIComponent(fileParam.replace(/\+/g, ' '));
  // Sanitize to prevent directory traversal
  const safeName = path.basename(decoded);

  const filePath = path.join(GAMBAR_DIR, safeName);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    const contentType = contentTypeMap[ext] ?? 'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[local-image] Cannot read file:', filePath, err);
    return new NextResponse(`File not found: ${safeName}`, { status: 404 });
  }
}
