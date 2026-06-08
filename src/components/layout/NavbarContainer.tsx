import { ReactNode } from "react";

export function NavbarContainer({ children }: { children: ReactNode }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}
