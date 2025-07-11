import User from '#models/user'
import UserRepository from '#repositories/user.repository'
import { QueryBuilderParams } from '#types/app'
import { UserPayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class UserService {
  constructor(protected userRepo: UserRepository) {}

  async index(queryParams: QueryBuilderParams<typeof User>) {
    return await this.userRepo.query(queryParams)
  }

  async createEdit(data: UserPayload) {
    return this.userRepo.updateOrCreateUser(data)
  }

  async deleteUser(id: string) {
    return this.userRepo.deleteGeneric(id)
  }
}
