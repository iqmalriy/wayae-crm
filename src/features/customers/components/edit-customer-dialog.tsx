"use client";

import { useEffect, useState } from "react";
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerOrganizationCombobox } from "@/features/customer-organizations/components/customer-organization-combobox";
import { useUpdateCustomer } from "../queries/update-customer";
import { updateCustomerInput } from "../schemas/update-customer.schema";
import type { CustomerDetailView } from "../types/response-types";

type EditCustomerFormValues = z.input<typeof updateCustomerInput>;

interface EditCustomerDialogProps {
  customer: CustomerDetailView;
}

export function EditCustomerDialog({ customer }: EditCustomerDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditCustomerFormValues>({
    resolver: zodResolver(updateCustomerInput),
    defaultValues: {
      fullName: customer.fullName,
      email: customer.email ?? "",
      organizationId: customer.organizationId ?? "",
      jobTitle: customer.jobTitle ?? "",
      notes: customer.notes ?? "",
      isDecisionMaker: customer.isDecisionMaker,
      isPrimaryContact: customer.isPrimaryContact,
      status: customer.status,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      fullName: customer.fullName,
      email: customer.email ?? "",
      organizationId: customer.organizationId ?? "",
      jobTitle: customer.jobTitle ?? "",
      notes: customer.notes ?? "",
      isDecisionMaker: customer.isDecisionMaker,
      isPrimaryContact: customer.isPrimaryContact,
      status: customer.status,
    });
  }, [open, customer, form]);

  const organizationId = form.watch("organizationId");

  const updateCustomer = useUpdateCustomer({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", customer.id] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof EditCustomerFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: EditCustomerFormValues) {
    setServerError(null);
    updateCustomer.mutate({
      id: customer.id,
      input: {
        fullName: data.fullName,
        email: data.email || null,
        organizationId: data.organizationId || undefined,
        jobTitle: data.jobTitle || undefined,
        notes: data.notes || undefined,
        status: data.status,
        ...(data.organizationId
          ? {
              isDecisionMaker: data.isDecisionMaker,
              isPrimaryContact: data.isPrimaryContact,
            }
          : {}),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Edit</Button>} />
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update this customer&apos;s profile information.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>
                    Full name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Andi Pratama"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    value={field.value ?? ""}
                    placeholder="andi@company.com (optional)"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="organizationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Organization</FieldLabel>
                  <CustomerOrganizationCombobox
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || undefined)}
                    id={field.name}
                    ariaInvalid={fieldState.invalid}
                    placeholder="Select an organization..."
                    showClear
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="jobTitle"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Job title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ""}
                    placeholder="Sales Manager"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {organizationId ? (
              <>
                <Controller
                  name="isDecisionMaker"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={field.name}
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Decision maker
                        </FieldLabel>
                        <FieldDescription>
                          The person who makes purchase decisions for the
                          organization.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  name="isPrimaryContact"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={field.name}
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Primary contact
                        </FieldLabel>
                        <FieldDescription>
                          The main point of contact for this organization.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  )}
                />
              </>
            ) : null}

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ""}
                    placeholder="Additional context about this customer..."
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
            <Button type="submit" disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}