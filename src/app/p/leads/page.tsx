import type { Metadata } from "next";
import { LeadsPage } from "@/features/leads";

export const metadata: Metadata = {
  title: "Leads",
};

export default function LeadsRoutePage() {
  return <LeadsPage />;
}