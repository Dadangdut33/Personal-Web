import router from '@adonisjs/core/services/router'

import { middleware } from '../kernel.js'

const HomeController = () => import('#controllers/home.controller')
const ProjectPublicController = () => import('#controllers/project_public.controller')
const BlogPublicController = () => import('#controllers/blog_public.controller')

router.group(() => {
  router.get('/', [HomeController, 'view']).as('home')
  router.get('/blog', [BlogPublicController, 'view']).use(middleware.silent_auth()).as('blog')
  router
    .get('/blog/:segment', [BlogPublicController, 'viewPost'])
    .use(middleware.silent_auth())
    .as('blog.post')
  router.get('/projects', [ProjectPublicController, 'view']).as('projects')
})
