import { cn } from "@/lib/utils";

interface ToggleChipProps {
  selected: boolean;
  onToggle: (selected: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function ToggleChip({ selected, onToggle, children, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!selected)}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors",
        selected
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border/60 bg-transparent text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
        className
      )}
    >
      {children}
    </button>
  );
}
