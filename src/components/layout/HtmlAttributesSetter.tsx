"use client";

import { useEffect } from "react";

interface HtmlAttributesSetterProps {
  lang: string;
  dir: string;
  className: string;
}

export function HtmlAttributesSetter({ lang, dir, className }: HtmlAttributesSetterProps) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    html.className = className;
  }, [lang, dir, className]);

  return null;
}
