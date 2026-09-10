import { createUserHandler, listUsersHandler } from "@/features/users";

export const POST = createUserHandler;
export const GET = listUsersHandler;