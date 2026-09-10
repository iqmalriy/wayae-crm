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
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { useCreateLeadActivity } from "../queries/create-lead-activity";
import { createLeadActivityInput } from "../schemas/create-lead-activity.schema";

type CreateActivityFormValues = z.input<typeof createLeadActivityInput>;

interface CreateLeadActivityDialogProps {
  leadId: string;
}

export function CreateLeadActivityDialog({
  leadId,
}: CreateLeadActivityDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateActivityFormValues>({
    resolver: zodResolver(createLeadActivityInput),
    defaultValues: { body: "" },
  });

  const createActivity = useCreateLeadActivity({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["lead-activities", leadId],
      });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof CreateActivityFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: CreateActivityFormValues) {
    setServerError(null);
    createActivity.mutate({ leadId, input: { body: data.body.trim() } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Add activity
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Add activity</DialogTitle>
            <DialogDescription>
              Log a follow-up such as a call, email, meeting, or a note about
              this lead.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="body"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Activity</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="e.g. Called Budi, discussed pricing and delivery..."
                    aria-invalid={fieldState.invalid}
                    maxLength={2000}
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
            <Button type="submit" disabled={createActivity.isPending}>
              {createActivity.isPending ? "Adding..." : "Add activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}