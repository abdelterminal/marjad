'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Real crossfade between routes, not a hard cut. The incoming page renders
 * in normal flow (so the layout height — and the footer below it — never
 * collapses), while the outgoing page is pulled out of flow and fades out
 * on top of it. That overlap is what makes it read as smooth: the two
 * pages hand off to each other instead of one vanishing before the next
 * appears.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: reduceMotion ? 0 : 0.36, ease: EASE },
          }}
          exit={{
            opacity: 0,
            y: reduceMotion ? 0 : -8,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transition: { duration: reduceMotion ? 0 : 0.22, ease: EASE },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
