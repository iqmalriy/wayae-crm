"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { useDashboardActivity } from "../queries/get-dashboard-activity";
import { useDashboardSummary } from "../queries/get-dashboard-summary";
import { KpiTiles } from "./kpi-tiles";
import { DashboardCharts } from "./dashboard-charts";
import { RecentPanels } from "./recent-panels";
import type {
  DashboardRange,
  DashboardScope,
} from "../schemas/get-dashboard.schema";

const RANGES: DashboardRange[] = ["7d", "30d", "90d"];
const SCOPES: { value: DashboardScope; label: string }[] = [
  { value: "mine", label: "Mine" },
  { value: "team", label: "Team" },
];

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant={value === option.value ? "default" : "ghost"}
          className="h-7 px-2.5"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { setItems } = useBreadcrumb();
  const [range, setRange] = useState<DashboardRange>("30d");
  const [scope, setScope] = useState<DashboardScope>("mine");

  useEffect(() => {
    setItems([{ label: "Home" }]);
  }, [setItems]);

  const summary = useDashboardSummary({ range, scope });
  const activity = useDashboardActivity({ range, scope });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your pipeline and activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={RANGES.map((r) => ({ value: r, label: r.toUpperCase() }))}
            value={range}
            onChange={setRange}
          />
          <Segmented options={SCOPES} value={scope} onChange={setScope} />
        </div>
      </div>

      <KpiTiles
        kpis={summary.data?.kpis}
        isPending={summary.isPending}
        isError={summary.isError}
      />
      <DashboardCharts
        activity={activity.data}
        isPending={activity.isPending}
        isError={activity.isError}
        range={range}
      />
      <RecentPanels
        summary={summary.data}
        isPending={summary.isPending}
        isError={summary.isError}
      />
    </div>
  );
}