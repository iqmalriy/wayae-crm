import type { Metadata } from "next";
import { TasksPage } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Tasks",
};

export default function TasksRoutePage() {
  return <TasksPage />;
}