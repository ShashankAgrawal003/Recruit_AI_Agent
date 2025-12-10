import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "rounded-lg bg-primary flex items-center justify-center",
        sizeClasses[size]
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-5 h-5 text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold text-foreground", textSizeClasses[size])}>
          Recruit-AI
        </span>
      )}
    </div>
  );
}
