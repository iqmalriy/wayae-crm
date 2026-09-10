export function ok<T>(data: T, message = "Success.") {
  return { success: true, message, data };
}