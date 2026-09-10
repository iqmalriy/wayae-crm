"use client";

import { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadsTable } from "./leads-table";
import { CreateLeadDialog } from "./create-lead-dialog";
import { useBreadcrumb } from "@/components/breadcrumb-global";

export function LeadsPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Leads" },
    ]);
  }, [setItems]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Track, qualify, and manage your sales pipeline.
          </p>
        </div>
        <CreateLeadDialog />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>All leads</CardTitle>
            <CardDescription>
              Search, filter, sort, and paginate through your leads.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LeadsTable />
        </CardContent>
      </Card>
    </div>
  );
}