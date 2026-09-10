"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCombobox } from "@/features/users/components/user-combobox";
import { authClient } from "@/lib/auth-client";
import { useUpdateTask } from "../queries/update-task";
import { taskPriorities } from "../schemas/create-task.schema";
import type { TaskDetailView } from "../types/response-types";

const editTaskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().optional(),
  priority: z.enum(taskPriorities),
  assigneeId: z.string().optional(),
  dueAt: z.string().optional(),
});
type EditTaskFormValues = z.input<typeof editTaskFormSchema>;

interface EditTaskDialogProps {
  task: TaskDetailView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === "admin";

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assigneeId: "",
      dueAt: "",
    },
  });

  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        assigneeId: task.assignee?.id ?? "",
        dueAt: task.dueAt ? format(new Date(task.dueAt), "yyyy-MM-dd") : "",
      });
    }
  }, [open, task, form]);

  const updateTask = useUpdateTask({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      await queryClient.invalidateQueries({
        queryKey: ["task-detail", task?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["lead-activities", task?.lead?.id],
      });
      onOpenChange(false);
      setServerError(null);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof EditTaskFormValues, {
          type: "server",
          message,
        });
      }
      setServerError(
        fields && Object.keys(fields).length > 0 ? null : error.message,
      );
    },
  });

  function handleSubmit(data: EditTaskFormValues) {
    if (!task) return;
    setServerError(null);
    updateTask.mutate({
      id: task.id,
      input: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        priority: data.priority,
        assigneeId: isAdmin
          ? data.assigneeId || null
          : (task.assignee?.id ?? undefined),
        dueAt: data.dueAt
          ? new Date(`${data.dueAt}T00:00:00`).toISOString()
          : null,
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setServerError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update task details. Changes are logged to the lead&apos;s
              activity timeline.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="sm:grid sm:grid-cols-2">
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
                      onValueChange={(v) => field.onChange(v || "")}
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
