'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/ui/button';

interface DeleteProductButtonProps {
  productId: number;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error ?? 'Erreur lors de la suppression';
      setError(msg);
      throw new Error(msg);
    }
    router.refresh();
  }

  return (
    <span>
      {error && <span className="mr-2 text-xs text-red-600">{error}</span>}
      <ConfirmDialog
        trigger={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-3.5" />
          </Button>
        }
        title="Supprimer le produit"
        description={`Supprimer "${productName}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
      />
    </span>
  );
}
