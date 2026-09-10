"use client";

import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { CustomersTable } from "./customers-table";
import { useBreadcrumb } from "@/components/breadcrumb-global";

export function CustomersPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Customers" },
    ]);
  }, [setItems]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View the people and contacts you manage across your CRM.
          </p>
        </div>
        <CreateCustomerDialog />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All customers</CardTitle>
            <CardDescription>
              Search, filter, sort, and paginate through your customers.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <CustomersTable />
        </CardContent>
      </Card>
    </div>
  );
}