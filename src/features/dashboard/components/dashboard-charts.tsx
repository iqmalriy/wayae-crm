"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardRange } from "../schemas/get-dashboard.schema";
import type {
  ActivityPoint,
  ConversationVolumePoint,
  DashboardActivity,
  LeadStageCount,
} from "../types/response-types";

const STAGE_ORDER = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
];

const activityConfig = {
  leads: { label: "Leads", color: "var(--chart-1)" },
  messages: { label: "Messages", color: "var(--chart-2)" },
} satisfies ChartConfig;

const volumeConfig = {
  conversations: { label: "Conversations", color: "var(--chart-3)" },
} satisfies ChartConfig;

function tickFormatter(range: DashboardRange) {
  const options: Intl.DateTimeFormatOptions =
    range === "7d"
      ? { month: "short", day: "numeric", hour: "2-digit" }
      : { month: "short", day: "numeric" };
  return (value: string) => new Date(value).toLocaleDateString(undefined, options);
}

function ActivityTrendChart({
  data,
  range,
}: {
  data: ActivityPoint[];
  range: DashboardRange;
}) {
  return (
    <ChartContainer config={activityConfig} className="h-64 w-full">
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={tickFormatter(range)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="messages"
          type="monotone"
          fill="var(--color-messages)"
          stroke="var(--color-messages)"
          strokeWidth={2}
          fillOpacity={0.2}
        />
        <Area
          dataKey="leads"
          type="monotone"
          fill="var(--color-leads)"
          stroke="var(--color-leads)"
          strokeWidth={2}
          fillOpacity={0.25}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function ConversationVolumeChart({
  data,
  range,
}: {
  data: ConversationVolumePoint[];
  range: DashboardRange;
}) {
  return (
    <ChartContainer config={volumeConfig} className="h-64 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={tickFormatter(range)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="conversations"
          fill="var(--color-conversations)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

function LeadFunnel({ data }: { data: LeadStageCount[] }) {
  const ordered = [...data].sort(
    (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
  );
  const max = Math.max(...ordered.map((row) => row.count), 1);

  if (ordered.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No leads yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {ordered.map((row) => (
        <div key={row.stage} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs capitalize text-muted-foreground">
            {row.stage}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/80 transition-all"
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-xs tabular-nums">
            {row.count}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DashboardChartsProps {
  activity?: DashboardActivity;
  isPending: boolean;
  isError: boolean;
  range: DashboardRange;
}

export function DashboardCharts({
  activity,
  isPending,
  isError,
  range,
}: DashboardChartsProps) {
  if (isError) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive lg:col-span-3">
          Failed to load dashboard charts.
        </div>
      </div>
    );
  }

  if (isPending || !activity) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl lg:col-span-3" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.activityTrend.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No activity in this range.
            </div>
          ) : (
            <ActivityTrendChart data={activity.activityTrend} range={range} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadFunnel data={activity.leadFunnel} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Conversation Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.conversationVolume.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No conversations in this range.
            </div>
          ) : (
            <ConversationVolumeChart
              data={activity.conversationVolume}
              range={range}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}