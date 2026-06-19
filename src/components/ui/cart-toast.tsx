'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { X, ShoppingBag } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
interface ToastPayload {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
}

interface CartToastContextValue {
  show: (payload: Omit<ToastPayload, 'id'>) => void;
}

/* ── Context ────────────────────────────────────────────────── */
const CartToastContext = createContext<CartToastContextValue | null>(null);

export function useCartToast() {
  const ctx = useContext(CartToastContext);
  if (!ctx) throw new Error('useCartToast must be used inside CartToastProvider');
  return ctx;
}

/* ── Provider + Toaster ─────────────────────────────────────── */
export function CartToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((payload: Omit<ToastPayload, 'id'>) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { ...payload, id }]);
    setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  return (
    <CartToastContext.Provider value={{ show }}>
      {children}

      {/* Toaster portal */}
      <div
        aria-live="polite"
        aria-label="Notifications panier"
        className="fixed bottom-5 end-5 z-[200] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </CartToastContext.Provider>
  );
}

/* ── Single toast ───────────────────────────────────────────── */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastPayload;
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="
        pointer-events-auto
        flex items-center gap-3
        w-[min(340px,calc(100vw-2.5rem))]
        rounded-[var(--radius-md)]
        border-s-4 border-[var(--color-brand-primary)]
        border border-[var(--color-brand-border)]
        border-s-4
        bg-[var(--color-brand-surface-elevated)]
        shadow-[var(--shadow-lg)]
        px-3 py-3
        animate-toast-in
      "
    >
      {/* Thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-brand-surface-alt)]">
        {toast.imageUrl ? (
          <Image
            src={toast.imageUrl}
            alt={toast.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-[var(--color-brand-primary)]" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-brand-primary)] leading-none mb-1">
          Ajouté au panier
        </p>
        <p className="text-sm font-medium text-[var(--color-brand-text)] line-clamp-1 leading-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-[var(--color-brand-text-muted)] mt-0.5 line-clamp-1">
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="
          shrink-0 flex items-center justify-center
          min-w-[32px] min-h-[32px]
          text-[var(--color-brand-text-muted)]
          hover:text-[var(--color-brand-text)]
          transition-colors duration-150
          rounded
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--color-brand-primary)]
        "
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
