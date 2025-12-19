import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";
import type { ReactNode } from "react";

export const metadata = generatePrivatePageMetadata("Error");

export default function AuthCodeErrorLayout({ children }: { children: ReactNode }) {
  return children;
}
