import { getMethodActName, mapRequestToQueryParams } from '#lib/utils_server'
import PermissionCheckService from '#services/permission_check.service'
import UserService from '#services/user.service'
import { createEditUserValidator } from '#validators/users'

import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UsersController {
  constructor(
    protected service: UserService,
    protected permChecker: PermissionCheckService
  ) {}

  async viewList({ request, response, auth }: HttpContext) {
    try {
      await this.permChecker.checkPerm(auth.user!, 'user.view')

      const q = mapRequestToQueryParams(request)
      const data = await this.service.index(q)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully fetched users.',
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
      await this.permChecker.checkPermInMethod(auth.user!, 'user.create', request, 'POST')
      await this.permChecker.checkPermInMethod(auth.user!, 'user.update', request, 'PATCH')

      const data = await request.validateUsing(createEditUserValidator)
      await this.service.createEdit(data)

      return response.status(200).json({
        status: 'success',
        message: `Successfully ${getMethodActName(request)} user.`,
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
      await this.permChecker.checkPerm(auth.user!, 'user.delete')
      const id = params.id

      await this.service.deleteUser(id)

      return response.status(200).json({
        status: 'success',
        message: 'Successfully deleted user.',
      })
    } catch (error) {
      return response.status(error.status || 500).json({
        status: 'error',
        message: error.messages?.[0]?.message || error.message || 'Something went wrong',
      })
    }
  }
}
