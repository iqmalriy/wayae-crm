export function censorPhone(phoneNumber: string): string {
  if (phoneNumber.length <= 4) return "****";
  return `${"*".repeat(phoneNumber.length - 4)}${phoneNumber.slice(-4)}`;
}

export function phoneForRole(
  phoneNumber: string,
  role: "admin" | "staff",
): string {
  return role === "admin" ? phoneNumber : censorPhone(phoneNumber);
}

export function phoneForViewer(
  phoneNumber: string,
  role: "admin" | "staff",
  isOwner: boolean,
): string {
  return role === "admin" || isOwner ? phoneNumber : censorPhone(phoneNumber);
}