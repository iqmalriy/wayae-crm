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
import { ContactCombobox } from "./contact-combobox";
import { useAddContactToCustomer } from "../queries/add-contact-to-customer";
import { addContactToCustomerInput } from "../schemas/add-contact-to-customer.schema";

type AddContactFormValues = z.input<typeof addContactToCustomerInput>;

interface AddContactToCustomerDialogProps {
  customerId: string;
}

export function AddContactToCustomerDialog({
  customerId,
}: AddContactToCustomerDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AddContactFormValues>({
    resolver: zodResolver(addContactToCustomerInput),
    defaultValues: { contactId: "" },
  });

  const addContact = useAddContactToCustomer({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contacts"],
      });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  function handleSubmit(data: AddContactFormValues) {
    setServerError(null);
    addContact.mutate({
      customerId,
      contactId: data.contactId,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Add contact</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Add contact to customer</DialogTitle>
            <DialogDescription>
              Assign an unassigned contact to this customer.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="contactId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Contact</FieldLabel>
                  <ContactCombobox
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
            <Button type="submit" disabled={addContact.isPending}>
              {addContact.isPending ? "Adding..." : "Add contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}