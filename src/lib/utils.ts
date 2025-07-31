import { type RequestError } from '#types/app'

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProd() {
  return import.meta.env.PROD
}

export function mapFormErrors(err: RequestError) {
  // first need to make sure that it is indeed a form error
  if (err.code !== 'E_VALIDATION_ERROR') return {}

  const mappedErrors: Record<string, string> = {}

  err.messages.forEach((error) => {
    mappedErrors[error.field] = error.message
  })

  return mappedErrors
}

export function formErrorsToString(err: RequestError) {
  const mappedErrors = mapFormErrors(err)
  return Object.entries(mappedErrors)
    .map(([_key, value]) => `${value}`)
    .join(', ')
}
