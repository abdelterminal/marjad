import Image from 'next/image';

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className="flex min-h-[60vh] w-full items-center justify-center bg-[var(--color-brand-surface)]"
    >
      <Image
        src="/brand/marjad-mark.svg"
        alt=""
        width={48}
        height={48}
        priority
        className="h-12 w-12 animate-logo-pulse"
      />
    </div>
  );
}
