import type { TaskActor } from "../types/actor";

export interface CreateTaskActor extends TaskActor {
  name: string;
}