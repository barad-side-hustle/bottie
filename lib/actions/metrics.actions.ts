"use server";

import { createSafeAction } from "./safe-action";
import { MetricsRepository } from "@/lib/db/repositories/metrics.repository";
import { z } from "zod";

const GetMetricsSchema = z.object({
  locationId: z.string().uuid(),
  dateFrom: z.date(),
  dateTo: z.date(),
});

export const getPerformanceMetrics = createSafeAction(
  GetMetricsSchema,
  async ({ locationId, dateFrom, dateTo }, { userId }) => {
    const repo = new MetricsRepository(userId, locationId);
    const metrics = await repo.getMetrics(dateFrom, dateTo);

    const totals = {
      totalImpressions: 0,
      searchImpressions: 0,
      mapsImpressions: 0,
      websiteClicks: 0,
      phoneCallClicks: 0,
      directionRequests: 0,
    };

    for (const m of metrics) {
      const search = m.searchImpressionsDesktop + m.searchImpressionsMobile;
      const maps = m.mapsImpressionsDesktop + m.mapsImpressionsMobile;
      totals.searchImpressions += search;
      totals.mapsImpressions += maps;
      totals.totalImpressions += search + maps;
      totals.websiteClicks += m.websiteClicks;
      totals.phoneCallClicks += m.phoneCallClicks;
      totals.directionRequests += m.directionRequests;
    }

    const daily = metrics
      .map((m) => ({
        date: m.date.toISOString().split("T")[0],
        impressions:
          m.searchImpressionsDesktop + m.searchImpressionsMobile + m.mapsImpressionsDesktop + m.mapsImpressionsMobile,
        websiteClicks: m.websiteClicks,
        phoneCallClicks: m.phoneCallClicks,
        directionRequests: m.directionRequests,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { totals, daily };
  }
);
