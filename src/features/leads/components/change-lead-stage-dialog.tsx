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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightIcon } from "lucide-react";
import { useChangeLeadStage } from "../queries/change-lead-stage";
import {
  changeLeadStageInput,
  leadStages,
} from "../schemas/change-lead-stage.schema";
import type { LeadDetailView } from "../types/response-types";

type ChangeStageFormValues = z.input<typeof changeLeadStageInput>;

interface ChangeLeadStageDialogProps {
  lead: LeadDetailView;
}

export function ChangeLeadStageDialog({ lead }: ChangeLeadStageDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ChangeStageFormValues>({
    resolver: zodResolver(changeLeadStageInput),
    defaultValues: { stage: undefined, note: "" },
  });

  const currentStage = form.watch("stage");
  const noOp = !currentStage || currentStage === lead.stage;

  const changeStage = useChangeLeadStage({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
      await queryClient.invalidateQueries({ queryKey: ["lead-activities", lead.id] });
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof ChangeStageFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: ChangeStageFormValues) {
    if (!data.stage) return;
    setServerError(null);
    changeStage.mutate({
      id: lead.id,
      input: {
        stage: data.stage,
        note: data.note?.trim() || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Change stage</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Change stage</DialogTitle>
            <DialogDescription>
              Move this lead to a new pipeline stage. The change is logged to
              the activity timeline.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium capitalize text-muted-foreground">
                {lead.stage}
              </span>
              <ArrowRightIcon className="size-4 text-muted-foreground" />
              <Controller
                name="stage"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="flex-1">
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue placeholder="Select new stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadStages.map((stage) => (
                          <SelectItem
                            key={stage}
                            value={stage}
                            className="capitalize"
                            disabled={stage === lead.stage}
                          >
                            {stage}
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
            </div>

            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Note (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Reason or context for this change..."
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
            <Button type="submit" disabled={noOp || changeStage.isPending}>
              {changeStage.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}