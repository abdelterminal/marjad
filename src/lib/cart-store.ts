import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: number;
  slug: string;
  nameFr: string;
  nameAr: string;
  price: string; // numeric as string from DB
  image?: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  itemCount: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      add: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + qty, 99) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(qty, 99) }],
          };
        });
      },

      setQty: (productId, qty) => {
        if (qty <= 0) {
          get().remove(productId);
          return;
        }
        const capped = Math.min(qty, 99);
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: capped } : i
          ),
        }));
      },

      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      clear: () => set({ items: [] }),

      itemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + parseFloat(i.price) * i.quantity,
          0
        );
      },
    }),
    {
      name: 'marjad-cart',
      storage: createJSONStorage(() => {
        // SSR-safe: return a no-op storage on the server
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Skip hydration to avoid SSR mismatch; components must call
      // useCartStore.persist.rehydrate() after mount or use the
      // useHydratedCartStore hook below.
      skipHydration: true,
    }
  )
);

/**
 * Hook that returns a hydrated cart store value.
 * Components that need the cart count (badge) should use this
 * to avoid showing stale "0" count during SSR.
 */
export function useHydratedCart() {
  return useCartStore;
}
