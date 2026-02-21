import { getLandingStats } from "@/lib/data/landing-stats";
import { StatisticsContent } from "./StatisticsContent";

export async function Statistics() {
  const stats = await getLandingStats();

  return <StatisticsContent stats={stats} />;
}
