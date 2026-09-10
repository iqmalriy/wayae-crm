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
import {
  ArrowLeftIcon,
  CrownIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";
import { useCustomer } from "../queries/get-customer";
import { EditCustomerDialog } from "./edit-customer-dialog";
import { DeleteCustomerDialog } from "./delete-customer-dialog";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { AddContactToCustomerDialog } from "@/features/contacts/components/add-contact-to-customer-dialog";
import { DetachCustomerFromOrganizationDialog } from "./detach-customer-from-organization-dialog";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/datetime";

const statusVariants: Record<string, "secondary" | "default" | "destructive"> = {
  active: "default",
  inactive: "secondary",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Customers", href: "/p/customers" },
      { label: "Detail" },
    ]);
  }, [setItems]);

  const { data, isPending } = useCustomer(id);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const customer = data?.customer;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/p/customers" />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UserIcon className="size-6 text-muted-foreground" />
            {customer?.fullName}
            {customer?.isDecisionMaker && (
              <CrownIcon className="size-5 text-amber-500" />
            )}
            {customer?.isPrimaryContact && (
              <StarIcon className="size-5 text-amber-500" />
            )}
          </h1>
          {customer?.jobTitle ? (
            <p className="text-sm text-muted-foreground">{customer.jobTitle}</p>
          ) : null}
        </div>
        {customer ? (
          <Badge
            variant={statusVariants[customer.status]}
            className={cn(
              "ml-2",
              customer.status === "active" && "bg-emerald-500",
            )}
          >
            <span className="capitalize">{customer.status}</span>
          </Badge>
        ) : null}
        {customer?.canUpdate || customer?.canDelete ? (
          <div className="ml-auto flex items-center gap-2">
            {customer.canUpdate ? (
              <EditCustomerDialog customer={customer} />
            ) : null}
            {customer.canDelete ? (
              <DeleteCustomerDialog customerId={customer.id} />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer details</CardTitle>
            <CardDescription>
              Profile and account information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow label="Email" value={customer?.email} />
              <InfoRow
                label="Organization"
                value={
                  customer?.organizationName ? (
                    <span className="flex items-center gap-2">
                      <Link
                        href={`/p/customer-organizations/${customer.organizationId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {customer.organizationName}
                      </Link>
                      {customer.canUpdate ? (
                        <DetachCustomerFromOrganizationDialog
                          customerId={customer.id}
                          customerName={customer.fullName}
                        />
                      ) : null}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Decision maker"
                value={
                  customer?.isDecisionMaker ? (
                    <span className="flex items-center gap-1.5">
                      <CrownIcon className="size-4 text-amber-500" /> Yes
                    </span>
                  ) : (
                    "No"
                  )
                }
              />
              <InfoRow
                label="Primary contact"
                value={
                  customer?.isPrimaryContact ? (
                    <span className="flex items-center gap-1.5">
                      <StarIcon className="size-4 text-amber-500" /> Yes
                    </span>
                  ) : (
                    "No"
                  )
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-5">
              <InfoRow
                label="Created"
                value={formatRelativeTime(customer?.createdAt)}
              />
              <InfoRow
                label="Last updated"
                value={formatRelativeTime(customer?.updatedAt)}
              />
              <InfoRow label="Created by" value={customer?.createdByName} />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {customer?.notes ?? (
              <span className="text-muted-foreground">No notes.</span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>
                Contacts linked to this customer.
              </CardDescription>
            </div>
            {customer ? (
              <AddContactToCustomerDialog customerId={customer.id} />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <ContactsTable customerId={customer?.id} showDetach />
        </CardContent>
      </Card>
    </div>
  );
}