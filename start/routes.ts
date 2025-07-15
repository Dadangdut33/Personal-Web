/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'

import './routes/auth.js'
import './routes/dashboard.js'

router.group(() => {
  router.on('/').renderInertia('home').as('home')
  router.on('/projects').renderInertia('projects/index').as('projects')
  router.on('/blog').renderInertia('blogs/index').as('blog')
})
