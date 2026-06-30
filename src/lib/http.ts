import { NextResponse } from 'next/server';

export function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store');
  return NextResponse.json(body, { ...init, headers });
}

export async function readJsonBody(request: Request, maxBytes: number) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      data: null,
      response: noStoreJson({ error: 'Corps de requête trop volumineux.' }, { status: 413 }),
    } as const;
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return {
      data: null,
      response: noStoreJson({ error: 'Corps de requête trop volumineux.' }, { status: 413 }),
    } as const;
  }

  try {
    return { data: JSON.parse(text) as unknown, response: null } as const;
  } catch {
    return {
      data: null,
      response: noStoreJson({ error: 'Corps JSON invalide.' }, { status: 400 }),
    } as const;
  }
}
