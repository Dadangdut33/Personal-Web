import vine from '@vinejs/vine'

export const blogValidator = vine.compile(
  vine.object({
    id: vine.number().optional(),
    slug_id: vine.string().trim(),
    title: vine.string().trim(),
    thumbnail: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
    description: vine.string().trim().optional(),
    content: vine.object({}).allowUnknownProperties(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
