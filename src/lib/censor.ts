export function censorPhone(phoneNumber: string): string {
  if (phoneNumber.length <= 4) return "****";
  return `${"*".repeat(phoneNumber.length - 4)}${phoneNumber.slice(-4)}`;
}

export function censorEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 1) return "*".repeat(email.length);
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  return `${local[0]}${"*".repeat(Math.max(1, local.length - 1))}${domain}`;
}