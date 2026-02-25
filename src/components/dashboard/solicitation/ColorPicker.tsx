"use client";

import { useCallback, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

function normalizeHex(raw: string): string | null {
  let hex = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toLowerCase()}`;
  }
  return null;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setInputValue(raw);
      const normalized = normalizeHex(raw);
      if (normalized) onChange(normalized);
    },
    [onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text");
      const normalized = normalizeHex(pasted);
      if (normalized) {
        e.preventDefault();
        setInputValue(normalized);
        onChange(normalized);
      }
    },
    [onChange]
  );

  const handlePickerChange = useCallback(
    (color: string) => {
      setInputValue(color);
      onChange(color);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="size-9 shrink-0 cursor-pointer rounded-md border border-border/60 shadow-sm transition-shadow hover:shadow-md"
              style={{ backgroundColor: value }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={value} onChange={handlePickerChange} />
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onBlur={handleBlur}
              className="mt-2 h-8 font-mono text-xs"
              maxLength={7}
            />
          </PopoverContent>
        </Popover>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          className="h-9 font-mono text-xs"
          maxLength={7}
        />
      </div>
    </div>
  );
}
