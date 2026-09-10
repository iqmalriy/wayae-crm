"use client";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppError, type AppErrorCode } from "@/lib/errors";
import { toast } from "@/components/ui/toast";
import type { PollConversationsOutput } from "../types/response-types";

interface ErrorBody {
  message: string;
  errors: { code: AppErrorCode; message: string; path?: string }[];
}
interface SuccessBody {
  data: PollConversationsOutput;
}

export interface PolledConversation {
  id: string;
  name: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export function usePollConversations(options?: {
  interval?: number;
  skipConversationId?: string | null;
}) {
  const interval = options?.interval ?? 5000;
  const skipConversationId = options?.skipConversationId;
  const serverTsRef = useRef<string | undefined>(undefined);
  const seenRef = useRef<Record<string, string | null>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playSound() {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      audioRef.current = new Audio("/notif.wav");
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  return useQuery({
    queryKey: ["conversations-poll"],
    queryFn: async (): Promise<PollConversationsOutput> => {
      const since = serverTsRef.current;
      const query = since ? `?since=${encodeURIComponent(since)}` : "";
      const response = await fetch(`/api/v1/conversations/poll${query}`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | ErrorBody
          | null;
        const first = body?.errors?.[0];
        throw new AppError(first?.code ?? "INTERNAL", {
          message: body?.message ?? first?.code ?? "INTERNAL",
        });
      }
      const body = (await response.json()) as SuccessBody;
      const output = body.data;
      const isFirstPoll = serverTsRef.current === undefined;
      serverTsRef.current = output.serverTs;

      for (const conversation of output.conversations) {
        if (conversation.id === skipConversationId) continue;
        const current = conversation.lastMessageAt;
        if (isFirstPoll) {
          seenRef.current[conversation.id] = current;
          continue;
        }
        const previous = seenRef.current[conversation.id];
        const isNew =
          previous === undefined ||
          (current !== null && current !== previous);
        seenRef.current[conversation.id] = current;
        if (isNew && current && !conversation.lastMessageFromMe) {
          toast.add({
            type: "info",
            title: `New message from ${conversation.name ?? "Unknown"}`,
            description: conversation.lastMessagePreview ?? "",
          });
          playSound();
        }
      }

      return output;
    },
    refetchInterval: interval,
  });
}