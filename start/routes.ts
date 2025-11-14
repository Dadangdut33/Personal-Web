import router from '@adonisjs/core/services/router'

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import './routes/auth.js'
import './routes/dashboard.js'

const BlogController = () => import('#controllers/blog.controller')
const ProjectController = () => import('#controllers/project.controller')
const HomeController = () => import('#controllers/home.controller')

router.group(() => {
  router.get('/', [HomeController, 'view']).as('home')
  router.get('/projects', [ProjectController, 'view']).as('projects')
  router.get('/blog', [BlogController, 'view']).as('blog')
})
