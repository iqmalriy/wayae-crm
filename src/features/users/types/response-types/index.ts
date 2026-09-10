export interface UserView {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  createdAt: string;
}

export interface CreateUserOutput {
  user: UserView;
}

export interface UpdateUserOutput {
  user: UserView;
}

export interface ListUsersOutput {
  users: UserView[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}