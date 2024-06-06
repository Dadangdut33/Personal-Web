import { z } from "zod";

export type stringMeta = { createdAt: string; updatedAt: string };
export const stringTrimmed = z.string().trim();
export const booleanSchema = z.boolean();
export const dateSchema = z.date();
export const uuidSchema = z.string().uuid();
export const passValidation = z
  .string()
  .min(8, { message: "Must be at least 8 characters" })
  .regex(new RegExp(/[0-9]/), { message: "Must contain at least one number" })
  .regex(new RegExp(/[a-z]/), { message: "Must contain at least one lowercase letter" })
  .regex(new RegExp(/[A-Z]/), { message: "Must contain at least one uppercase letter" })
  .regex(new RegExp(/[$&+,:;=?@#|'<>.^*()%!-]/), { message: "Must contain at least one special character" });
