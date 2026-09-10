"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { EyeIcon, PhoneIcon } from "lucide-react";
import { useRevealContactPhone } from "../queries/reveal-contact-phone";
import { revealContactPhoneInput } from "../schemas/reveal-contact-phone.schema";

type RevealFormValues = z.input<typeof revealContactPhoneInput>;

interface RevealContactPhoneDialogProps {
  contactId: string;
  phone: string;
  onRevealed: (phone: string) => void;
}

export function RevealContactPhoneDialog({
  contactId,
  phone,
  onRevealed,
}: RevealContactPhoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RevealFormValues>({
    resolver: zodResolver(revealContactPhoneInput),
    defaultValues: { reason: "" },
  });

  const reveal = useRevealContactPhone({
    onSuccess: (result) => {
      onRevealed(result.phone);
      setOpen(false);
      form.reset();
      setServerError(null);
    },
    onError: (error) => {
      setServerError(error.message);
    },
  });

  function handleSubmit(data: RevealFormValues) {
    setServerError(null);
    reveal.mutate({
      contactId,
      reason: data.reason,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon-sm">
            <EyeIcon />
            <span className="sr-only">Reveal phone</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="contents">
          <DialogHeader>
            <DialogTitle>Reveal phone number</DialogTitle>
            <DialogDescription>
              Viewing the full phone number is logged for audit purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/40 py-4 font-medium">
            <PhoneIcon className="size-4 text-muted-foreground" />
            {phone}
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Input
                id="reason"
                placeholder="Why are you revealing this number?"
                {...form.register("reason")}
              />
              {form.formState.errors.reason ? (
                <FieldError errors={[form.formState.errors.reason]} />
              ) : null}
            </Field>

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
            <Button type="submit" disabled={reveal.isPending}>
              {reveal.isPending ? "Revealing..." : "Reveal phone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}