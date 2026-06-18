'use client';

import { CartDrawer } from './CartDrawer';

/**
 * CartProvider — always mounts the CartDrawer so it's available on every page.
 * Import and render this inside the locale layout (as a client boundary).
 */
export function CartProvider() {
  return <CartDrawer />;
}
