import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { updateTaskInput } from "../schemas/update-task.schema";
import { updateTaskForUser } from "../services/update-task.service";

export async function updateTaskHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
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

  const parsed = updateTaskInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await updateTaskForUser(
      id,
      {
        userId: guard.session.user.id,
        role,
        name: guard.session.user.name,
      },
      parsed.data,
    );
    return NextResponse.json(ok({ task: output.task }), { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
