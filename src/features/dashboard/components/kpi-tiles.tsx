"use client";

import {
  AlarmClockIcon,
  ContactRoundIcon,
  ListTodoIcon,
  MailOpenIcon,
  MessageSquareTextIcon,
  TargetIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
  WifiIcon,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardKpis, Kpi } from "../types/response-types";

interface KpiConfig {
  key: keyof DashboardKpis;
  label: string;
  icon: LucideIcon;
  goodWhenUp: boolean;
  format?: (value: number) => string;
}

const COUNT_FORMAT = (value: number) => Math.round(value).toLocaleString();

const KPI_CONFIG: KpiConfig[] = [
  {
    key: "openConversations",
    label: "Open Conversations",
    icon: MessageSquareTextIcon,
    goodWhenUp: true,
    format: COUNT_FORMAT,
  },
  {
    key: "unreadConversations",
    label: "Unread",
    icon: MailOpenIcon,
    goodWhenUp: false,
    format: COUNT_FORMAT,
  },
  {
    key: "openLeads",
    label: "Open Leads",
    icon: TargetIcon,
    goodWhenUp: true,
    format: COUNT_FORMAT,
  },
  {
    key: "pipelineValue",
    label: "Pipeline Value",
    icon: WalletIcon,
    goodWhenUp: true,
    format: (value) =>
      new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value),
  },
  {
    key: "openTasks",
    label: "Open Tasks",
    icon: ListTodoIcon,
    goodWhenUp: true,
    format: COUNT_FORMAT,
  },
  {
    key: "overdueTasks",
    label: "Overdue Tasks",
    icon: AlarmClockIcon,
    goodWhenUp: false,
    format: COUNT_FORMAT,
  },
  {
    key: "totalCustomers",
    label: "Active Customers",
    icon: ContactRoundIcon,
    goodWhenUp: true,
    format: COUNT_FORMAT,
  },
  {
    key: "onlineWaAccounts",
    label: "WA Online",
    icon: WifiIcon,
    goodWhenUp: true,
    format: COUNT_FORMAT,
  },
];

function DeltaBadge({ delta, goodWhenUp }: { delta: number | null; goodWhenUp: boolean }) {
  if (delta === null) {
    return <span className="text-xs text-muted-foreground">No prior data</span>;
  }
  if (delta === 0) {
    return <span className="text-xs text-muted-foreground">No change</span>;
  }
  const good = goodWhenUp ? delta > 0 : delta < 0;
  const Icon = delta > 0 ? TrendingUpIcon : TrendingDownIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        good ? "text-emerald-600" : "text-destructive",
      )}
    >
      <Icon className="size-3" />
      {delta > 0 ? "+" : ""}
      {delta}%
    </span>
  );
}

interface KpiTilesProps {
  kpis?: DashboardKpis;
  isPending: boolean;
  isError: boolean;
}

export function KpiTiles({ kpis, isPending, isError }: KpiTilesProps) {
  if (isError) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Failed to load dashboard metrics.
        </div>
      </div>
    );
  }

  if (isPending || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_CONFIG.map((kpi) => {
        const value = kpis[kpi.key] as Kpi;
        const Icon = kpi.icon;
        return (
          <Card key={kpi.key}>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
                {kpi.format ? kpi.format(value.value) : value.value}
              </span>
              <DeltaBadge delta={value.delta} goodWhenUp={kpi.goodWhenUp} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}