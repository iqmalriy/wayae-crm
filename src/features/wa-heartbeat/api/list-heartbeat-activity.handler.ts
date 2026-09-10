import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { heartbeatActivityQuery } from "../schemas/heartbeat-activity.schema";
import { getWaAccountHeartbeatActivity } from "../services/heartbeat-activity.service";

export async function listWaAccountHeartbeatActivityHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  const url = new URL(request.url);
  const parsed = heartbeatActivityQuery.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await getWaAccountHeartbeatActivity(id, parsed.data);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}