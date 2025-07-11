import vine from '@vinejs/vine'

export const createEditRoleValidator = vine.compile(
  vine.object({
    id: vine.number().positive().optional(),
    name: vine.string(),
  })
)
