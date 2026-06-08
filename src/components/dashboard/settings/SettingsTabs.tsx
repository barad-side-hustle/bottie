"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SettingsTab = "account" | "billing";

interface SettingsTabsProps {
  defaultTab: SettingsTab;
  accountLabel: string;
  billingLabel: string;
  account: React.ReactNode;
  billing: React.ReactNode;
}

export function SettingsTabs({ defaultTab, accountLabel, billingLabel, account, billing }: SettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<SettingsTab>(defaultTab);

  const handleChange = (value: string) => {
    const next = value === "billing" ? "billing" : "account";
    setTab(next);
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={tab} onValueChange={handleChange} className="mt-2">
      <TabsList>
        <TabsTrigger value="account">{accountLabel}</TabsTrigger>
        <TabsTrigger value="billing">{billingLabel}</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-6">
        {account}
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        {billing}
      </TabsContent>
    </Tabs>
  );
}
