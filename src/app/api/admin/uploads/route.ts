import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth-guards';
import { saveUploadedImage } from '@/lib/images';

// POST /api/admin/uploads — multipart form with field 'file'
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.response) return guard.response;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Formulaire multipart invalide.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Champ 'file' manquant ou invalide." }, { status: 400 });
  }

  try {
    const path = await saveUploadedImage(file);
    return NextResponse.json({ path }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors du traitement de l\'image.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
