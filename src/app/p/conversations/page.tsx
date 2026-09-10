import type { Metadata } from "next";
import { ConversationsPage } from "@/features/wa-conversations";

export const metadata: Metadata = {
  title: "Conversations",
};

export default function ConversationsRoutePage() {
  return <ConversationsPage />;
}