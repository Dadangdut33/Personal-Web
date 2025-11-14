enum Tables {
  // user & auth
  USERS = 'users',
  USER_ROLES = 'user_roles',
  USER_PROFILES = 'user_profiles',
  ROLES = 'roles',
  PERMISSIONS = 'permissions',
  ROLE_PERMISSIONS = 'role_permissions',

  // system
  TOKENS = 'tokens',
  ACCESS_TOKEN = 'auth_access_tokens',
  RATE_LIMITS = 'rate_limits',

  // content
  MEDIA = 'media',
  PROJECTS = 'projects',
  BLOGS = 'blogs',
  BLOGS_PROJECTS = 'blogs_projects',
}

export default Tables
