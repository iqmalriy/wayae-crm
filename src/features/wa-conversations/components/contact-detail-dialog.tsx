"use client";

import Link from "next/link";
import { ContactRoundIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/datetime";
import { useContact } from "@/features/contacts/queries/get-contact";

interface ContactDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string | null;
}

export function ContactDetailDialog({
  open,
  onOpenChange,
  contactId,
}: ContactDetailDialogProps) {
  const { data, isPending, isError } = useContact(contactId ?? "", {
    enabled: open && Boolean(contactId),
  });

  const contact = data?.contact ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ContactRoundIcon className="size-4" />
            {isPending ? "Loading..." : (contact?.displayName ?? "Contact")}
          </DialogTitle>
          <DialogDescription>Contact details</DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError || !contact ? (
          <p className="text-muted-foreground">
            Failed to load contact details.
          </p>
        ) : (
          <dl className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{contact.phone}</dd>
            </div>

            {contact.description ? (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Description</dt>
                <dd className="text-right">{contact.description}</dd>
              </div>
            ) : null}

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Business</dt>
              <dd className="font-medium">
                {contact.isBusiness ? "Yes" : "No"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="font-medium capitalize">{contact.source}</dd>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">First seen</dt>
              <dd className="text-sm">
                {formatRelativeTime(contact.firstSeenAt)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Last seen</dt>
              <dd className="text-sm">
                {formatRelativeTime(contact.lastSeenAt)}
              </dd>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Customer</dt>
              {contact.customer ? (
                <dd className="flex items-center gap-2 font-medium">
                  {contact.customer.fullName}
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href={`/p/customers/${contact.customer!.id}`} />
                    }
                  >
                    View
                  </Button>
                </dd>
              ) : (
                <dd className="text-muted-foreground">Not linked</dd>
              )}
            </div>
          </dl>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}