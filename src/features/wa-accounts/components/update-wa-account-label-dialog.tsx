"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { PencilIcon } from "lucide-react";
import { useUpdateWaAccountLabel } from "../queries/update-wa-account-label";
import {
  updateWaAccountLabelInput,
  type UpdateWaAccountLabelInput,
} from "../schemas/update-wa-account.schema";

export function UpdateWaAccountLabelDialog({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateWaAccountLabelInput>({
    resolver: zodResolver(updateWaAccountLabelInput),
    defaultValues: { label },
  });

  const updateWaAccountLabel = useUpdateWaAccountLabel({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-accounts"] });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof UpdateWaAccountLabelInput, {
          type: "server",
          message,
        });
      }
      setServerError(fields && Object.keys(fields).length > 0 ? null : error.message);
    },
  });

  function handleSubmit(data: UpdateWaAccountLabelInput) {
    setServerError(null);
    updateWaAccountLabel.mutate({ id, input: data });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Edit label">
            <PencilIcon />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit WhatsApp account</DialogTitle>
            <DialogDescription>
              Update the label for this WhatsApp account.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="label"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`edit-wa-label-${id}`}>Label</FieldLabel>
                  <Input
                    {...field}
                    id={`edit-wa-label-${id}`}
                    placeholder="Sales Maira"
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
            <Button type="submit" disabled={updateWaAccountLabel.isPending}>
              {updateWaAccountLabel.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}