"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  Building2Icon,
  CrownIcon,
  EyeIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";
import { useContact } from "../queries/get-contact";
import { RevealContactPhoneDialog } from "./reveal-contact-phone-dialog";
import { RevealHistoryTable } from "./reveal-history-table";
import { DetachContactFromCustomerDialog } from "./detach-contact-from-customer-dialog";
import { UpdateContactDialog } from "./update-contact-dialog";
import { DeleteContactDialog } from "./delete-contact-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { formatRelativeTime } from "@/lib/datetime";

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

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Contacts", href: "/p/contacts" },
      { label: "Detail" },
    ]);
  }, [setItems]);

  const { data, isPending } = useContact(id);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const contact = data?.contact;
  const customer = contact?.customer ?? null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/p/contacts" />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UserIcon className="size-6 text-muted-foreground" />
            {contact?.displayName}
          </h1>
          {contact?.source ? (
            <p className="text-sm text-muted-foreground">
              <span className="capitalize">{contact.source}</span> contact
            </p>
          ) : null}
        </div>
        {contact ? (
          <Badge variant="secondary" className="ml-2">
            {contact.isBusiness ? "Business" : "Personal"}
          </Badge>
        ) : null}
        {contact && (contact.allowedUpdate || contact.isAdmin) ? (
          <div className="ml-auto flex items-center gap-2">
            {contact.allowedUpdate ? (
              <UpdateContactDialog contact={contact} />
            ) : null}
            {contact.isAdmin ? (
              <DeleteContactDialog contactId={contact.id} />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
            <CardDescription>Profile and account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow
                label="Phone"
                value={
                  <span className="flex items-center gap-1.5 font-medium">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    {revealedPhone ?? contact?.phone}
                    {contact &&
                      !contact.allowedRevealPhone &&
                      !revealedPhone && (
                        <RevealContactPhoneDialog
                          contactId={contact.id}
                          phone={contact.phone}
                          onRevealed={setRevealedPhone}
                        />
                      )}
                  </span>
                }
              />

              <InfoRow label="Display name" value={contact?.displayName} />
              <InfoRow
                label="Type"
                value={
                  contact ? (
                    <span className="capitalize">{contact.source}</span>
                  ) : null
                }
              />
              <InfoRow
                label="Business"
                value={contact ? (contact.isBusiness ? "Yes" : "No") : null}
              />
              <InfoRow
                label="WA ID type"
                value={
                  contact?.waIdType ? (
                    <span className="capitalize">{contact.waIdType}</span>
                  ) : null
                }
              />
              <div className="sm:col-span-2">
                <InfoRow label="Description" value={contact?.description} />
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
              <InfoRow
                label="First seen"
                value={formatRelativeTime(contact?.firstSeenAt)}
              />
              <InfoRow
                label="Last seen"
                value={formatRelativeTime(contact?.lastSeenAt)}
              />
              <InfoRow
                label="Created"
                value={formatRelativeTime(contact?.createdAt)}
              />
              <InfoRow label="Added by" value={contact?.addedByName} />
            </dl>
          </CardContent>
        </Card>
      </div>

      {contact ? (
        <Tabs defaultValue="customer">
          <TabsList>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            {contact.isAdmin ? (
              <TabsTrigger value="reveals">Reveal history</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="customer" className="pt-4">
            {customer ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Building2Icon className="size-4" />
                      Linked customer
                    </CardTitle>
                    {contact.allowedUpdate || contact.isAdmin ? (
                      <DetachContactFromCustomerDialog
                        contactId={contact.id}
                        contactName={contact.displayName}
                      />
                    ) : null}
                  </div>
                  <CardDescription>
                    Customer this contact is associated with.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <InfoRow
                      label="Customer"
                      value={
                        <Link
                          href={`/p/customers/${customer.id}`}
                          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                        >
                          {customer.fullName}
                          {customer.isDecisionMaker && (
                            <CrownIcon className="size-4 text-amber-500" />
                          )}
                        </Link>
                      }
                    />
                    <InfoRow label="Email" value={customer.email} />
                    <InfoRow label="Job title" value={customer.jobTitle} />
                    <InfoRow
                      label="Status"
                      value={
                        customer.status ? (
                          <span className="capitalize">{customer.status}</span>
                        ) : null
                      }
                    />
                    <InfoRow
                      label="Organization"
                      value={
                        customer.organizationId ? (
                          <Link
                            href={`/p/customer-organizations/${customer.organizationId}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {customer.organizationName}
                          </Link>
                        ) : (
                          "—"
                        )
                      }
                    />
                  </dl>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    This contact is not linked to a customer.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {contact.isAdmin ? (
            <TabsContent value="reveals" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <EyeIcon className="size-4" />
                    Reveal history
                  </CardTitle>
                  <CardDescription>
                    Phone number reveal events for this contact.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevealHistoryTable contactId={contact.id} />
                </CardContent>
              </Card>
            </TabsContent>
          ) : null}
        </Tabs>
      ) : null}
    </div>
  );
}
