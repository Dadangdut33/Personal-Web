import { AuthParams, authenticationSchema } from "../db/zod/auth";

const getErrorMessage = (errors: any): string => {
  if (errors.token) return "Invalid token - " + errors.token.join(", ");
  if (errors.username) return "Invalid Username - " + errors.username.join(", ");
  if (errors.password) return "Invalid Password - " + errors.password.join(", ");
  return ""; // return a default error message or an empty string
};

export const validateAuthFormData = (
  formData: FormData
): { data: AuthParams; error: null } | { data: null; error: string } => {
  const username = formData.get("username");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") === "true";
  const token = formData.get("token");
  const redirect = formData.get("redirect");
  const result = authenticationSchema.safeParse({ username, password, rememberMe, token, redirect });

  if (!result.success) {
    return {
      data: null,
      error: getErrorMessage(result.error.flatten().fieldErrors),
    };
  }

  return { data: result.data, error: null };
};
