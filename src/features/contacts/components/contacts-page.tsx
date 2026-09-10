"use client";

import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateContactDialog } from "./create-contact-dialog";
import { ContactsTable } from "./contacts-table";
import { useBreadcrumb } from "@/components/breadcrumb-global";

export function ContactsPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Contacts" },
    ]);
  }, [setItems]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            View the people you interact with across your WhatsApp accounts.
          </p>
        </div>
        <CreateContactDialog />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All contacts</CardTitle>
            <CardDescription>
              Search, sort, and paginate through your contacts.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ContactsTable />
        </CardContent>
      </Card>
    </div>
  );
}