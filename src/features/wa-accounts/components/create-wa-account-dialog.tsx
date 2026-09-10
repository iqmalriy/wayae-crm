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
import { CheckIcon, CopyIcon } from "lucide-react";
import { UserCombobox } from "@/features/users/components/user-combobox";
import { useCreateWaAccount } from "../queries/create-wa-account";
import {
  createWaAccountInput,
  type CreateWaAccountInput,
} from "../schemas/create-wa-account.schema";

export function CreateWaAccountDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateWaAccountInput>({
    resolver: zodResolver(createWaAccountInput),
    defaultValues: {
      userId: "",
      phone: "",
      label: "",
    },
  });

  const createWaAccount = useCreateWaAccount({
    onSuccess: (result) => {
      setToken(result.data.token);
    },
    onError: (error) => {
      const fields = error.fields ?? {};
      for (const [path, message] of Object.entries(fields)) {
        form.setError(path as keyof CreateWaAccountInput, {
          type: "server",
          message,
        });
      }
      setServerError(fields && Object.keys(fields).length > 0 ? null : error.message);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setToken(null);
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["wa-accounts"] });
    }
  }

  function handleSubmit(data: CreateWaAccountInput) {
    setServerError(null);
    createWaAccount.mutate(data);
  }

  function handleDone() {
    setOpen(false);
    setToken(null);
    setCopied(false);
  }

  async function handleCopy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>Add WhatsApp account</Button>} />
      <DialogContent>
        {token ? (
          <div className="contents">
            <DialogHeader>
              <DialogTitle>Account created</DialogTitle>
              <DialogDescription>
                Copy the bearer token now. It is shown only once and cannot be
                recovered.
              </DialogDescription>
            </DialogHeader>
            <div className="relative rounded-md border bg-muted p-3 pr-12 font-mono text-sm break-all">
              {token}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy token"}
              >
                {copied ? (
                  <CheckIcon className="text-emerald-500" />
                ) : (
                  <CopyIcon />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
            <DialogHeader>
              <DialogTitle>Add WhatsApp account</DialogTitle>
              <DialogDescription>
                Provision a WhatsApp account for a member. A bearer token will
                be generated for the extension.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Controller
                name="userId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-wa-user">Owner</FieldLabel>
                    <UserCombobox
                      id="create-wa-user"
                      value={field.value}
                      onValueChange={field.onChange}
                      ariaInvalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-wa-phone">Phone</FieldLabel>
                    <Input
                      {...field}
                      id="create-wa-phone"
                      placeholder="6285183345582"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="label"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-wa-label">Label</FieldLabel>
                    <Input
                      {...field}
                      id="create-wa-label"
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
              <Button type="submit" disabled={createWaAccount.isPending}>
                {createWaAccount.isPending
                  ? "Creating..."
                  : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}