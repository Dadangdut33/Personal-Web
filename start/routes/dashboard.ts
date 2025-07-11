import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const UsersController = () => import('#controllers/users.controller')
router
  .group(() => {
    router
      .group(() => {
        router.get('/', [UsersController, 'viewList'])
        router.post('/', [UsersController, 'storeOrUpdate'])
        router.patch('/', [UsersController, 'storeOrUpdate'])
        router.delete('/:id', [UsersController, 'destroy'])
      })
      .prefix('/users')
  })
  .use([middleware.auth(), middleware.verifyEmail()])
  .prefix('/dashboard')
