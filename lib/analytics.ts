import rybbit from "@rybbit/js";

export function sendRybbitEvent(name: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") return;
  rybbit.event(name, properties);
}
