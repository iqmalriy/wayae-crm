"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CustomerCombobox } from "@/features/customers/components/customer-combobox";
import { useAddCustomerToOrganization } from "../queries/add-customer-to-organization";
import { addCustomerToOrganizationInput } from "../schemas/add-customer-to-organization.schema";

type AddCustomerFormValues = z.input<typeof addCustomerToOrganizationInput>;

interface AddCustomerToOrganizationDialogProps {
  organizationId: string;
}

export function AddCustomerToOrganizationDialog({
  organizationId,
}: AddCustomerToOrganizationDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AddCustomerFormValues>({
    resolver: zodResolver(addCustomerToOrganizationInput),
    defaultValues: { customerId: "" },
  });

  const addCustomer = useAddCustomerToOrganization({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  function handleSubmit(data: AddCustomerFormValues) {
    setServerError(null);
    addCustomer.mutate({
      organizationId,
      customerId: data.customerId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Add customer</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Add customer to organization</DialogTitle>
            <DialogDescription>
              Assign an unassigned customer to this organization.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Customer</FieldLabel>
                  <CustomerCombobox
                    value={field.value}
                    onValueChange={(v) => field.onChange(v || undefined)}
                    id={field.name}
                    ariaInvalid={fieldState.invalid}
                    unassigned
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {serverError ? <FieldError>{serverError}</FieldError> : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addCustomer.isPending}>
              {addCustomer.isPending ? "Adding..." : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}