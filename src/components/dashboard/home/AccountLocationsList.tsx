"use client";

import { useState } from "react";
import type { AccountWithLocations } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { MapPin, BarChart3, Settings2, Star } from "lucide-react";
import Image from "next/image";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountAvatarDropdown } from "./AccountAvatarDropdown";
import { motion } from "framer-motion";

interface AccountLocationsListProps {
  accounts: AccountWithLocations[];
}

export function AccountLocationsList({ accounts }: AccountLocationsListProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.home.accountBusinessesList");
  const [loadingState, setLoadingState] = useState<{
    locationId: string;
    action: "reviews" | "settings" | "insights";
  } | null>(null);

  const handleViewReviews = (accountId: string, locationId: string) => {
    setLoadingState({ locationId, action: "reviews" });
    router.push(`/dashboard/accounts/${accountId}/locations/${locationId}/reviews`);
  };

  const handleEditDetails = (accountId: string, locationId: string) => {
    setLoadingState({ locationId, action: "settings" });
    router.push(`/dashboard/accounts/${accountId}/locations/${locationId}/settings`);
  };

  const handleViewInsights = (accountId: string, locationId: string) => {
    setLoadingState({ locationId, action: "insights" });
    router.push(`/dashboard/accounts/${accountId}/locations/${locationId}/insights`);
  };

  const handleAddLocation = () => {
    router.push("/onboarding/connect-account");
  };

  if (accounts.length === 0) {
    return (
      <EmptyState
        title={t("noConnectedAccounts")}
        description={t("noConnectedAccountsDescription")}
        actionLabel={t("connectAccount")}
        onAction={handleAddLocation}
      />
    );
  }

  return (
    <div className="space-y-8">
      {accounts.map((account) => (
        <div key={account.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <AccountAvatarDropdown account={account} />
            <div>
              <h2 className="text-2xl font-bold">{account.accountName}</h2>
              <p className="text-sm text-muted-foreground">{account.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {account.accountLocations.map((accountLocation, index) => {
              const location = accountLocation.location;
              return (
                <motion.div
                  key={accountLocation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  <DashboardCard>
                    <DashboardCardHeader>
                      {location.photoUrl && (
                        <Image
                          src={location.photoUrl}
                          alt={location.name}
                          className="w-full h-32 object-cover rounded-t-2xl -mt-8 -mx-8 mb-4"
                          width={400}
                          height={128}
                        />
                      )}
                      <DashboardCardTitle>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="truncate">{location.name}</span>
                          {!accountLocation.connected && <Badge variant="secondary">{t("disconnected")}</Badge>}
                        </div>
                      </DashboardCardTitle>
                    </DashboardCardHeader>
                    <DashboardCardContent className="space-y-4 flex flex-col">
                      {location.address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="truncate">{location.address}</span>
                        </div>
                      )}
                      {location.description && (
                        <div className="bg-pastel-lavender/20 p-4 rounded-xl leading-relaxed text-sm text-muted-foreground line-clamp-3">
                          {location.description}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2 mt-auto">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 min-w-[100px] shadow-primary hover:shadow-xl transition-all duration-300"
                          onClick={() => handleViewReviews(account.id, location.id)}
                          disabled={loadingState?.locationId === location.id && loadingState?.action === "reviews"}
                        >
                          <Star className="h-4 w-4 ms-1" />
                          {loadingState?.locationId === location.id && loadingState?.action === "reviews"
                            ? t("navigating")
                            : t("viewReviews")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] hover:bg-pastel-lavender/10 transition-all duration-300"
                          onClick={() => handleViewInsights(account.id, location.id)}
                          disabled={loadingState?.locationId === location.id && loadingState?.action === "insights"}
                        >
                          <BarChart3 className="h-4 w-4 me-1" />
                          {loadingState?.locationId === location.id && loadingState?.action === "insights"
                            ? t("navigating")
                            : t("viewInsights")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] hover:bg-pastel-lavender/10 transition-all duration-300"
                          onClick={() => handleEditDetails(account.id, location.id)}
                          disabled={loadingState?.locationId === location.id && loadingState?.action === "settings"}
                        >
                          <Settings2 className="h-4 w-4 me-1" />
                          {loadingState?.locationId === location.id && loadingState?.action === "settings"
                            ? t("navigating")
                            : t("editDetails")}
                        </Button>
                      </div>
                    </DashboardCardContent>
                  </DashboardCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
