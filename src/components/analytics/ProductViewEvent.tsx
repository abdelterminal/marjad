'use client';

import { useEffect } from 'react';
import { trackProductView } from '@/lib/analytics';

interface ProductViewEventProps {
  productId: number;
  slug: string;
  name: string;
  price: number;
  category?: string | null;
}

export function ProductViewEvent({ productId, slug, name, price, category }: ProductViewEventProps) {
  useEffect(() => {
    trackProductView({
      productId,
      slug,
      name,
      price,
      category,
    });
  }, [category, name, price, productId, slug]);

  return null;
}
