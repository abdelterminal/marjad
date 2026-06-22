'use client';

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined | AnalyticsPayload[]>;

export type AnalyticsEvent = {
  event: string;
  timestamp: string;
  payload?: AnalyticsPayload;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  fbq?: (command: string, event: string, payload?: AnalyticsPayload) => void;
  gtag?: (command: string, event: string, payload?: AnalyticsPayload) => void;
  ttq?: {
    track?: (event: string, payload?: AnalyticsPayload) => void;
  };
};

const META_EVENT_MAP: Record<string, string> = {
  product_view: 'ViewContent',
  add_to_cart: 'AddToCart',
  checkout_start: 'InitiateCheckout',
  order_submitted: 'Purchase',
};

const TIKTOK_EVENT_MAP: Record<string, string> = {
  product_view: 'ViewContent',
  add_to_cart: 'AddToCart',
  checkout_start: 'InitiateCheckout',
  order_submitted: 'CompletePayment',
};

const GOOGLE_EVENT_MAP: Record<string, string> = {
  page_view: 'page_view',
  product_view: 'view_item',
  add_to_cart: 'add_to_cart',
  checkout_start: 'begin_checkout',
  order_submitted: 'purchase',
};

export function trackEvent(event: string, payload?: AnalyticsPayload) {
  if (typeof window === 'undefined') return;

  const analyticsWindow = window as AnalyticsWindow;
  const entry: AnalyticsEvent = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  };

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.dataLayer.push(entry);

  const googleEvent = GOOGLE_EVENT_MAP[event];
  if (googleEvent && typeof analyticsWindow.gtag === 'function') {
    analyticsWindow.gtag('event', googleEvent, payload);
  }

  const metaEvent = META_EVENT_MAP[event];
  if (metaEvent && typeof analyticsWindow.fbq === 'function') {
    analyticsWindow.fbq('track', metaEvent, payload);
  }

  const tikTokEvent = TIKTOK_EVENT_MAP[event];
  if (tikTokEvent && analyticsWindow.ttq?.track) {
    analyticsWindow.ttq.track(tikTokEvent, payload);
  }

  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true') {
    console.info('[analytics]', entry);
  }
}

export function trackProductView(payload: {
  productId: number;
  slug: string;
  name: string;
  price: number;
  currency?: string;
  category?: string | null;
}) {
  trackEvent('product_view', {
    ...payload,
    currency: payload.currency ?? 'MAD',
  });
}

export function trackAddToCart(payload: {
  productId: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  currency?: string;
}) {
  trackEvent('add_to_cart', {
    ...payload,
    currency: payload.currency ?? 'MAD',
  });
}

export function trackCheckoutStart(payload: {
  value: number;
  currency?: string;
  itemCount: number;
  items: AnalyticsPayload[];
}) {
  trackEvent('checkout_start', {
    ...payload,
    currency: payload.currency ?? 'MAD',
  });
}

export function trackOrderSubmitted(payload: {
  orderId: number;
  value: number;
  currency?: string;
  itemCount: number;
  paymentMethod: 'cod';
}) {
  trackEvent('order_submitted', {
    ...payload,
    currency: payload.currency ?? 'MAD',
  });
}
