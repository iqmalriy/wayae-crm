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
import { useDetachCustomerFromOrganization } from "../queries/detach-customer-from-org";

interface DetachCustomerFromOrganizationDialogProps {
  customerId: string;
  customerName: string;
}

export function DetachCustomerFromOrganizationDialog({
  customerId,
  customerName,
}: DetachCustomerFromOrganizationDialogProps) {
  const queryClient = useQueryClient();

  const detachCustomer = useDetachCustomerFromOrganization({
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customer", customerId] }),
        queryClient.invalidateQueries({ queryKey: ["customers"] }),
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
          <AlertDialogTitle>Detach from organization?</AlertDialogTitle>
          <AlertDialogDescription>
            This will unlink {customerName} from its organization. The customer
            will no longer be associated with that organization.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={detachCustomer.isPending}
            onClick={() => detachCustomer.mutate(customerId)}
          >
            {detachCustomer.isPending ? "Detaching..." : "Detach customer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}