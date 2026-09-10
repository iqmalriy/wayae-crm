"use client";

import { Badge } from "@/components/ui/badge";
import { useListWaAccountStatus } from "../queries/list-wa-account-status";
import { cn } from "@/lib/utils";

const ONLINE_WINDOW_MS = 3 * 60 * 1000;

function isOnline(lastHeartbeatAt: string | null): boolean {
  if (!lastHeartbeatAt) return false;
  return Date.now() - new Date(lastHeartbeatAt).getTime() <= ONLINE_WINDOW_MS;
}

export function WaAccountStatusBanner() {
  const { data, isPending, isError } = useListWaAccountStatus();

  if (isError) {
    return (
      <div className="flex h-8 items-center gap-2 border-b bg-destructive/10 px-4 text-xs font-medium text-destructive">
        Failed to load WhatsApp account status.
      </div>
    );
  }

  if (isPending || !data) {
    return (
      <div className="flex h-8 items-center gap-2 border-b bg-muted/40 px-4 text-xs text-muted-foreground">
        Checking WhatsApp account status...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-8 items-center gap-2 border-b bg-muted/40 px-4 text-xs text-muted-foreground">
        No WhatsApp accounts.
      </div>
    );
  }

  const onlineCount = data.filter((item) => isOnline(item.lastHeartbeatAt)).length;
  const allOnline = onlineCount === data.length;

  return (
    <div
      className={cn(
        "flex h-8 items-center gap-2 overflow-x-auto border-b px-4 text-xs font-medium",
        allOnline ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600",
      )}
    >
      <span className="shrink-0">
        {allOnline
          ? "All WhatsApp accounts online"
          : `${onlineCount}/${data.length} WhatsApp accounts online`}
      </span>
      <span className="mx-1 h-4 shrink-0 border-r" />
      <div className="flex shrink-0 items-center gap-2">
        {data.map((item) => {
          const online = isOnline(item.lastHeartbeatAt);
          return (
            <Badge
              key={item.label}
              variant={online ? "default" : "secondary"}
              className={cn(
                "gap-1.5",
                online ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  online ? "bg-white" : "bg-muted-foreground/60",
                )}
              />
              {item.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}