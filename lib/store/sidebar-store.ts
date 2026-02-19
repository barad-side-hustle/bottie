import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,

      setCollapsed: (collapsed: boolean) => {
        set({ collapsed });
      },

      toggle: () => {
        set((state) => ({ collapsed: !state.collapsed }));
      },
    }),
    {
      name: "bottie-sidebar-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
