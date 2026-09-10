"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  MailIcon,
  PhoneIcon,
  TargetIcon,
  UserIcon,
  UserRoundIcon,
  XCircleIcon,
} from "lucide-react";
import { useGetLead } from "../queries/get-lead";
import { EditLeadDialog } from "./edit-lead-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";
import { ChangeLeadStageDialog } from "./change-lead-stage-dialog";
import { LeadActivities } from "./lead-activities";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { TaskTable } from "@/features/tasks/components/task-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { LeadDetailView } from "../types/response-types";
import { useBreadcrumb } from "@/components/breadcrumb-global";
import { formatRelativeTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const stageVariants: Record<
  LeadDetailView["stage"],
  "secondary" | "default" | "destructive" | "outline"
> = {
  new: "secondary",
  contacted: "default",
  qualified: "outline",
  proposal: "default",
  won: "default",
  lost: "destructive",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

function StageBadge({ stage }: { stage: LeadDetailView["stage"] }) {
  return (
    <Badge
      variant={stageVariants[stage]}
      className={cn(
        stage === "won" && "bg-emerald-500",
        stage === "contacted" && "bg-sky-500",
      )}
    >
      <span className="capitalize">{stage}</span>
    </Badge>
  );
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Home", href: "/p/home" },
      { label: "Leads", href: "/p/leads" },
      { label: "Detail" },
    ]);
  }, [setItems]);

  const { data, isPending } = useGetLead(id);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const lead = data?.lead;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/p/leads" />}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UserIcon className="size-6 text-muted-foreground" />
            {lead?.costumer.name ?? "Untitled lead"}
          </h1>
          {lead ? (
            <p className="text-sm text-muted-foreground">
              {lead.costumer.from ? (
                <span className="capitalize">
                  {lead.costumer.from === "contact"
                    ? "From contact"
                    : "From customer"}
                </span>
              ) : (
                "Lead"
              )}
              {lead.organization.name
                ? ` · ${lead.organization.name}`
                : null}
            </p>
          ) : null}
        </div>
        {lead ? (
          <div className="flex items-center gap-2">
            <StageBadge stage={lead.stage} />
            <Badge variant="outline" className="capitalize">
              {lead.source}
            </Badge>
          </div>
        ) : null}
        {lead ? (
          <div className="ml-auto flex items-center gap-2">
            <CreateTaskDialog leadId={lead.id} />
            {lead.canUpdate ? (
              <>
                <ChangeLeadStageDialog lead={lead} />
                <EditLeadDialog lead={lead} />
              </>
            ) : null}
            {lead.canDelete ? <DeleteLeadDialog leadId={lead.id} /> : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
            <CardDescription>
              Contact and pipeline information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoRow
                label="Phone"
                value={
                  lead?.contacts.phone ? (
                    <span className="flex items-center gap-1.5 font-medium">
                      <PhoneIcon className="size-4 text-muted-foreground" />
                      {lead.contacts.phone}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Email"
                value={
                  lead?.email.email ? (
                    <span className="flex items-center gap-1.5">
                      <MailIcon className="size-4 text-muted-foreground" />
                      {lead.email.email}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Company / Organization"
                value={
                  lead?.organization.name ? (
                    lead.organization.id && lead.organization.from ? (
                      <Link
                        href={`/p/customer-organizations/${lead.organization.id}`}
                        className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                      >
                        <Building2Icon className="size-4 text-muted-foreground" />
                        {lead.organization.name}
                      </Link>
                    ) : (
                      lead.organization.name
                    )
                  ) : null
                }
              />
              <InfoRow
                label="Estimated value"
                value={
                  lead?.estimatedValue != null ? (
                    <span className="flex items-center gap-1.5 font-medium">
                      <CircleDollarSignIcon className="size-4 text-muted-foreground" />
                      {currencyFormatter.format(lead.estimatedValue)}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Owner"
                value={
                  lead?.ownerName ? (
                    <span className="flex items-center gap-1.5">
                      <UserRoundIcon className="size-4 text-muted-foreground" />
                      {lead.ownerName}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Assignee"
                value={
                  lead?.assigneeName ? (
                    <span className="flex items-center gap-1.5">
                      <UserRoundIcon className="size-4 text-muted-foreground" />
                      {lead.assigneeName}
                    </span>
                  ) : null
                }
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="size-4" />
              Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-5">
              <InfoRow
                label="Stage"
                value={lead ? <StageBadge stage={lead.stage} /> : null}
              />
              <InfoRow
                label="Last stage change"
                value={
                  lead?.stageChangedAt ? (
                    <span className="flex items-center gap-1.5">
                      <CalendarClockIcon className="size-4 text-muted-foreground" />
                      {formatRelativeTime(lead.stageChangedAt)}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Won at"
                value={
                  lead?.wonAt ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2Icon className="size-4 text-emerald-500" />
                      {formatRelativeTime(lead.wonAt)}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Lost at"
                value={
                  lead?.lostAt ? (
                    <span className="flex items-center gap-1.5">
                      <XCircleIcon className="size-4 text-destructive" />
                      {formatRelativeTime(lead.lostAt)}
                    </span>
                  ) : null
                }
              />
              <InfoRow
                label="Created"
                value={formatRelativeTime(lead?.createdAt)}
              />
              <InfoRow
                label="Last updated"
                value={formatRelativeTime(lead?.updatedAt)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {lead?.notes ?? (
              <span className="text-muted-foreground">No notes.</span>
            )}
          </p>
        </CardContent>
      </Card>

      {lead ? (
        <Card>
          <CardHeader>
            <CardTitle>Activity & Tasks</CardTitle>
            <CardDescription>
              Timeline of stage changes, logged follow-ups, and tasks for this
              lead.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activity">
              <TabsList>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              <TabsContent
                value="activity"
                className="max-h-96 overflow-y-auto pr-2 pt-4"
              >
                <LeadActivities leadId={lead.id} canAdd={lead.canUpdate} />
              </TabsContent>
              <TabsContent value="tasks" className="pt-4">
                <TaskTable leadId={lead.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : null}

      {lead &&
      (lead.customerId || lead.contactId || lead.customerOrganizationId) ? (
        <Card>
          <CardHeader>
            <CardTitle>Linked records</CardTitle>
            <CardDescription>
              Canonical records this lead is connected to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {lead.customerId ? (
                <InfoRow
                  label="Customer"
                  value={
                    <Link
                      href={`/p/customers/${lead.customerId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.costumer.name ?? "View customer"}
                    </Link>
                  }
                />
              ) : null}
              {lead.contactId ? (
                <InfoRow
                  label="Contact"
                  value={
                    <Link
                      href={`/p/contacts/${lead.contactId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.costumer.name ?? "View contact"}
                    </Link>
                  }
                />
              ) : null}
              {lead.customerOrganizationId ? (
                <InfoRow
                  label="Organization"
                  value={
                    <Link
                      href={`/p/customer-organizations/${lead.customerOrganizationId}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.organization.name ?? "View organization"}
                    </Link>
                  }
                />
              ) : null}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}