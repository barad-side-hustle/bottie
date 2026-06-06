import { ReactNode } from "react";

export function NavbarContainer({ children }: { children: ReactNode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 rounded-full border border-border/60 bg-card/80 ps-4 pe-2 shadow-sm backdrop-blur-lg">
        {children}
      </div>
    </header>
  );
}
