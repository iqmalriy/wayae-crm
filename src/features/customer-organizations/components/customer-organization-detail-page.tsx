"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, Building2Icon, UsersIcon } from "lucide-react";
import { useCustomerOrganization } from "../queries/get-customer-organization";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { AddCustomerToOrganizationDialog } from "./add-customer-to-organization-dialog";
import { UpdateCustomerOrganizationDialog } from "./update-customer-organization-dialog";
import { DeleteCustomerOrganizationDialog } from "./delete-customer-organization-dialog";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/datetime";

const statusVariants: Record<
  string,
  "secondary" | "default" | "destructive"
> = {
  prospect: "secondary",
  active: "default",
  churned: "destructive",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function CustomerOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Customer Organizations", href: "/p/customer-organizations" },
      { label: "Detail" },
    ]);
  }, [setItems]);

  const { data, isPending } = useCustomerOrganization(id);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const org = data?.customerOrganization;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href="/p/customer-organizations" />}>
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Building2Icon className="size-6 text-muted-foreground" />
            {org?.name}
          </h1>
          {org?.legalName ? (
            <p className="text-sm text-muted-foreground">{org.legalName}</p>
          ) : null}
        </div>
        {org ? (
          <Badge
            variant={statusVariants[org.status]}
            className={cn("ml-2", org.status === "active" && "bg-emerald-500")}
          >
            <span className="capitalize">{org.status}</span>
          </Badge>
        ) : null}
        {org && (org.canUpdate || org.canDelete) ? (
          <div className="ml-auto flex items-center gap-2">
            {org.canUpdate ? (
              <UpdateCustomerOrganizationDialog organization={org} />
            ) : null}
            {org.canDelete ? (
              <DeleteCustomerOrganizationDialog organizationId={org.id} />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
            <CardDescription>
              Profile and account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow label="Name" value={org?.name} />
              <InfoRow label="Legal name" value={org?.legalName} />
              <InfoRow
                label="Type"
                value={
                  org?.organizationType ? (
                    <span className="capitalize">{org.organizationType}</span>
                  ) : null
                }
              />
              <InfoRow label="Tax ID" value={org?.npwp} />
              <InfoRow label="Industry" value={org?.industry} />
              <InfoRow label="Account owner" value={org?.accountOwner?.name} />
              <div className="sm:col-span-2">
                <InfoRow label="Address" value={org?.address} />
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-5">
              <InfoRow label="Created" value={formatRelativeTime(org?.createdAt)} />
              <InfoRow label="Last updated" value={formatRelativeTime(org?.updatedAt)} />
              <InfoRow label="Prospect since" value={formatRelativeTime(org?.prospectAt)} />
              <InfoRow label="Churned at" value={formatRelativeTime(org?.churnedAt)} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-4" />
                Customers
              </CardTitle>
              <CardDescription>
                Customers associated with this organization.
              </CardDescription>
            </div>
            {org ? (
              <AddCustomerToOrganizationDialog organizationId={org.id} />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <CustomersTable organizationId={org?.id} showDetach />
        </CardContent>
      </Card>
    </div>
  );
}