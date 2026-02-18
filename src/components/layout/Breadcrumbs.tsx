"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useDirection } from "@/contexts/DirectionProvider";
import type { BreadcrumbItem } from "@/lib/utils/breadcrumbs";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { isRTL } = useDirection();
  const Separator = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <Separator className="size-3.5 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors truncate">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
