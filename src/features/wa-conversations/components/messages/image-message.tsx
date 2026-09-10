"use client";

import type { MessageView } from "../../types/response-types";

export function ImageMessage({
  message,
  onPreview,
}: {
  message: MessageView;
  onPreview: (message: MessageView) => void;
}) {
  if (!message.media?.mediaId) return null;
  const label =
    message.media?.filename ?? message.media?.mimetype ?? "Image";

  return (
    <button
      type="button"
      onClick={() => onPreview(message)}
      className="cursor-zoom-in text-left"
    >
      <img
        src={`/api/v1/media/${message.media.mediaId}`}
        alt={label}
        className="max-h-64 max-w-full rounded-lg object-cover"
      />
    </button>
  );
}