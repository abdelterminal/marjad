'use client';

import { usePathname } from 'next/navigation';

/**
 * Re-keys its children by pathname so every route change remounts this
 * wrapper's DOM node, which replays the `.page-enter` CSS animation
 * (globals.css). Without the key, React reconciles the same <div> across
 * navigations and the animation never retriggers — the classic reason
 * Next.js page transitions otherwise feel like a hard cut.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
