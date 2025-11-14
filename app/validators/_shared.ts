import vine from '@vinejs/vine'

export const emailValidator = vine
  .string()
  .email()
  .normalizeEmail()
  .unique(async (query, value) => {
    const match = await query.from('users').select('id').where('email', value).first()
    return !match
  })

export const trimmedString = vine.string().trim()

// must contain at least one uppercase, lowercase, digit, and special character
export const passwordValidator = vine
  .string()
  .minLength(8)
  .maxLength(255)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,255}$/)
