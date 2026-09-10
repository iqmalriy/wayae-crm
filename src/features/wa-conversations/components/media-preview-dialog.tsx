"use client";

import { DownloadIcon, FileIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/datetime";
import type { MessageView } from "../types/response-types";

interface MediaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: MessageView | null;
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function MediaPreviewDialog({
  open,
  onOpenChange,
  message,
}: MediaPreviewDialogProps) {
  const media = message?.media;
  const isImage = media?.mimetype?.startsWith("image/");
  const mediaId = media?.mediaId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{media?.filename ?? "Media"}</DialogTitle>
          <DialogDescription>
            {media?.mimetype ?? "Attachment"}
          </DialogDescription>
        </DialogHeader>

        {isImage && mediaId ? (
          <div className="flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg bg-muted">
            <img
              src={`/api/v1/media/${mediaId}`}
              alt={media?.filename ?? "Image"}
              className="max-h-[60vh] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 py-10 text-muted-foreground">
            <FileIcon className="size-10" />
            <p className="text-sm">
              {media?.filename ?? media?.mimetype ?? "Attachment"}
            </p>
          </div>
        )}

        <Separator />

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Filename</span>
            <span className="font-medium">
              {media?.filename ?? "-"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">{media?.mimetype ?? "-"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Size</span>
            <span className="font-medium">{formatBytes(media?.filesize)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Received</span>
            <span className="font-medium">
              {formatRelativeTime(message?.receivedAt)}
            </span>
          </div>
        </div>

        {mediaId ? (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`/api/v1/media/${mediaId}`}
                  download={media?.filename ?? "media"}
                />
              }
            >
              <DownloadIcon />
              Download
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}