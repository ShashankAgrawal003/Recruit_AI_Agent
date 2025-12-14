import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OverallFitBadgeProps {
  fit: 'Low' | 'Moderate' | 'High';
  size?: 'sm' | 'md' | 'lg';
}

export function OverallFitBadge({ fit, size = 'sm' }: OverallFitBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        fit === 'High' && 'bg-success/10 text-success border-success/30',
        fit === 'Moderate' && 'bg-warning/10 text-warning border-warning/30',
        fit === 'Low' && 'bg-destructive/10 text-destructive border-destructive/30'
      )}
    >
      {fit} Fit
    </Badge>
  );
}
