import { NextResponse } from "next/server";

export const appErrorCodes = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "VALIDATION",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "INTERNAL",
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

export const appErrorStatus: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export const appErrorMessage: Record<AppErrorCode, string> = {
  UNAUTHORIZED: "You must be signed in.",
  FORBIDDEN: "You do not have permission to do that.",
  VALIDATION: "Invalid input.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "The request conflicts with existing data.",
  RATE_LIMITED: "Too many requests. Try again later.",
  INTERNAL: "Something went wrong.",
};

interface AppErrorOptions {
  message?: string;
  fields?: Record<string, string>;
}

export interface AppErrorField {
  code: AppErrorCode;
  message: string;
  path?: string;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: AppErrorCode, options: AppErrorOptions = {}) {
    super(options.message ?? appErrorMessage[code]);
    this.name = "AppError";
    this.code = code;
    this.status = appErrorStatus[code];
    this.fields = options.fields;
  }

  toBody(): { success: false; message: string; errors: AppErrorField[] } {
    const errors: AppErrorField[] = [{ code: this.code, message: this.message }];
    if (this.fields) {
      for (const [path, message] of Object.entries(this.fields)) {
        errors.push({ code: this.code, message, path });
      }
    }
    return { success: false, message: this.message, errors };
  }
}

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(error.toBody(), { status: error.status });
  }
  console.error(error);
  const internal = new AppError("INTERNAL");
  return NextResponse.json(internal.toBody(), { status: internal.status });
}