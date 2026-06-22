'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: File[]) {
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of valid) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Échec de l'upload");
        }
        const { path } = await res.json();
        uploaded.push(path);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(e.target.files ?? []));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(from: number, to: number) {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {/* Existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image src={src} alt={`Image ${i + 1}`} fill className="object-cover" sizes="120px" />

              {/* Overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-gray-700 hover:bg-white text-xs font-bold"
                    title="Déplacer à gauche"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-red-600 hover:bg-white"
                  title="Supprimer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-gray-700 hover:bg-white text-xs font-bold"
                    title="Déplacer à droite"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-gray-900/75 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all duration-150',
          dragOver
            ? 'border-gray-900 bg-gray-50 scale-[1.01]'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          uploading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Upload en cours…</p>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              {images.length === 0 ? (
                <ImagePlus className="h-5 w-5" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {images.length === 0 ? 'Ajouter des photos' : 'Ajouter d\'autres photos'}
              </p>
              <p className="text-xs text-gray-400">Glisser-déposer ou cliquer · JPG, PNG, WebP</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
