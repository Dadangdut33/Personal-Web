import { RoleType } from "./db/schema/enum";

export interface DatabaseUserAttributes {
  id: string;
  username: string;
  twoFactorSecret: string | null;
  role: RoleType[];
}
export interface AuthSessionUser extends Omit<DatabaseUserAttributes, "twoFactorSecret"> {
  setupTwoFactor: boolean;
}
export type AuthSession = {
  session: { user: AuthSessionUser } | null;
};
export type NeedsReAuth = {
  needsReAuth: boolean;
};
export type NeedsTwoFactor = {
  needsTwoFactor: boolean;
};
export type ApiReturn<T = any, U = any> = {
  success: number | boolean;
  data?: T & U; // so we can infer more than one type if needed
  message?: string;
};
export type BaseModalProps<T = any> = {
  opened: boolean;
  closeModal: () => void;
  modelObj?: T;
};
export type TableProps<T> = {
  data: T[];
  doEditData: (data: T) => void;
  doDelete: (data: T) => void;
  batchDelete: (data: T[]) => void;
};
export type BaseDashboardProps<T> = {
  user: AuthSessionUser;
  apiData: ApiReturn<T>;
};
export type UpdateCardFn = (content: FormData) => Promise<ApiReturn>;
