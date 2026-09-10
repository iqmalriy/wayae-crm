import { z } from "zod";

export const dashboardRange = z.enum(["7d", "30d", "90d"]);
export const dashboardScope = z.enum(["mine", "team"]);

export type DashboardRange = z.infer<typeof dashboardRange>;
export type DashboardScope = z.infer<typeof dashboardScope>;
export type DashboardBucket = "hour" | "day";

export const getDashboardSummaryQuery = z.object({
  range: dashboardRange.default("30d"),
  scope: dashboardScope.default("mine"),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});
export type DashboardSummaryQuery = z.infer<typeof getDashboardSummaryQuery>;

export const getDashboardActivityQuery = z.object({
  range: dashboardRange.default("30d"),
  scope: dashboardScope.default("mine"),
});
export type DashboardActivityQuery = z.infer<typeof getDashboardActivityQuery>;
