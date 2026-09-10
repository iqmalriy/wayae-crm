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
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCombobox } from "@/features/users/components/user-combobox";
import { LeadCombobox } from "@/features/leads/components/lead-combobox";
import { authClient } from "@/lib/auth-client";
import { useCreateTask } from "../queries/create-task";
import { createTaskInput, taskPriorities } from "../schemas/create-task.schema";

const createTaskFormSchema = createTaskInput
  .omit({ leadId: true, dueAt: true })
  .extend({ dueAt: z.string().optional() });
type CreateTaskFormValues = z.input<typeof createTaskFormSchema>;

interface CreateTaskDialogProps {
  leadId?: string;
}

export function CreateTaskDialog({ leadId }: CreateTaskDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === "admin";

  const resolvedLeadId = leadId ?? selectedLeadId;

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assigneeId: "",
      dueAt: "",
    },
  });

  const createTask = useCreateTask({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      await queryClient.invalidateQueries({
        queryKey: ["lead-activities", resolvedLeadId],
      });
      setOpen(false);
      form.reset();
      setServerError(null);
      setSelectedLeadId("");
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof CreateTaskFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: CreateTaskFormValues) {
    if (!resolvedLeadId) return;
    setServerError(null);
    createTask.mutate({
      leadId: resolvedLeadId,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      priority: data.priority ?? "medium",
      assigneeId: data.assigneeId || undefined,
      dueAt: data.dueAt
        ? new Date(`${data.dueAt}T00:00:00`).toISOString()
        : undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add task</Button>} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>
              Add a follow-up task. The creation is logged to the lead&apos;s
              activity timeline.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
            {!leadId ? (
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="create-task-lead">
                  Lead <span className="text-destructive">*</span>
                </FieldLabel>
                <LeadCombobox
                  value={selectedLeadId}
                  onValueChange={setSelectedLeadId}
                  id="create-task-lead"
                  placeholder="Search and select a lead..."
                />
              </Field>
            ) : null}

            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>
                    Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Follow up proposal v2"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                  <Select
                    value={field.value ?? "medium"}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full capitalize">
                      <SelectValue placeholder="Select a priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskPriorities.map((priority) => (
                        <SelectItem
                          key={priority}
                          value={priority}
                          className="capitalize"
                        >
                          {priority}
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

            <Controller
              name="dueAt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                  <DatePicker
                    variant="input"
                    value={
                      field.value ? new Date(`${field.value}T00:00:00`) : null
                    }
                    onChange={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    placeholder="Pick a due date"
                    aria-invalid={fieldState.invalid}
                  />
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
                  <Field
                    data-invalid={fieldState.invalid}
                    className="sm:col-span-2"
                  >
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

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="sm:col-span-2"
                >
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="What needs to be done..."
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
            <Button
              type="submit"
              disabled={!resolvedLeadId || createTask.isPending}
            >
              {createTask.isPending ? "Creating..." : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
