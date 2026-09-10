"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheckIcon,
  ChevronsUpDownIcon,
  LaptopIcon,
  LogOutIcon,
  SmartphoneIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

function UserAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium text-foreground",
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          width={32}
          height={32}
          className="size-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function UserCard({ className }: { className?: string }) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const [sessions, setSessions] = useState<Array<{
    token: string;
    ipAddress?: string | null;
  }> | null>(null);

  async function loadSessions() {
    const { data } = await authClient.listSessions();
    setSessions(data ?? []);
  }

  const user = sessionData?.user;
  if (!user) return null;

  const currentToken = sessionData?.session?.token;
  const activeSessions = sessions?.filter((s) => s.token !== currentToken);

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  async function handleRevokeSession(token: string) {
    await authClient.revokeSession({ token });
    await loadSessions();
  }

  return (
    <Popover onOpenChange={(open) => open && void loadSessions()}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
              className
            )}
          >
            <UserAvatar name={user.name} image={user.image} />
            <div className="grid flex-1 gap-0.5 leading-none">
              <span className="truncate text-sm font-medium">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent
        align="start"
        side="right"
        sideOffset={8}
        className="w-96"
      >
        <PopoverHeader>
          <PopoverTitle>Account</PopoverTitle>
          <PopoverDescription>
            Manage your active sessions and sign out.
          </PopoverDescription>
        </PopoverHeader>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
          <UserAvatar name={user.name} image={user.image} className="size-10" />
          <div className="grid flex-1 gap-0.5">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <BadgeCheckIcon className="size-4 text-primary" />
        </div>

        <Separator />

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground">
            Active sessions
          </p>
          <div className="flex items-center gap-2 rounded-lg p-2 text-sm">
            <LaptopIcon className="size-4 shrink-0 text-muted-foreground" />
            <div className="grid flex-1 gap-0.5">
              <span className="font-medium">This device</span>
              <span className="text-xs text-muted-foreground">
                Current session
              </span>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          {activeSessions?.map((activeSession) => (
            <div
              key={activeSession.token}
              className="flex items-center gap-2 rounded-lg p-2 text-sm"
            >
              <SmartphoneIcon className="size-4 shrink-0 text-muted-foreground" />
              <div className="grid flex-1 gap-0.5">
                <span className="font-medium">Other session</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeSession.ipAddress || "Unknown IP"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleRevokeSession(activeSession.token)}
              >
                Sign out
              </Button>
            </div>
          ))}

          {!activeSessions?.length ? (
            <p className="px-2 text-xs text-muted-foreground">
              No other active sessions.
            </p>
          ) : null}
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <Separator />

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOutIcon />
          Sign out
        </Button>
      </PopoverContent>
    </Popover>
  );
}