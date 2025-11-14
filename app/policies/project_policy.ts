import User from '#models/user'

import { HttpContext } from '@adonisjs/core/http'

import CustomBasePolicy from './custom_base_policy.js'

export default class ProjectPolicy extends CustomBasePolicy {
  private base = 'project'

  async view(user: User) {
    return this.perm.check(user, `${this.base}.view`)
  }

  async create(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.create`, request, 'POST')
  }

  async update(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.update`, request, 'PATCH')
  }

  async delete(user: User, request: HttpContext['request']) {
    return this.perm.checkInMethod(user, `${this.base}.delete`, request, 'DELETE')
  }
}
