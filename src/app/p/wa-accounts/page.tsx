import type { Metadata } from "next";
import { WaAccountsPage } from "@/features/wa-accounts";

export const metadata: Metadata = {
  title: "WA Accounts",
};

export default function WaAccountsRoutePage() {
  return <WaAccountsPage />;
}