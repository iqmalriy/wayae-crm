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
import { UserCombobox } from "@/features/users/components/user-combobox";
import { authClient } from "@/lib/auth-client";
import { useUpdateLead } from "../queries/update-lead";
import { updateLeadInput, leadSources } from "../schemas/update-lead.schema";
import type { LeadDetailView } from "../types/response-types";

type EditLeadFormValues = z.input<typeof updateLeadInput>;

interface EditLeadDialogProps {
  lead: LeadDetailView;
}

export function EditLeadDialog({ lead }: EditLeadDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === "admin";

  const nameOwned = Boolean(lead.customerId || lead.contactId);
  const companyOwned = Boolean(lead.customerOrganizationId);
  const phoneOwned = Boolean(lead.contactId);
  const emailOwned = Boolean(lead.customerId);

  const form = useForm<EditLeadFormValues>({
    resolver: zodResolver(updateLeadInput),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      source: lead.source,
      assigneeId: "",
      estimatedValue: undefined,
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: nameOwned ? "" : (lead.costumer.name ?? ""),
      company: companyOwned ? "" : (lead.organization.name ?? ""),
      phone: phoneOwned ? "" : (lead.contacts.phone ?? ""),
      email: emailOwned ? "" : (lead.email.email ?? ""),
      source: lead.source,
      assigneeId: lead.assigneeId ?? "",
      estimatedValue:
        lead.estimatedValue != null ? String(lead.estimatedValue) : "",
      notes: lead.notes ?? "",
    });
  }, [open, lead, form, nameOwned, companyOwned, phoneOwned, emailOwned]);

  const updateLead = useUpdateLead({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof EditLeadFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function textOrNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  function handleSubmit(data: EditLeadFormValues) {
    setServerError(null);
    updateLead.mutate({
      id: lead.id,
      input: {
        name: textOrNull(data.name),
        company: textOrNull(data.company),
        phone: textOrNull(data.phone),
        email: textOrNull(data.email),
        source: data.source ?? lead.source,
        assigneeId: data.assigneeId || undefined,
        estimatedValue:
          data.estimatedValue === "" || data.estimatedValue == null
            ? null
            : Number(data.estimatedValue),
        notes: textOrNull(data.notes),
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Edit</Button>} />
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit lead</DialogTitle>
            <DialogDescription>
              Update this lead&apos;s contact and pipeline information.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Controller
              name="source"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Source</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || undefined)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a source" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem
                          key={source}
                          value={source}
                          className="capitalize"
                        >
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {isAdmin ? (
              <Controller
                name="assigneeId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Assignee</FieldLabel>
                    <UserCombobox
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v || undefined)}
                      id={field.name}
                      ariaInvalid={fieldState.invalid}
                      placeholder="Assign a member..."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : null}

            {!nameOwned ? (
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="Budi Santoso"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : null}

            {!companyOwned ? (
              <Controller
                name="company"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="PT Maju Bersama"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : null}

            {!phoneOwned ? (
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ""}
                      placeholder="6281234567890"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : null}

            {!emailOwned ? (
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
                      placeholder="budi@company.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : null}

            <Controller
              name="estimatedValue"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Estimated value</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    inputMode="numeric"
                    placeholder="150000000"
                    value={(field.value as string | undefined) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                    placeholder="Context about this lead..."
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
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}