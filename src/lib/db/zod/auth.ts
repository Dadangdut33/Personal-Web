import { z } from 'zod';

import { passValidation } from './utils';

export const authenticationSchema = z.object({
  username: z.string(),
  password: passValidation,
  rememberMe: z.boolean().optional(),
  token: z.string().nullable(),
  redirect: z.string().nullable(),
});

export type AuthParams = z.infer<typeof authenticationSchema>;
