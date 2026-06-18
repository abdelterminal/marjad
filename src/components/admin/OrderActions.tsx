'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface OrderActionsProps {
  orderId: number;
  status: string;
}

type Transition = {
  label: string;
  targetStatus: string;
  variant: 'default' | 'outline' | 'destructive';
  confirmLabel: string;
  description: string;
};

const TRANSITIONS: Record<string, Transition[]> = {
  pending: [
    {
      label: 'Confirmer',
      targetStatus: 'confirmed',
      variant: 'default',
      confirmLabel: 'Confirmer la commande',
      description: 'Confirmer cette commande et la préparer pour l\'expédition ?',
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      variant: 'destructive',
      confirmLabel: 'Annuler la commande',
      description: 'Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.',
    },
  ],
  confirmed: [
    {
      label: 'Marquer expédié',
      targetStatus: 'shipped',
      variant: 'default',
      confirmLabel: 'Marquer comme expédié',
      description: 'Marquer cette commande comme expédiée ?',
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      variant: 'destructive',
      confirmLabel: 'Annuler la commande',
      description: 'Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.',
    },
  ],
  shipped: [
    {
      label: 'Marquer livré',
      targetStatus: 'delivered',
      variant: 'default',
      confirmLabel: 'Marquer comme livré',
      description: 'Confirmer que cette commande a bien été livrée ?',
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      variant: 'destructive',
      confirmLabel: 'Annuler la commande',
      description: 'Êtes-vous sûr de vouloir annuler cette commande ? Cette action est irréversible.',
    },
  ],
  delivered: [],
  cancelled: [],
};

export function OrderActions({ orderId, status }: OrderActionsProps) {
  const router = useRouter();
  const transitions = TRANSITIONS[status] ?? [];
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingTransition, setConfirmingTransition] = useState<Transition | null>(null);

  if (transitions.length === 0) return null;

  async function executeTransition(targetStatus: string) {
    setLoading(targetStatus);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Erreur lors de la mise à jour');
      }
      setConfirmingTransition(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue');
    } finally {
      setLoading(null);
    }
  }

  if (confirmingTransition) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900">{confirmingTransition.confirmLabel}</h3>
          <p className="mt-1 text-sm text-gray-600">{confirmingTransition.description}</p>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-3">
          <Button
            variant={confirmingTransition.variant}
            onClick={() => executeTransition(confirmingTransition.targetStatus)}
            disabled={loading !== null}
          >
            {loading !== null ? 'En cours…' : 'Confirmer'}
          </Button>
          <Button
            variant="outline"
            onClick={() => { setConfirmingTransition(null); setError(null); }}
            disabled={loading !== null}
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      <h3 className="font-semibold text-gray-900">Actions</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {transitions.map((t) => (
          <Button
            key={t.targetStatus}
            variant={t.variant}
            onClick={() => setConfirmingTransition(t)}
            disabled={loading !== null}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
