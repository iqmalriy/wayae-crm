import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireSession } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { getDashboardSummaryQuery } from "../schemas/get-dashboard.schema";
import { getDashboardSummary } from "../services/get-dashboard-summary.service";

export async function getDashboardSummaryHandler(request: Request) {
  const guard = await requireSession(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = getDashboardSummaryQuery.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await getDashboardSummary(guard.session.user, parsed.data);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}