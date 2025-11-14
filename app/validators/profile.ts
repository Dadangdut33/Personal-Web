import vine from '@vinejs/vine'

import { trimmedString } from './_shared.js'

// Create user by admin or edit user by admin
export const updateProfileValidator = vine.compile(
  vine.object({
    bio: trimmedString.maxLength(500).optional(),
  })
)
