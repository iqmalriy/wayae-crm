import type { ZodError } from "zod";
import { AppError } from "./errors";

export function validationErrorFromZod(error: ZodError): AppError {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return new AppError("VALIDATION", {
    message: "Invalid input.",
    fields,
  });
}