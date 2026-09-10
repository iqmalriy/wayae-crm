"use client";

import { useRouter } from "next/navigation";
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
import { Trash2Icon } from "lucide-react";
import { useDeleteCustomerOrganization } from "../queries/delete-customer-organization";

interface DeleteCustomerOrganizationDialogProps {
  organizationId: string;
}

export function DeleteCustomerOrganizationDialog({
  organizationId,
}: DeleteCustomerOrganizationDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteOrganization = useDeleteCustomerOrganization({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customer-organizations"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      router.push("/p/customer-organizations");
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2Icon />
            Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the organization and detach all its customers. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteOrganization.isPending}
            onClick={() => deleteOrganization.mutate(organizationId)}
          >
            {deleteOrganization.isPending ? "Deleting..." : "Delete organization"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}