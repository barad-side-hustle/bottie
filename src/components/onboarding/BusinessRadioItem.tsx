"use client";

import { GoogleBusinessProfileLocation } from "@/lib/types";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationRadioItemProps {
  location: GoogleBusinessProfileLocation;
  selected: boolean;
}

export function LocationRadioItem({ location, selected }: LocationRadioItemProps) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
        selected ? "border-primary bg-accent-tint" : "border-line-strong hover:bg-surface-2"
      )}
    >
      <RadioGroupItem value={location.id} id={location.id} className="mt-0.5" />
      <Label htmlFor={location.id} className="flex-1 min-w-0 cursor-pointer space-y-1">
        <span className="block truncate font-medium text-base text-foreground">{location.name}</span>
        {location.address && (
          <div className="flex items-start gap-1.5 text-sm text-ink-2 min-w-0">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-ink-3" />
            <span className="truncate">{location.address}</span>
          </div>
        )}
      </Label>
    </div>
  );
}
