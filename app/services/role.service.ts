import Role from '#models/role'
import RoleRepository from '#repositories/role.repository'
import { QueryBuilderParams } from '#types/app'
import { RolePayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class RoleService {
  constructor(protected roleRepo: RoleRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Role>) {
    return await this.roleRepo.query(queryParams)
  }

  async createEdit(data: RolePayload) {
    return this.roleRepo.updateOrCreateGeneric(data)
  }

  async deleteRole(id: string) {
    return this.roleRepo.deleteGeneric(id)
  }
}
