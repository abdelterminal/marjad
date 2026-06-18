import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate, re-encode, and persist an uploaded image.
 *
 * Security hardening:
 * - MIME allowlist (jpeg / png / webp only)
 * - 5 MB size cap
 * - Re-encoded via sharp → strips EXIF / embedded payloads, normalises to WebP
 * - UUID filename — never trusts the original client filename
 * - Writes only inside the `/uploads` directory
 *
 * @returns The public path for the saved image, e.g. `/uploads/<uuid>.webp`
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error('Fichier trop volumineux (max 5 Mo).');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.');
  }

  // Ensure upload directory exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${uuidv4()}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${filename}`;
}
