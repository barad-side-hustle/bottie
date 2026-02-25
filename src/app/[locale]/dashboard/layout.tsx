import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAccountsWithLocations } from "@/lib/actions/accounts.actions";
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

  const stats = new StatsRepository();
  const [accounts, pendingCount] = await Promise.all([
    getAccountsWithLocations(),
    stats.countPendingReviews(session.user.id),
  ]);
  const locations: SidebarLocation[] = accounts.flatMap((account) =>
    account.accountLocations.map((al) => ({
      accountId: account.id,
      accountName: account.accountName ?? account.email,
      locationId: al.location.id,
      locationName: al.location.name,
      photoUrl: al.location.photoUrl,
      connected: al.connected,
    }))
  );

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };

  return (
    <DashboardLayoutClient locations={locations} pendingCount={pendingCount} user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
