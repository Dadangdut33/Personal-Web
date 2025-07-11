import Permission from '#models/permission'
import PermissionRepository from '#repositories/permission.repository'
import { QueryBuilderParams } from '#types/app'
import { PermissionPayload } from '#types/inferred'

import { inject } from '@adonisjs/core'

@inject()
export default class PermissionService {
  constructor(protected permissionRepo: PermissionRepository) {}

  async index(queryParams: QueryBuilderParams<typeof Permission>) {
    return await this.permissionRepo.query(queryParams)
  }

  async createEdit(data: PermissionPayload) {
    return this.permissionRepo.updateOrCreateGeneric(data)
  }

  async deletePermission(id: string) {
    return this.permissionRepo.deleteGeneric(id)
  }
}
