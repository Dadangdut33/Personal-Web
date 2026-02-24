import { randomPasswordThrottle } from '#start/limiter'

import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const ProfileController = () => import('#controllers/profile.controller')
const MediaController = () => import('#controllers/media.controller')
const UserController = () => import('#controllers/user.controller')

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.get('/avatar', [ProfileController, 'getAvatarAPI']).as('api.v1.me.avatar')
          })
          .prefix('/me')

        router
          .group(() => {
            router
              .get('/redirect/:id', [MediaController, 'redirectMediaAPI'])
              .as('api.v1.media.redirect') // this route need signed URL for access. use router

            router.get('/', [MediaController, 'getMediaListAPI']).as('api.v1.media.list')
            router.post('/', [MediaController, 'uploadMediaAPI']).as('api.v1.media.upload')
            router.delete('/', [MediaController, 'deleteMediaAPI']).as('api.v1.media.destroy')
          })
          .prefix('/media')

        router
          .group(() => {
            router
              .get('/random-password', [UserController, 'generateRandomPassword'])
              .as('api.v1.utils.random-password')
          })
          .use(randomPasswordThrottle)
          .prefix('/utils')
      })
      .prefix('/v1')
  })
  .use([middleware.auth(), middleware.verify_email()])
  .prefix('/api')
