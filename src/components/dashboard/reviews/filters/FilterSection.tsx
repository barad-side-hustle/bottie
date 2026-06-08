import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({ title, children, className }: FilterSectionProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-semibold uppercase tracking-[0.02em] text-ink-2">{title}</Label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
