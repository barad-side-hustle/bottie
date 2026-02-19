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
      className={`relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${selected ? "border-primary bg-pastel-lavender/20 shadow-md" : "border-border/40 hover:border-primary/50 hover:shadow-sm hover:bg-pastel-lavender/5"}`}
    >
      <RadioGroupItem value={location.id} id={location.id} className="mt-1" />
      <Label htmlFor={location.id} className="flex-1 cursor-pointer space-y-2">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender/30">
            <Building2 className="h-4 w-4 text-primary" />
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
