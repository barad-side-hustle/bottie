import { type Metadata } from "next";

export function generatePrivatePageMetadata(title?: string): Metadata {
  return {
    title: title || "Dashboard",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      nosnippet: true,
      noimageindex: true,
    },
  };
}
