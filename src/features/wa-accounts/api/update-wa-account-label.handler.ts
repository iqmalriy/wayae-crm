import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { updateWaAccountLabelInput } from "../schemas/update-wa-account.schema";
import { updateWaAccountLabelForAdmin } from "../services/update-wa-account-label.service";

export async function updateWaAccountLabelHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = updateWaAccountLabelInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await updateWaAccountLabelForAdmin(id, parsed.data);
    return NextResponse.json(ok(output, "WhatsApp account label updated."));
  } catch (error) {
    return toErrorResponse(error);
  }
}