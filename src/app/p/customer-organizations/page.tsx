import type { Metadata } from "next";
import { CustomerOrganizationsPage } from "@/features/customer-organizations";

export const metadata: Metadata = {
  title: "Customer Organizations",
};

export default function CustomerOrganizationsRoutePage() {
  return <CustomerOrganizationsPage />;
}