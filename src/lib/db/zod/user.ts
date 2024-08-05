import { RoleOption } from '@/lib/db/schema/_enum';
import { csrf, Modify } from '@/lib/types';
import { z } from 'zod';

import { passValidation, stringTrimmed } from './utils';

const baseUserZod = {
  username: stringTrimmed.toLowerCase().min(3, { message: 'Must be at least 3 characters' }),
  role: z.enum(RoleOption, { message: 'Not a valid role enum' }).array(),
  name: stringTrimmed.min(1, { message: 'Name is required' }),
  description: stringTrimmed.optional().nullable(),
  title: stringTrimmed.optional().nullable(),
};

export const createUserSchema = z.object({
  ...baseUserZod,
  password: passValidation,
});

export const updateUserSchema = z.object({
  ...baseUserZod,
});

export const updatePasswordSchema = z.object({
  passwordOld: passValidation,
  passwordNew: passValidation,
});

type stringified = {
  role: string;
  description: string;
  title: string;
};
export type CreateUserZod = z.infer<typeof createUserSchema>;
export type CreateUser = Modify<CreateUserZod, stringified> & csrf;
export type UpdateUserZod = z.infer<typeof updateUserSchema>;
export type UpdateUser = Modify<UpdateUserZod, stringified> & csrf;
export type UpdatePasswordZod = z.infer<typeof updatePasswordSchema>;
export type UpdatePassword = UpdatePasswordZod & csrf;
