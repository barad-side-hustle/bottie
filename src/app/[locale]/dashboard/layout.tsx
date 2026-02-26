import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { locationMembers, locations, accountLocations, userAccounts } from "@/lib/db/schema";
import { StatsRepository } from "@/lib/db/repositories/stats.repository";
import { DashboardLayoutClient } from "./DashboardLayoutClient";
import type { SidebarLocation } from "@/contexts/SidebarDataContext";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const userId = session.user.id;
  const stats = new StatsRepository();

  const memberLocations = await db
    .select({
      locationId: locations.id,
      locationName: locations.name,
      photoUrl: locations.photoUrl,
      role: locationMembers.role,
    })
    .from(locationMembers)
    .innerJoin(locations, eq(locationMembers.locationId, locations.id))
    .where(eq(locationMembers.userId, userId));

  const legacyLocations = await db
    .select({
      locationId: locations.id,
      locationName: locations.name,
      photoUrl: locations.photoUrl,
      connected: accountLocations.connected,
    })
    .from(accountLocations)
    .innerJoin(userAccounts, eq(userAccounts.accountId, accountLocations.accountId))
    .innerJoin(locations, eq(locations.id, accountLocations.locationId))
    .where(eq(userAccounts.userId, userId));

  const memberLocationIds = new Set(memberLocations.map((ml) => ml.locationId));
  const sidebarLocations: SidebarLocation[] = [
    ...memberLocations.map((ml) => ({
      locationId: ml.locationId,
      locationName: ml.locationName,
      photoUrl: ml.photoUrl,
      connected: true,
      role: ml.role as "owner" | "admin",
    })),
    ...legacyLocations
      .filter((ll) => !memberLocationIds.has(ll.locationId) && ll.connected)
      .map((ll) => ({
        locationId: ll.locationId,
        locationName: ll.locationName,
        photoUrl: ll.photoUrl,
        connected: ll.connected,
        role: "owner" as const,
      })),
  ];

  const pendingCount = await stats.countPendingReviews(userId);

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };

  return (
    <DashboardLayoutClient locations={sidebarLocations} pendingCount={pendingCount} user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
