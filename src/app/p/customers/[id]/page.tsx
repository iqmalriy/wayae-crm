import type { Metadata } from "next";
import { CustomerDetailPage } from "@/features/customers";

export const metadata: Metadata = {
  title: "Customer Detail",
};

export default function CustomerDetailRoutePage() {
  return <CustomerDetailPage />;
}