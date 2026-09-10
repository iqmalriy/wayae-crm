"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActivityIcon } from "lucide-react";
import { HeartbeatActivityChart } from "./heartbeat-activity-chart";

interface RangePreset {
  label: string;
  from?: string;
  to?: string;
  bucket: string;
}

const PRESETS: RangePreset[] = [
  { label: "6h", bucket: "minute" },
  { label: "24h", bucket: "hour" },
  { label: "7d", bucket: "day" },
  { label: "30d", bucket: "day" },
];

function hoursAgoISO(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function presetRange(hours: number): RangePreset {
  return {
    label: `${hours}h`,
    from: hoursAgoISO(hours),
    to: new Date().toISOString(),
    bucket: hours <= 6 ? "minute" : hours <= 48 ? "hour" : "day",
  };
}

export function HeartbeatActivityDialog({
  id,
  label,
  phone,
}: {
  id: string;
  label: string;
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<RangePreset>(() =>
    presetRange(24),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="View activity">
            <ActivityIcon />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Activity</DialogTitle>
          <DialogDescription>
            {label} · {phone}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                range.label === preset.label && "border-foreground",
              )}
              onClick={() =>
                setRange({
                  ...preset,
                  from: presetRange(
                    preset.label === "6h"
                      ? 6
                      : preset.label === "24h"
                        ? 24
                        : preset.label === "7d"
                          ? 168
                          : 720,
                  ).from,
                  to: new Date().toISOString(),
                })
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <HeartbeatActivityChart
          waAccountId={id}
          from={range.from}
          to={range.to}
          bucket={range.bucket}
        />
      </DialogContent>
    </Dialog>
  );
}