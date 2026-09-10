"use client";

import type { MessageView } from "../../types/response-types";

export function TextMessage({ message }: { message: MessageView }) {
  if (!message.body) return null;
  return <p className="break-words whitespace-pre-wrap">{message.body}</p>;
}