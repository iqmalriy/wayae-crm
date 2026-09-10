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
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  ShieldKeyhole,
} from "lucide-react";
import { useRefreshWaAccountToken } from "../queries/refresh-wa-account-token";

const confirmSchema = z.object({
  confirm: z.string().refine((value) => value === "confirm", {
    message: 'Type "confirm" to refresh the token.',
  }),
});

type ConfirmValues = z.infer<typeof confirmSchema>;

export function RefreshWaAccountTokenDialog({
  id,
  phone,
}: {
  id: string;
  phone: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { confirm: "" },
  });

  const confirmValue = form.watch("confirm");
  const canSubmit = confirmValue === "confirm";

  const refreshWaAccountToken = useRefreshWaAccountToken({
    onSuccess: (result) => {
      setToken(result.data.token);
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      setToken(null);
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ["wa-accounts"] });
    }
  }

  function handleSubmit() {
    refreshWaAccountToken.mutate(id);
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
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Refresh token">
            <ShieldKeyhole />
          </Button>
        }
      />
      <DialogContent>
        {token ? (
          <div className="contents">
            <DialogHeader>
              <DialogTitle>Token refreshed</DialogTitle>
              <DialogDescription>
                Copy the new bearer token now. The previous token is immediately
                invalidated and cannot be recovered.
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
              <DialogTitle>Refresh token</DialogTitle>
              <DialogDescription>
                Rotate the bearer token for{" "}
                <span className="font-medium text-foreground">{phone}</span>.
                This invalidates the current token. Type{" "}
                <span className="font-mono font-medium text-foreground">
                  confirm
                </span>{" "}
                to proceed.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Controller
                name="confirm"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`refresh-wa-confirm-${id}`}>
                      Confirmation
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`refresh-wa-confirm-${id}`}
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
                type="submit"
                disabled={!canSubmit || refreshWaAccountToken.isPending}
              >
                {refreshWaAccountToken.isPending
                  ? "Refreshing..."
                  : "Refresh token"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
