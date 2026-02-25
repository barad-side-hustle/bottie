"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import type { QrCodeSettings } from "@/lib/types/qr-settings.types";

export interface QrStyledHandle {
  getRawData: (extension: "png" | "svg") => Promise<Blob | null>;
  getCanvas: () => HTMLCanvasElement | null;
}

interface QrStyledProps {
  url: string;
  settings: QrCodeSettings;
  size: number;
}

function useLogoDataUrl(logoUrl: string | null): string | null {
  const [fetched, setFetched] = useState<{ src: string; dataUrl: string } | null>(null);

  useEffect(() => {
    if (!logoUrl || logoUrl.startsWith("data:")) return;

    let cancelled = false;

    async function convert() {
      try {
        const res = await fetch(`/api/upload/qr-logo/proxy?url=${encodeURIComponent(logoUrl!)}`);
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === "string") {
            setFetched({ src: logoUrl!, dataUrl: reader.result });
          }
        };
        reader.readAsDataURL(blob);
      } catch {}
    }

    convert();

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  if (!logoUrl) return null;
  if (logoUrl.startsWith("data:")) return logoUrl;
  return fetched?.src === logoUrl ? fetched.dataUrl : null;
}

export const QrStyled = forwardRef<QrStyledHandle, QrStyledProps>(function QrStyled({ url, settings, size }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<InstanceType<typeof import("qr-code-styling").default> | null>(null);
  const initedRef = useRef(false);
  const [ready, setReady] = useState(false);

  const logoDataUrl = useLogoDataUrl(settings.logoUrl);

  useImperativeHandle(ref, () => ({
    getRawData: async (extension) => {
      if (!qrRef.current) return null;
      const data = await qrRef.current.getRawData(extension);
      if (data instanceof Blob) return data;
      return null;
    },
    getCanvas: () => {
      return containerRef.current?.querySelector("canvas") ?? null;
    },
  }));

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const QRCodeStyling = (await import("qr-code-styling")).default;

      if (cancelled || !containerRef.current) return;

      const hasLogo = !!logoDataUrl;

      const options = {
        width: size,
        height: size,
        type: "canvas" as const,
        data: url,
        image: logoDataUrl ?? undefined,
        dotsOptions: {
          color: settings.foregroundColor,
          type: settings.dotType,
        },
        backgroundOptions: {
          color: settings.backgroundColor,
        },
        cornersSquareOptions: {
          type: settings.cornerSquareType,
          color: settings.foregroundColor,
        },
        cornersDotOptions: {
          type: settings.cornerDotType,
          color: settings.foregroundColor,
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: settings.logoSize,
          margin: 4,
        },
        qrOptions: {
          errorCorrectionLevel: hasLogo ? ("Q" as const) : ("M" as const),
        },
      };

      if (!initedRef.current) {
        qrRef.current = new QRCodeStyling(options);
        containerRef.current.innerHTML = "";
        qrRef.current.append(containerRef.current);
        initedRef.current = true;
        if (!cancelled) setReady(true);
      } else {
        qrRef.current?.update(options);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [url, settings, size, logoDataUrl]);

  return (
    <div style={{ maxWidth: size, aspectRatio: "1" }} className="relative w-full">
      {!ready && <div className="absolute inset-0 animate-pulse rounded-lg bg-muted" />}
      <div ref={containerRef} className="[&_canvas]:max-w-full [&_canvas]:h-auto" />
    </div>
  );
});
