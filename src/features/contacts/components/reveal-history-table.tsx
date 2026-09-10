"use client";

import { useContactPhoneReveals } from "../queries/get-contact-phone-reveals";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/datetime";
import { EyeIcon } from "lucide-react";

interface RevealHistoryTableProps {
  contactId: string;
}

export function RevealHistoryTable({ contactId }: RevealHistoryTableProps) {
  const { data, isPending } = useContactPhoneReveals(contactId);

  if (isPending) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading reveal history...
      </p>
    );
  }

  const reveals = data?.reveals ?? [];

  if (reveals.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No phone reveals yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Revealed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reveals.map((reveal) => (
          <TableRow key={reveal.id}>
            <TableCell className="font-medium">
              {reveal.userName ?? "—"}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">
                <span className="capitalize">{reveal.role ?? "—"}</span>
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {reveal.reason ?? <EyeIcon className="size-4" />}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatRelativeTime(reveal.revealedAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}