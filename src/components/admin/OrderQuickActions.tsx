'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, PackageCheck, Truck, XCircle } from 'lucide-react';

interface OrderQuickActionsProps {
  orderId: number;
  status: string;
}

type QuickAction = {
  label: string;
  targetStatus: string;
  tone: 'primary' | 'neutral' | 'danger';
  confirm?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ACTIONS: Record<string, QuickAction[]> = {
  pending: [
    {
      label: 'Confirmer',
      targetStatus: 'confirmed',
      tone: 'primary',
      icon: CheckCircle2,
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      tone: 'danger',
      confirm: 'Annuler cette commande ? Cette action est irréversible.',
      icon: XCircle,
    },
  ],
  confirmed: [
    {
      label: 'Expédier',
      targetStatus: 'shipped',
      tone: 'primary',
      icon: Truck,
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      tone: 'danger',
      confirm: 'Annuler cette commande confirmée ?',
      icon: XCircle,
    },
  ],
  shipped: [
    {
      label: 'Livré',
      targetStatus: 'delivered',
      tone: 'primary',
      icon: PackageCheck,
    },
    {
      label: 'Annuler',
      targetStatus: 'cancelled',
      tone: 'danger',
      confirm: 'Annuler cette commande expédiée ?',
      icon: XCircle,
    },
  ],
};

const toneClasses: Record<QuickAction['tone'], string> = {
  primary: 'border-gray-950 bg-gray-950 text-white hover:bg-gray-800',
  neutral: 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-950',
  danger: 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
};

export function OrderQuickActions({ orderId, status }: OrderQuickActionsProps) {
  const router = useRouter();
  const actions = ACTIONS[status] ?? [];
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (actions.length === 0) return null;

  async function updateStatus(action: QuickAction) {
    if (action.confirm && !window.confirm(action.confirm)) return;

    setLoading(action.targetStatus);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.targetStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Mise à jour impossible.');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.targetStatus;
          return (
            <button
              key={action.targetStatus}
              type="button"
              onClick={() => updateStatus(action)}
              disabled={loading !== null}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${toneClasses[action.tone]}`}
            >
              <Icon className="size-3.5" />
              {isLoading ? '...' : action.label}
            </button>
          );
        })}
      </div>
      {error && <p className="max-w-[180px] text-xs leading-4 text-red-600">{error}</p>}
    </div>
  );
}
