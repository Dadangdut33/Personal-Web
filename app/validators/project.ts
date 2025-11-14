import vine from '@vinejs/vine'

import { trimmedString } from './_shared.js'

export const projectValidator = vine.compile(
  vine.object({
    id: vine.number().optional(),
    is_active: vine.boolean().optional(),
    is_pinned: vine.boolean().optional(),
    title: trimmedString,
    thumbnail: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
    description: trimmedString.optional(),
    tags: vine.array(trimmedString).optional(),
  })
)
