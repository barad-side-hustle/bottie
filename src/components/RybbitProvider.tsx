"use client";

import rybbit from "@rybbit/js";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function RybbitProvider() {
  const initialized = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    rybbit.init({
      siteId: "91604d9cddac",
      analyticsHost: "https://app.rybbit.io/api",
    });
  }, []);

  useEffect(() => {
    if (!initialized.current) return;

    if (user) {
      rybbit.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
      });
    } else {
      rybbit.clearUserId();
    }
  }, [user]);

  return null;
}
