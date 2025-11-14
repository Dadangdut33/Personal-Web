import vine from '@vinejs/vine'

import { trimmedString } from './_shared.js'

export const blogValidator = vine.compile(
  vine.object({
    id: vine.number().optional(),
    slug_id: trimmedString,
    title: trimmedString,
    thumbnail: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
    description: trimmedString.optional(),
    content: vine.object({}).allowUnknownProperties(),
    tags: vine.array(trimmedString).optional(),
  })
)
