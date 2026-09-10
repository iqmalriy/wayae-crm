"use client";

import { DownloadIcon, FileIcon, FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageView } from "../../types/response-types";

function FileIconMark({ mimetype }: { mimetype: string | null | undefined }) {
  const isPdf = mimetype === "application/pdf" || mimetype === "text/plain";
  const Icon = isPdf ? FileTextIcon : FileIcon;
  return <Icon className="size-5" />;
}

function fileName(message: MessageView): string {
  return (
    message.media?.filename ??
    message.body?.trim() ??
    message.media?.mimetype ??
    "Attachment"
  );
}

export function FileMessage({
  message,
  isMine,
}: {
  message: MessageView;
  isMine: boolean;
}) {
  const mediaId = message.media?.mediaId;
  const name = fileName(message);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isMine ? "bg-primary-foreground/20" : "bg-foreground/10",
        )}
      >
        <FileIconMark mimetype={message.media?.mimetype} />
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="max-w-[16rem] truncate text-sm font-medium">
          {name}
        </span>
        {message.media?.mimetype ? (
          <span className="truncate text-[10px] opacity-70">
            {message.media.mimetype}
          </span>
        ) : null}
      </div>

      {mediaId ? (
        <a
          href={`/api/v1/media/${mediaId}`}
          download={name}
          aria-label={`Download ${name}`}
          className={cn(
            "ml-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
            isMine
              ? "text-primary-foreground/80 hover:bg-primary-foreground/20"
              : "text-muted-foreground hover:bg-foreground/10",
          )}
        >
          <DownloadIcon className="size-4" />
        </a>
      ) : null}
    </div>
  );
}