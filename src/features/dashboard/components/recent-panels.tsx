"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "../types/response-types";

function timeAgo(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

function dueLabel(value: string | null): string {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return formatDistanceToNow(date, { addSuffix: true });
}

function stageVariant(stage: string) {
  switch (stage) {
    case "won":
      return "default" as const;
    case "lost":
      return "secondary" as const;
    case "proposal":
    case "qualified":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function priorityVariant(priority: string) {
  switch (priority) {
    case "high":
      return "destructive" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

interface PanelShellProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

function PanelShell({ title, href, children }: PanelShellProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Link
            href={href}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

function RecentLeads({
  summary,
  isPending,
}: {
  summary?: DashboardSummary;
  isPending: boolean;
}) {
  if (isPending || !summary) return <PanelSkeleton />;
  if (summary.recentLeads.length === 0) {
    return <EmptyPanel>No leads yet.</EmptyPanel>;
  }
  return (
    <ul className="divide-y">
      {summary.recentLeads.map((lead) => (
        <li key={lead.id}>
          <Link
            href={`/p/leads/${lead.id}`}
            className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {lead.name ?? lead.leadNumber}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {lead.company ?? lead.leadNumber}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={stageVariant(lead.stage)}>{lead.stage}</Badge>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {timeAgo(lead.createdAt)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function RecentConversations({
  summary,
  isPending,
}: {
  summary?: DashboardSummary;
  isPending: boolean;
}) {
  if (isPending || !summary) return <PanelSkeleton />;
  if (summary.recentConversations.length === 0) {
    return <EmptyPanel>No conversations yet.</EmptyPanel>;
  }
  return (
    <ul className="divide-y">
      {summary.recentConversations.map((conversation) => (
        <li key={conversation.id}>
          <Link
            href="/p/conversations"
            className="flex items-center gap-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                conversation.unread ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {conversation.title ?? "Untitled conversation"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {conversation.lastMessagePreview ?? "No messages"}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(conversation.lastMessageAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function UpcomingTasks({
  summary,
  isPending,
}: {
  summary?: DashboardSummary;
  isPending: boolean;
}) {
  if (isPending || !summary) return <PanelSkeleton />;
  if (summary.upcomingTasks.length === 0) {
    return <EmptyPanel>No upcoming tasks.</EmptyPanel>;
  }
  return (
    <ul className="divide-y">
      {summary.upcomingTasks.map((task) => (
        <li key={task.id}>
          <Link
            href="/p/tasks"
            className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{task.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {task.assigneeName ?? "Unassigned"} · {dueLabel(task.dueAt)}
              </p>
            </div>
            <Badge variant={priorityVariant(task.priority)} className="shrink-0">
              {task.priority}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WaAccountStatus({
  summary,
  isPending,
}: {
  summary?: DashboardSummary;
  isPending: boolean;
}) {
  if (isPending || !summary) return <PanelSkeleton />;
  if (summary.waAccountStatus.length === 0) {
    return <EmptyPanel>No WhatsApp accounts.</EmptyPanel>;
  }
  return (
    <ul className="divide-y">
      {summary.waAccountStatus.map((account) => (
        <li
          key={account.id}
          className="flex items-center justify-between gap-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                account.online ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {account.label || account.phone}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {account.phone}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 text-xs",
              account.online ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            {account.online ? "Online" : "Offline"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

interface RecentPanelsProps {
  summary?: DashboardSummary;
  isPending: boolean;
  isError: boolean;
}

export function RecentPanels({ summary, isPending, isError }: RecentPanelsProps) {
  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load recent data.
      </div>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PanelShell title="Recent Conversations" href="/p/conversations">
        <RecentConversations summary={summary} isPending={isPending} />
      </PanelShell>
      <PanelShell title="Upcoming Tasks" href="/p/tasks">
        <UpcomingTasks summary={summary} isPending={isPending} />
      </PanelShell>
      <PanelShell title="Recent Leads" href="/p/leads">
        <RecentLeads summary={summary} isPending={isPending} />
      </PanelShell>
      <PanelShell title="WhatsApp Accounts" href="/p/wa-accounts">
        <WaAccountStatus summary={summary} isPending={isPending} />
      </PanelShell>
    </div>
  );
}