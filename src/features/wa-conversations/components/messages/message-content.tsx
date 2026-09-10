"use client";

import type { MessageView } from "../../types/response-types";
import { TextMessage } from "./text-message";
import { ImageMessage } from "./image-message";
import { FileMessage } from "./file-message";

export function MessageContent({
  message,
  isMine,
  onPreview,
}: {
  message: MessageView;
  isMine: boolean;
  onPreview: (message: MessageView) => void;
}) {
  const mimetype = message.media?.mimetype;

  if (mimetype?.startsWith("image/")) {
    return <ImageMessage message={message} onPreview={onPreview} />;
  }

  if (message.media) {
    return <FileMessage message={message} isMine={isMine} />;
  }

  return <TextMessage message={message} />;
}