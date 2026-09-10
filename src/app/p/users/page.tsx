import type { Metadata } from "next";
import { UsersPage } from "@/features/users";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersRoutePage() {
  return <UsersPage />;
}