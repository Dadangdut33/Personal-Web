import { z } from "zod";

export const stringSchema = z.string().trim();
export const booleanSchema = z.boolean();
export const dateSchema = z.date();
export const uuidSchema = z.string().uuid();
export const passValidation = z
  .string()
  .min(8, { message: "harus setidaknya 8 karakter" })
  .regex(new RegExp(/[0-9]/), { message: "harus mengandung setidaknya satu angka" })
  .regex(new RegExp(/[a-z]/), { message: "harus mengandung setidaknya satu huruf kecil" })
  .regex(new RegExp(/[A-Z]/), { message: "harus mengandung setidaknya satu huruf besar" })
  .regex(new RegExp(/[$&+,:;=?@#|'<>.^*()%!-]/), { message: "harus mengandung setidaknya satu simbol" });
