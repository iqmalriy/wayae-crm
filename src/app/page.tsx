import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function Home() {
  return <LoginPage />;
}