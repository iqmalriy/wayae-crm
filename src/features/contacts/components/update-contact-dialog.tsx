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
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PencilIcon } from "lucide-react";
import { useUpdateContact } from "../queries/update-contact";
import { updateContactInput } from "../schemas/update-contact.schema";
import type { ContactDetailView } from "../types/response-types";

type UpdateContactFormValues = z.input<typeof updateContactInput>;

interface UpdateContactDialogProps {
  contact: ContactDetailView;
}

export function UpdateContactDialog({ contact }: UpdateContactDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateContactFormValues>({
    resolver: zodResolver(updateContactInput),
    values: {
      displayName: contact.displayName,
      description: contact.description ?? "",
      isBusiness: contact.isBusiness,
    },
  });

  const updateContact = useUpdateContact({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contact", contact.id],
      });
      setOpen(false);
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof UpdateContactFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: UpdateContactFormValues) {
    setServerError(null);
    updateContact.mutate({
      id: contact.id,
      displayName: data.displayName || undefined,
      description: data.description || null,
      isBusiness: data.isBusiness ?? undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <PencilIcon />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit contact</DialogTitle>
            <DialogDescription>
              Update the profile for this contact.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="displayName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Display name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Jane Doe"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ""}
                    placeholder="Optional notes"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isBusiness"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Business</FieldLabel>
                  <label
                    htmlFor={field.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      id={field.name}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked)}
                      aria-invalid={fieldState.invalid}
                    />
                    This is a business contact
                  </label>
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
            <Button type="submit" disabled={updateContact.isPending}>
              {updateContact.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}