import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  collapsed?: boolean;
}

export function Logo({ className, collapsed = false }: LogoProps) {
  if (collapsed) {
    return (
      <img
        src="/logo.png"
        alt="Ichgram"
        className={cn('h-8 w-auto object-contain', className)}
      />
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Ichgram"
      className={cn('w-[190px] h-auto object-contain', className)}
    />
  );
}
