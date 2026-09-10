"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GitCommitHorizontalIcon,
  HistoryIcon,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/datetime";
import { useLeadActivities } from "../queries/list-lead-activities";
import { CreateLeadActivityDialog } from "./create-lead-activity-dialog";
import type { LeadActivityView } from "../types/response-types";

interface LeadActivitiesProps {
  leadId: string;
  canAdd: boolean;
}

function ActivityItem({ activity }: { activity: LeadActivityView }) {
  const isStageChange = Boolean(activity.fromStage || activity.toStage);

  if (isStageChange) {
    return (
      <li className="flex gap-3">
        <GitCommitHorizontalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Stage changed</span>
            <Badge variant="secondary" className="capitalize">
              {activity.fromStage}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge className="capitalize">{activity.toStage}</Badge>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(activity.createdAt)}
            </span>
          </div>
          {activity.body ? (
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
              {activity.body}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {activity.performedByName ?? "Unknown"}
          </p>
        </div>
      </li>
    );
  }

  return (
    <li className="flex gap-3">
      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/50" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm whitespace-pre-wrap">
            {activity.body ?? "—"}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {activity.performedByName ?? "Unknown"}
        </p>
      </div>
    </li>
  );
}

export function LeadActivities({ leadId, canAdd }: LeadActivitiesProps) {
  const { data, isPending } = useLeadActivities(leadId);

  const activities = data?.activities ?? [];

  return (
    <div className="flex flex-col gap-4">
      {canAdd ? (
        <div className="flex justify-end">
          <CreateLeadActivityDialog leadId={leadId} />
        </div>
      ) : null}

      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : activities.length > 0 ? (
        <ul className="flex flex-col gap-5">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
          <HistoryIcon className="size-6" />
          <p className="text-sm">No activities yet.</p>
        </div>
      )}
    </div>
  );
}