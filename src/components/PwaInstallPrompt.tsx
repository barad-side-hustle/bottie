"use client";

import { useEffect, useRef } from "react";
import { sileo } from "sileo";
import { useTranslations } from "next-intl";
import { sendRybbitEvent } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const t = useTranslations("common.pwaInstall");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const toastId = useRef<string | null>(null);

  useEffect(() => {
    const title = t("title");
    const description = t("description");
    const install = t("install");

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;

      if (sessionStorage.getItem("pwa-install-prompted")) return;
      sessionStorage.setItem("pwa-install-prompted", "1");

      toastId.current = sileo.action({
        title,
        description,
        duration: null,
        button: {
          title: install,
          onClick: async () => {
            const prompt = deferredPrompt.current;
            if (!prompt) return;

            await prompt.prompt();
            const { outcome } = await prompt.userChoice;

            if (outcome === "accepted") {
              sendRybbitEvent("pwa_install_accepted");
            }

            deferredPrompt.current = null;
            if (toastId.current) {
              sileo.dismiss(toastId.current);
              toastId.current = null;
            }
          },
        },
      });
    };

    const onAppInstalled = () => {
      sendRybbitEvent("pwa_installed");
      deferredPrompt.current = null;
      if (toastId.current) {
        sileo.dismiss(toastId.current);
        toastId.current = null;
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [t]);

  return null;
}
