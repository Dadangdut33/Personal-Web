/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

import { middleware } from './kernel.js'
import './routes/auth.js'
import './routes/dashboard.js'

router.group(() => {
  router.on('/').renderInertia('home').as('home')
  router.on('/projects').renderInertia('home').as('projects')
  router.on('/blog').renderInertia('home').as('blog')
})
