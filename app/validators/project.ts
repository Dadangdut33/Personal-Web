import vine from '@vinejs/vine'

export const projectValidator = vine.compile(
  vine.object({
    id: vine.number().optional(),
    is_active: vine.boolean().optional(),
    is_pinned: vine.boolean().optional(),
    title: vine.string().trim(),
    thumbnail: vine
      .file({
        size: '10mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
    description: vine.string().trim().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
