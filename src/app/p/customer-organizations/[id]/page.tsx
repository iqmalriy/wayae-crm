import type { Metadata } from "next";
import { CustomerOrganizationDetailPage } from "@/features/customer-organizations";

export const metadata: Metadata = {
  title: "Customer Organization Detail",
};

export default function CustomerOrganizationDetailRoutePage() {
  return <CustomerOrganizationDetailPage />;
}