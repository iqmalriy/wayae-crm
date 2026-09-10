"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useHeartbeatActivity } from "../queries/list-heartbeat-activity";

const chartConfig = {
  count: {
    label: "Heartbeats",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const BUCKET_FORMAT: Record<string, Intl.DateTimeFormatOptions> = {
  minute: { hour: "2-digit", minute: "2-digit" },
  hour: { month: "short", day: "numeric", hour: "2-digit" },
  day: { month: "short", day: "numeric" },
};

interface HeartbeatActivityChartProps {
  waAccountId: string;
  from?: string;
  to?: string;
  bucket?: string;
  className?: string;
}

export function HeartbeatActivityChart({
  waAccountId,
  from,
  to,
  bucket = "hour",
  className,
}: HeartbeatActivityChartProps) {
  const { data, isPending, isError } = useHeartbeatActivity(waAccountId, {
    from,
    to,
    bucket,
  });

  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-destructive">
        Failed to load heartbeat activity.
      </div>
    );
  }

  if (isPending || !data) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading heartbeat activity...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No heartbeat data in this range.
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat(undefined, BUCKET_FORMAT[bucket]);

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-96 w-full", className)}
    >
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={(value) => formatter.format(new Date(value))}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelKey="count"
              labelFormatter={(_, payload) => {
                const point = payload[0]?.payload as { timestamp?: string };
                return point?.timestamp
                  ? formatter.format(new Date(point.timestamp))
                  : "";
              }}
              hideLabel
            />
          }
        />
        <Area
          dataKey="count"
          type="monotone"
          fill="var(--color-count)"
          fillOpacity={0.25}
          stroke="var(--color-count)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}