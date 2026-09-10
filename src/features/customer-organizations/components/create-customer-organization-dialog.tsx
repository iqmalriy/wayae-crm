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
import { useCreateCustomerOrganization } from "../queries/create-customer-organization";
import { createCustomerOrganizationInput } from "../schemas/create-customer-organization.schema";

type CreateCustomerOrganizationFormValues = z.input<
  typeof createCustomerOrganizationInput
>;

export function CreateCustomerOrganizationDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateCustomerOrganizationFormValues>({
    resolver: zodResolver(createCustomerOrganizationInput),
    defaultValues: {
      name: "",
      legalName: "",
      npwp: "",
      industry: "",
      address: "",
      organizationType: undefined,
    },
  });

  const createOrganization = useCreateCustomerOrganization({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customer-organizations"],
      });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof CreateCustomerOrganizationFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: CreateCustomerOrganizationFormValues) {
    setServerError(null);
    createOrganization.mutate({
      name: data.name,
      legalName: data.legalName || undefined,
      npwp: data.npwp || undefined,
      industry: data.industry || undefined,
      address: data.address || undefined,
      organizationType: data.organizationType,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add organization</Button>} />
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Create customer organization</DialogTitle>
            <DialogDescription>
              Add a company or individual you work with.
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
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending
                ? "Creating..."
                : "Create organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}