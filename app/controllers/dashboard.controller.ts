import { throwForbidden } from '#lib/utils'
import DashboardService from '#services/dashboard.service'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(protected dashboardSvc: DashboardService) {}

  async view({ inertia, bouncer, auth }: HttpContext) {
    if (await bouncer.with('DashboardPolicy').denies('view')) return throwForbidden()

    const permissions = auth.user ? await this.dashboardSvc.getUserPermissions(auth.user) : []
    const overview = await this.dashboardSvc.getOverview(permissions)

    return inertia.render('dashboard/index', {
      overview,
    })
  }
}
