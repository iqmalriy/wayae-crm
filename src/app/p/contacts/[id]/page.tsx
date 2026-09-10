import type { Metadata } from "next";
import { ContactDetailPage } from "@/features/contacts";

export const metadata: Metadata = {
  title: "Contact Detail",
};

export default function ContactDetailRoutePage() {
  return <ContactDetailPage />;
}