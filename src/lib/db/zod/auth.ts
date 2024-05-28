import { z } from "zod";

import { passValidation } from "./utils";

// schema untuk autentikasi
export const authenticationSchema = z.object({
  username: z.string(),
  password: passValidation,
  rememberMe: z.boolean().optional(),
  token: z.string().nullable(),
});

export type UsernameAndPassword = z.infer<typeof authenticationSchema>;
