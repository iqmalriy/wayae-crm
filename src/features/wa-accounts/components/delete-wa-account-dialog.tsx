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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Trash2Icon } from "lucide-react";
import { useDeleteWaAccount } from "../queries/delete-wa-account";

const confirmSchema = z.object({
  confirm: z
    .string()
    .refine((value) => value === "confirm", {
      message: 'Type "confirm" to delete this account.',
    }),
});

type ConfirmValues = z.infer<typeof confirmSchema>;

export function DeleteWaAccountDialog({
  id,
  label,
  phone,
}: {
  id: string;
  label: string;
  phone: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { confirm: "" },
  });

  const confirmValue = form.watch("confirm");
  const canSubmit = confirmValue === "confirm";

  const deleteWaAccount = useDeleteWaAccount({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-accounts"] });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Delete account">
            <Trash2Icon />
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={form.handleSubmit(() => deleteWaAccount.mutate(id))} className="contents">
          <DialogHeader>
            <DialogTitle>Delete WhatsApp account</DialogTitle>
            <DialogDescription>
              Delete the account for{" "}
              <span className="font-medium text-foreground">
                {label || phone}
              </span>
              ? This permanently removes its configuration and invalidates its
              token. Type{" "}
              <span className="font-mono font-medium text-foreground">confirm</span>{" "}
              to proceed.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="confirm"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`delete-wa-confirm-${id}`}>
                    Confirmation
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`delete-wa-confirm-${id}`}
                    placeholder="type 'confirm'"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
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
              variant="destructive"
              type="submit"
              disabled={!canSubmit || deleteWaAccount.isPending}
            >
              {deleteWaAccount.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}