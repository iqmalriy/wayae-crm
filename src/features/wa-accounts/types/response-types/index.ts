export interface WaAccountView {
  id: string;
  userId: string | null;
  phone: string;
  label: string;
  createdAt: string;
}

export interface CreateWaAccountOutput {
  waAccount: WaAccountView;
  token: string;
}

export interface UpdateWaAccountLabelOutput {
  waAccount: WaAccountView;
}

export interface RefreshWaAccountTokenOutput {
  waAccount: WaAccountView;
  token: string;
}

export interface WaAccountUserView {
  id: string;
  name: string;
  email: string;
}

export interface WaAccountListItem {
  id: string;
  userId: string | null;
  phone: string;
  label: string;
  lastHeartbeatAt: string | null;
  extVersion: string | null;
  protocolVersion: string | null;
  queueSize: number | null;
  createdAt: string;
  user: WaAccountUserView | null;
}

export interface ListWaAccountsOutput {
  waAccounts: WaAccountListItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}