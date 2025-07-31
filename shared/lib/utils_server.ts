import env from '#start/env'
import { QueryBuilderParams, RequestError } from '#types/app'

import { HttpContext } from '@adonisjs/core/http'

export function isProd() {
  return env.get('NODE_ENV') === 'production'
}

export function mapRequestToQueryParams<T>(request: HttpContext['request']): QueryBuilderParams<T> {
  return {
    page: request.input('page', 1),
    perPage: request.input('perPage', 10),
    search: request.input('search', ''),
    sortBy: request.input('sortBy'),
    sortDirection: request.input('sortDirection', 'asc'),
  }
}

export function getMethodActName(request: HttpContext['request']) {
  const method = request.method()
  switch (method) {
    case 'GET':
      return 'fetched'
    case 'POST':
      return 'created'
    case 'PATCH':
      return 'updated'
    case 'DELETE':
      return 'deleted'
    default:
      return 'unknown'
  }
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
  if (err.code !== 'E_VALIDATION_ERROR') return ''

  const mappedErrors = mapFormErrors(err)
  return Object.entries(mappedErrors)
    .map(([_key, value]) => `- ${value}`)
    .join('\n')
}
