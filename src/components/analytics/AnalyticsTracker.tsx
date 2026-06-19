'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

function getAnchorFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest('a[href]');
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    trackEvent('page_view', {
      path: pathname,
      search: search || null,
      url: `${pathname}${search ? `?${search}` : ''}`,
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = getAnchorFromTarget(event.target);
      if (!anchor) return;
      const href = anchor?.getAttribute('href');
      if (!href) return;

      if (href.startsWith('https://wa.me/') || href.startsWith('http://wa.me/')) {
        trackEvent('whatsapp_click', {
          href,
          path: window.location.pathname,
          label: anchor.textContent?.trim() || anchor.getAttribute('aria-label') || 'WhatsApp',
        });
        return;
      }

      if (href.startsWith('tel:')) {
        trackEvent('call_click', {
          href,
          path: window.location.pathname,
          label: anchor.textContent?.trim() || anchor.getAttribute('aria-label') || 'Call',
        });
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
