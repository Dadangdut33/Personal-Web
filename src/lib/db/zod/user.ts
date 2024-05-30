import { RoleOption } from "@/lib/db/schema/enum";
import { z } from "zod";

import { passValidation, stringSchema } from "./utils";

const baseUserZod = {
  username: stringSchema,
  role: z.enum(RoleOption).array(),
  name: stringSchema,
  description: stringSchema.optional(),
  title: stringSchema.optional(),
};

export const createUserSchema = z.object({
  ...baseUserZod,
  password: passValidation,
});

export const updateUserSchema = z.object({
  ...baseUserZod,
});

export const updatePasswordSchema = z.object({
  oldPassword: passValidation,
  newPassword: passValidation,
});

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
