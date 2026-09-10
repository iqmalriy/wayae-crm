"use client";

import { useQueryClient } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UnlinkIcon } from "lucide-react";
import { useDetachContactFromCustomer } from "../queries/detach-contact-from-customer";

interface DetachContactFromCustomerDialogProps {
  contactId: string;
  contactName: string;
}

export function DetachContactFromCustomerDialog({
  contactId,
  contactName,
}: DetachContactFromCustomerDialogProps) {
  const queryClient = useQueryClient();

  const detachContact = useDetachContactFromCustomer({
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["contact", contactId] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            <UnlinkIcon />
            Detach
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Detach from customer?</AlertDialogTitle>
          <AlertDialogDescription>
            This will unlink {contactName} from its linked customer. The contact
            will no longer be associated with that customer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={detachContact.isPending}
            onClick={() => detachContact.mutate(contactId)}
          >
            {detachContact.isPending ? "Detaching..." : "Detach contact"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}