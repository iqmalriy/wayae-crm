"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
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
import { useDeleteConversation } from "../queries/delete-conversation";

interface DeleteConversationDialogProps {
  id: string;
  name: string;
  onDeleted: () => void;
}

export function DeleteConversationDialog({
  id,
  name,
  onDeleted,
}: DeleteConversationDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteConversation = useDeleteConversation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.removeQueries({
        queryKey: ["conversation-messages", id],
      });
      setOpen(false);
      onDeleted();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Delete conversation"
          >
            <Trash2Icon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete conversation</DialogTitle>
          <DialogDescription>
            Delete the conversation with{" "}
            <span className="font-medium text-foreground">{name}</span>? This
            hides the conversation and its messages. This action can be undone
            by an administrator.
          </DialogDescription>
        </DialogHeader>

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
            onClick={() => deleteConversation.mutate(id)}
            disabled={deleteConversation.isPending}
          >
            {deleteConversation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}