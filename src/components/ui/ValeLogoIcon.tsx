import { cn } from '@/lib/utils';

interface ValeLogoIconProps {
  className?: string;
}

export function ValeLogoIcon({ className }: ValeLogoIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn('w-full h-full', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" />
      <path
        d="M12 53 L34 75 L60 46"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M60 46 L74 60 L88 45"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
