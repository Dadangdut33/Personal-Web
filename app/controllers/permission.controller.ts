import { getMethodActName, mapRequestToQueryParams } from '#lib/utils_server'
import PermissionService from '#services/permission.service'
import PermissionCheckService from '#services/permission_check.service'
import { createEditPermissionValidator } from '#validators/auth/permission'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PermissionController {
  constructor(
    protected service: PermissionService,
    protected permChecker: PermissionCheckService
  ) {}

  async viewList({ request, response, auth }: HttpContext) {
    try {
      await this.permChecker.checkPerm(auth.user!, 'permission.view')

      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully fetched permissions.',
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
      await this.permChecker.checkPermInMethod(auth.user!, 'permission.create', request, 'POST')
      await this.permChecker.checkPermInMethod(auth.user!, 'permission.update', request, 'PATCH')

      const data = await request.validateUsing(createEditPermissionValidator)
      await this.service.createEdit(data)

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} permission.`,
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

      await this.service.deletePermission(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted permission.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
