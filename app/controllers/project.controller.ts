import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ProjectController {
  constructor() {}

  async view({ inertia }: HttpContext) {
    return inertia.render('project/index')
  }
}
