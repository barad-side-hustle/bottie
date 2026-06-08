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
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors duration-150 ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-transparent bg-accent-tint text-accent-text"
          : "border-line-strong bg-surface text-ink-2 hover:bg-surface-3",
        className
      )}
    >
      {children}
    </button>
  );
}
