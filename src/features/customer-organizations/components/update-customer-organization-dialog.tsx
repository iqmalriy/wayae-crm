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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilIcon } from "lucide-react";
import { useUpdateCustomerOrganization } from "../queries/update-customer-organization";
import { updateCustomerOrganizationInput } from "../schemas/update-customer-organization.schema";
import type { CustomerOrganizationDetailView } from "../types/response-types";

type UpdateCustomerOrganizationFormValues = z.input<
  typeof updateCustomerOrganizationInput
>;

interface UpdateCustomerOrganizationDialogProps {
  organization: CustomerOrganizationDetailView;
}

export function UpdateCustomerOrganizationDialog({
  organization,
}: UpdateCustomerOrganizationDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateCustomerOrganizationFormValues>({
    resolver: zodResolver(updateCustomerOrganizationInput),
    values: {
      name: organization.name,
      legalName: organization.legalName ?? "",
      npwp: organization.npwp ?? "",
      industry: organization.industry ?? "",
      address: organization.address ?? "",
      organizationType: organization.organizationType ?? undefined,
    },
  });

  const updateOrganization = useUpdateCustomerOrganization({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customer-organization", organization.id],
      });
      setOpen(false);
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof UpdateCustomerOrganizationFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: UpdateCustomerOrganizationFormValues) {
    setServerError(null);
    const payload: UpdateCustomerOrganizationFormValues = {};
    if (data.name !== organization.name) payload.name = data.name;
    if ((data.legalName ?? null) !== organization.legalName) {
      payload.legalName = data.legalName || null;
    }
    if ((data.npwp ?? null) !== organization.npwp) {
      payload.npwp = data.npwp || null;
    }
    if ((data.industry ?? null) !== organization.industry) {
      payload.industry = data.industry || null;
    }
    if ((data.address ?? null) !== organization.address) {
      payload.address = data.address || null;
    }
    if ((data.organizationType ?? null) !== organization.organizationType) {
      payload.organizationType = data.organizationType ?? null;
    }
    if (Object.keys(payload).length === 0) return;

    updateOrganization.mutate({
      id: organization.id,
      ...payload,
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
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit customer organization</DialogTitle>
            <DialogDescription>
              Update the profile for this organization.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>
                    Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="PT Maju Bersama"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="legalName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Legal name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="PT Maju Bersama Tbk."
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="organizationType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="industry"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Industry</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Manufacturing"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="npwp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tax ID</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="00.000.000.0-000.000"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Jl. Sudirman No. 1, Jakarta"
                    value={field.value ?? ""}
                    aria-invalid={fieldState.invalid}
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
            <Button type="submit" disabled={updateOrganization.isPending}>
              {updateOrganization.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}