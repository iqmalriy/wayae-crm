import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { deleteUserForAdmin } from "../services/delete-user.service";

export async function deleteUserHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  if (id === guard.session.user.id) {
    return NextResponse.json(
      new AppError("FORBIDDEN", {
        message: "You cannot delete your own account.",
      }).toBody(),
      { status: 403 },
    );
  }

  try {
    const output = await deleteUserForAdmin(id);
    return NextResponse.json(ok(output, "User deleted."));
  } catch (error) {
    return toErrorResponse(error);
  }
}