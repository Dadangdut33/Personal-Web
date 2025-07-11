import { getMethodActName, mapRequestToQueryParams } from '#lib/utils_server'
import PermissionCheckService from '#services/permission_check.service'
import RoleService from '#services/role.service'
import { createEditRoleValidator } from '#validators/auth/role'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RoleController {
  constructor(
    protected service: RoleService,
    protected permChecker: PermissionCheckService
  ) {}

  async viewList({ request, response, auth }: HttpContext) {
    try {
      await this.permChecker.checkPerm(auth.user!, 'role.view')

      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully fetched roles.',
        data: data,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  // if POST request -> create
  // if PATCH request -> update
  async storeOrUpdate({ request, response, auth }: HttpContext) {
    try {
      await this.permChecker.checkPermInMethod(auth.user!, 'role.create', request, 'POST')
      await this.permChecker.checkPermInMethod(auth.user!, 'role.update', request, 'PATCH')

      const data = await request.validateUsing(createEditRoleValidator)
      await this.service.createEdit(data)

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} role.`,
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }

  async destroy({ response, params, auth }: HttpContext) {
    try {
      await this.permChecker.checkPerm(auth.user!, 'role.delete')
      const id = params.id

      await this.service.deleteRole(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted role.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
