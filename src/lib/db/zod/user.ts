import { RoleOption } from "@/lib/db/schema/user";
import { z } from "zod";

import { passValidation, stringSchema } from "./utils";

export const createUserSchema = z.object({
  username: stringSchema,
  password: passValidation,
  role: z.enum(RoleOption),
  name: stringSchema,
  description: stringSchema.optional(),
});

export const updateUserSchema = z.object({
  username: stringSchema.length(10),
  role: z.enum(RoleOption),
  name: stringSchema,
  description: stringSchema.optional(),
});

export const updatePasswordSchema = z.object({
  oldPassword: passValidation,
  newPassword: passValidation,
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
