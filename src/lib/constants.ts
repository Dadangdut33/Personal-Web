import { PaperProps } from "@mantine/core";

export const ID_LENGTH = 36;
export const ERR_GENERIC = {
  success: false,
  message: "An error occured, try again later or contact site owner!",
};
export const ERR_AUTH_EXPIRED = {
  success: 0,
  data: { needsReAuth: true },
  message: "Your session has expired! Please re-authenticate!",
};
export const ERR_TOO_MANY_REQUESTS = {
  success: false,
  message: "Too many requests, please try again later!",
};
export const ERR_UNAUTHORIZED = { success: false, message: "Unauthorized access!" };
export const ERR_INVALID_AUTH = {
  success: false,
  message: "Username or password is incorrect!",
};
export const WEB_NAME = "Dadangdut33";
export const DASHBOARD_PATH = "/dashboard";
export const PASS_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$&+,:;=?@#|'<>.^*()%!-])/;
export const PASS_REQ = [
  { re: /[0-9]/, label: "Must contain at least one number" },
  { re: /[a-z]/, label: "Must contain at least one lowercase letter" },
  { re: /[A-Z]/, label: "Must contain at least one uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Must contain at least one special character" },
];
export const MATCH_MOBILE_MQ = "(max-width: 992px)";
export const DASHBOARD_PAPER_PROPS: PaperProps = {
  p: "md",
  shadow: "md",
  radius: "md",
};
export const _MB = 1024 * 1024;
export const _GB = _MB * 1024;
export const FILE_SIZE_LIMIT = 20 * _MB;
export const TEMP_SESSION_AGE = 1000 * 60 * 60 * 1; // 1 hours
export const MAX_SESSION_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
export const MAX_VARCHAR = 2048;
export const MAX_SAVED_REVISIONS = 5;
