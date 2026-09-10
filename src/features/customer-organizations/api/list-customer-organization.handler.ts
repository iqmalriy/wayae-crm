import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { listCustomerOrganizationQuery } from "../schemas/list-customer-organization.schema";
import { listCustomerOrganizationsForUser } from "../services/list-customer-organization.service";

export async function listCustomerOrganizationsHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = listCustomerOrganizationQuery.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await listCustomerOrganizationsForUser(parsed.data);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}