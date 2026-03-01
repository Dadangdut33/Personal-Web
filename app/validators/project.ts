import vine from '@vinejs/vine'

export const createEditProjectValidator = vine.create(
  vine.object({
    id: vine.string().uuid().optional(),
    is_active: vine.boolean().optional(),
    is_pinned: vine.boolean().optional(),
    title: vine.string().trim().minLength(1).maxLength(255),
    thumbnail_id: vine.string().uuid().nullable().optional(),
    description: vine.string().trim().nullable().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
