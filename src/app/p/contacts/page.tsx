import type { Metadata } from "next";
import { ContactsPage } from "@/features/contacts";

export const metadata: Metadata = {
  title: "Contacts",
};

export default function ContactsRoutePage() {
  return <ContactsPage />;
}