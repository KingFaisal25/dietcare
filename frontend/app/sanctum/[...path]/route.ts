import { NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.BACKEND_URL ?? 'http://localhost:8000').replace(/\/+$/, '');

async function proxyRequest(req: NextRequest, backendPath: string): Promise<NextResponse> {
  const url = `${BACKEND}/${backendPath}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    // Hapus header yang tidak boleh di-forward langsung ke backend
    if (lower === 'host' || lower === 'connection' || lower === 'content-length') {
      return;
    }
    headers.set(key, value);
  });

  // FIX KRITIS: Pastikan Cookie dari browser di-forward ke backend.
  // Diperlukan agar /sanctum/csrf-cookie menggunakan session yang sama
  // dan Laravel dapat mencocokkan cookie dengan token CSRF.
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const backendResponse = await fetch(url, init);

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  backendResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'set-cookie') {
      response.headers.append('set-cookie', value);
    } else if (lower !== 'transfer-encoding' && lower !== 'connection') {
      response.headers.set(key, value);
    }
  });

  return response;
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, `sanctum/${path.join('/')}`);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, `sanctum/${path.join('/')}`);
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, `sanctum/${path.join('/')}`);
}
