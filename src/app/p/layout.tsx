import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { BreadcrumbGlobal, BreadcrumbDisplay } from "@/components/breadcrumb-global";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { WaAccountStatusBanner } from "@/features/wa-accounts/components/wa-account-status-banner";
import { ConversationsPoller } from "@/features/wa-conversations/components/conversations-poller";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <BreadcrumbGlobal>
      <SidebarProvider>
        <ConversationsPoller>
          <AppSidebar />
          <SidebarInset className="h-svh overflow-hidden">
            <WaAccountStatusBanner />
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbDisplay />
            </header>
            <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              {children}
            </main>
          </SidebarInset>
        </ConversationsPoller>
      </SidebarProvider>
    </BreadcrumbGlobal>
  );
}