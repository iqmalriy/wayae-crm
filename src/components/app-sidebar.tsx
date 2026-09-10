"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserCard } from "@/features/auth";
import { useConversationUnread } from "@/features/wa-conversations/components/conversations-poller";
import {
  BookUserIcon,
  Building2Icon,
  ContactRoundIcon,
  HomeIcon,
  ListTodoIcon,
  MessageSquareTextIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";

const navGroups = [
  {
    label: "Navigation",
    items: [
      { title: "Home", href: "/p/home", icon: HomeIcon },
      {
        title: "Conversations",
        href: "/p/conversations",
        icon: MessageSquareTextIcon,
      },
      { title: "Tasks", href: "/p/tasks", icon: ListTodoIcon },
    ],
  },
  {
    label: "Teams",
    items: [
      { title: "Users", href: "/p/users", icon: UsersIcon },
      {
        title: "WhatsApp Accounts",
        href: "/p/wa-accounts",
        icon: MessageSquareTextIcon,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Leads", href: "/p/leads", icon: TargetIcon },
      { title: "Contacts", href: "/p/contacts", icon: BookUserIcon },
      {
        title: "Customers",
        href: "/p/customers",
        icon: ContactRoundIcon,
      },
      {
        title: "Customer Organizations",
        href: "/p/customer-organizations",
        icon: Building2Icon,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { totalUnreadCount } = useConversationUnread();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link
                  href="/p/home"
                  className={isCollapsed ? "justify-center" : ""}
                >
                  <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Image
                      src="/wayae.jpg"
                      alt="Wayae"
                      width={32}
                      height={32}
                      className="size-full object-cover"
                    />
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="font-semibold">Wayae CRM</span>
                      <span className="text-xs text-sidebar-foreground/70">
                        Dashboard
                      </span>
                    </div>
                  )}
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Icon />
                        <span>{item.title}</span>
                        {item.href === "/p/conversations" &&
                        totalUnreadCount > 0 ? (
                          <span className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                          </span>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}