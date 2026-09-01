import Image from 'next/image';

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[50vh] w-full items-center justify-center animate-loading-fade-in"
    >
      <Image
        src="/brand/marjad-mark.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="h-10 w-10 animate-logo-pulse"
      />
    </div>
  );
}
