import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { ImageValidationError, saveUploadedImage } from '@/lib/images';

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store');
  return NextResponse.json(body, { ...init, headers });
}

// POST /api/admin/uploads — multipart form with field 'file'
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return noStoreJson({ error: 'Formulaire multipart invalide.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return noStoreJson({ error: "Champ 'file' manquant ou invalide." }, { status: 400 });
  }

  try {
    const path = await saveUploadedImage(file);
    return noStoreJson({ path }, { status: 201 });
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return noStoreJson({ error: err.message }, { status: 400 });
    }
    console.error('[POST /api/admin/uploads]', err);
    return noStoreJson({ error: 'Erreur lors du traitement de l’image.' }, { status: 500 });
  }
}
