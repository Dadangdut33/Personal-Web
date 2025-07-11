import vine from '@vinejs/vine'

export const emailValidator = vine
  .string()
  .email()
  .normalizeEmail()
  .unique(async (query, value) => {
    const match = await query.from('users').select('id').where('email', value).first()
    return !match
  })
export const emailValidatorCompiled = vine.compile(emailValidator)
