import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function HomeRoutePage() {
  return <DashboardPage />;
}