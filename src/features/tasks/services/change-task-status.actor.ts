import type { TaskActor } from "../types/actor";

export interface ChangeTaskStatusActor extends TaskActor {
  name: string;
}
