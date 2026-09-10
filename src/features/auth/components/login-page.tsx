import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center overflow-hidden rounded-md">
              <Image
                src="/wayae.jpg"
                alt="Wayae"
                width={24}
                height={24}
                className="size-full object-cover"
              />
            </div>
            Wayae CRM
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/wayae.jpg"
          alt="Wayae"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
