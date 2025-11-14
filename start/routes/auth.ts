import { middleware } from '#start/kernel'
import {
  loginThrottle,
  reAskEmailVerifThrottle,
  registerThrottle,
  resetPasswordThrottle as resetPasswordRequestThrottle,
} from '#start/limiter'

import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth.controller')

router
  .group(() => {
    router.post('/logout', [AuthController, 'logout']).as('auth.logout').use([middleware.auth()])

    router.get('/login', [AuthController, 'viewLogin']).as('auth.login').use([middleware.guest()])
    router
      .post('/login', [AuthController, 'login'])
      .as('auth.login.post')
      .use([middleware.guest(), loginThrottle])

    router
      .get('/register', [AuthController, 'viewRegister'])
      .as('auth.register')
      .use([middleware.guest()])
    router
      .post('/register', [AuthController, 'register'])
      .as('auth.register.post')
      .use([middleware.guest(), registerThrottle])

    router
      .get('/reset-password', [AuthController, 'viewRequestResetPassword'])
      .as('auth.requestResetPassword')
    router
      .post('/reset-password/request', [AuthController, 'requestResetPassword'])
      .as('auth.requestResetPassword.post')
      .use(resetPasswordRequestThrottle)
    router
      .get('/reset-password/:token', [AuthController, 'viewResetPassword'])
      .as('auth.resetPassword')
    router.post('/reset-password', [AuthController, 'resetPassword']).as('auth.resetPassword.post')

    router
      .get('/verify-email/:token?', [AuthController, 'viewVerifyMail'])
      .as('auth.verifyMail')
      .use(middleware.auth())
    router
      .post('/verify-email', [AuthController, 'verifyEmail'])
      .as('auth.verifyMail.post')
      .use(middleware.auth())
    router
      .post('/verify-email/request', [AuthController, 'requestVerifyEmail'])
      .as('auth.verifyMail.request')
      .use([reAskEmailVerifThrottle, middleware.auth()])
  })
  .prefix('/auth')
