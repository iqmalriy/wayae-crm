"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { ContactCombobox } from "@/features/contacts/components/contact-combobox";
import { CustomerCombobox } from "@/features/customers/components/customer-combobox";
import { CustomerOrganizationCombobox } from "@/features/customer-organizations/components/customer-organization-combobox";
import { UserCombobox } from "@/features/users/components/user-combobox";
import { authClient } from "@/lib/auth-client";
import { useCreateLead } from "../queries/create-lead";
import { createLeadInput, leadSources } from "../schemas/create-lead.schema";

type CreateLeadFormValues = z.input<typeof createLeadInput>;

const createLeadFormSchema = createLeadInput.superRefine((data, ctx) => {
  if (!data.contactId && !data.phone?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Phone is required when no contact is linked.",
    });
  }
  if (!data.customerId && !data.contactId && !data.name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["name"],
      message: "Name is required when no customer or contact is linked.",
    });
  }
});

export function CreateLeadDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: sessionData } = authClient.useSession();
  const currentUser = sessionData?.user;
  const isAdmin = currentUser?.role === "admin";

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadFormSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
      email: "",
      source: "manual",
      estimatedValue: undefined,
      notes: "",
      contactId: "",
      customerId: "",
      customerOrganizationId: "",
      assigneeId: "",
    },
  });

  const contactId = useWatch({ control: form.control, name: "contactId" });
  const customerId = useWatch({ control: form.control, name: "customerId" });
  const organizationId = useWatch({
    control: form.control,
    name: "customerOrganizationId",
  });

  const nameOwned = Boolean(contactId || customerId);
  const companyOwned = Boolean(organizationId);
  const phoneOwned = Boolean(contactId);
  const emailOwned = Boolean(customerId);

  useEffect(() => {
    if (nameOwned) form.setValue("name", "", { shouldDirty: true });
    if (phoneOwned) form.setValue("phone", "", { shouldDirty: true });
    if (emailOwned) form.setValue("email", "", { shouldDirty: true });
    if (companyOwned) form.setValue("company", "", { shouldDirty: true });
  }, [nameOwned, phoneOwned, emailOwned, companyOwned, form]);

  useEffect(() => {
    if (!isAdmin && currentUser?.id) {
      form.setValue("assigneeId", currentUser.id);
    }
  }, [isAdmin, currentUser?.id, form]);

  const createLead = useCreateLead({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof CreateLeadFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function onFormInvalid() {
    // Debug hook: inspect `form.formState.errors` here if validation fails silently.
  }

  function handleSubmit(data: CreateLeadFormValues) {
    setServerError(null);
    createLead.mutate({
      name: data.name || undefined,
      company: data.company || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      source: data.source ?? "manual",
      estimatedValue:
        data.estimatedValue === undefined || data.estimatedValue === ""
          ? undefined
          : Number(data.estimatedValue),
      notes: data.notes || undefined,
      contactId: data.contactId || undefined,
      customerId: data.customerId || undefined,
      customerOrganizationId: data.customerOrganizationId || undefined,
      assigneeId:
        !isAdmin && currentUser?.id ? currentUser.id : data.assigneeId || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>New lead</Button>} />
      <DialogContent className="sm:max-w-2xl">
        <form
          onSubmit={form.handleSubmit(handleSubmit, onFormInvalid)}
          className="contents"
        >
          <DialogHeader>
            <DialogTitle>Create lead</DialogTitle>
            <DialogDescription>
              Capture a new prospect. You will be set as the owner.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>
                    Customer (optional)
                  </FieldLabel>
                  <CustomerCombobox
                    value={field.value ?? ""}
                    onValueChange={(v) => {
                      const next = v || undefined;
                      if (next !== (field.value || undefined)) {
                        form.setValue("contactId", "", { shouldDirty: true });
                      }
                      field.onChange(next);
                    }}
                    id={field.name}
                    ariaInvalid={fieldState.invalid}
                    showClear
                    placeholder="Link an existing customer..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="contactId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>
                    Contact (optional)
                  </FieldLabel>
                  <ContactCombobox
                    value={field.value ?? ""}
                    customerId={customerId || undefined}
                    onValueChange={(v) => {
                      field.onChange(v || undefined);
                    }}
                    id={field.name}
                    ariaInvalid={fieldState.invalid}
                    showClear
                    placeholder="Link an existing WhatsApp contact..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="customerOrganizationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization (optional)
                  </FieldLabel>
                  <CustomerOrganizationCombobox
                    value={field.value ?? ""}
                    onValueChange={(v) => {
                      field.onChange(v || undefined);
                    }}
                    id={field.name}
                    ariaInvalid={fieldState.invalid}
                    showClear
                    placeholder="Link an organization..."
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Creating..." : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
