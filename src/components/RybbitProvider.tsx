"use client";

import rybbit from "@rybbit/js";
import { useEffect, useRef } from "react";

export function RybbitProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    rybbit.init({
      siteId: "91604d9cddac",
      analyticsHost: "https://app.rybbit.io/api",
    });
  }, []);

  return null;
}
