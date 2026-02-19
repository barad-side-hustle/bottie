import { Polar } from "@polar-sh/sdk";
import { env } from "@/lib/env";

let _polar: Polar | null = null;

export function getPolar(): Polar {
  if (!_polar) {
    _polar = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
    });
  }
  return _polar;
}
