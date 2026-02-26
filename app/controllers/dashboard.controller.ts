import { throwForbidden } from '#lib/utils'
import DashboardService from '#services/dashboard.service'

import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class HomeController {
  constructor(protected dashboardSvc: DashboardService) {}

  async view({ inertia, bouncer, auth, request }: HttpContext) {
    if (await bouncer.with('DashboardPolicy').denies('view')) return throwForbidden()

    const allowedRanges = ['7d', '14d', '30d', 'all'] as const
    const inputRange = request.input('range')
    let range: (typeof allowedRanges)[number] = '7d'
    if (typeof inputRange === 'string' && allowedRanges.includes(inputRange as any)) {
      range = inputRange as (typeof allowedRanges)[number]
    }

    const permissions = auth.user ? await this.dashboardSvc.getUserPermissions(auth.user) : []
    const overview = await this.dashboardSvc.getOverview(permissions, range)

    return inertia.render('dashboard/index', {
      overview,
    })
  }
}
