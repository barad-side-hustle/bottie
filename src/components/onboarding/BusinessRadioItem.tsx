"use client";

import { GoogleBusinessProfileLocation } from "@/lib/types";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building2, MapPin } from "lucide-react";

interface LocationRadioItemProps {
  location: GoogleBusinessProfileLocation;
  selected: boolean;
}

export function LocationRadioItem({ location, selected }: LocationRadioItemProps) {
  return (
    <div
      className={`relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-200 ${selected ? "border-primary ring-2 ring-primary/30 bg-secondary/40" : "border-border/60 hover:border-primary/50 hover:bg-secondary/20"}`}
    >
      <RadioGroupItem value={location.id} id={location.id} className="mt-1" />
      <Label htmlFor={location.id} className="flex-1 cursor-pointer space-y-2">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg">{location.name}</span>
        </div>
        {location.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{location.address}</span>
          </div>
        )}
      </Label>
    </div>
  );
}
