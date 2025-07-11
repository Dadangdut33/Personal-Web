import env from '#start/env'
import { QueryBuilderParams } from '#types/app'

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
