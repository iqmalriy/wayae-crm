import type { Metadata } from "next";
import { LeadDetailPage } from "@/features/leads";

export const metadata: Metadata = {
  title: "Lead Detail",
};

export default function LeadDetailRoutePage() {
  return <LeadDetailPage />;
}