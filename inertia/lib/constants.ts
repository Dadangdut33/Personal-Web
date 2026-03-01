import {
  BookText,
  Boxes,
  BriefcaseBusiness,
  History,
  Images,
  LayoutDashboard,
  ShieldUser,
  UserPen,
  UsersRound,
} from 'lucide-react'
import { urlFor } from '~/lib/client'

export const NAVIGATION_LINKS = [
  { text: 'Projects', href: urlFor('projects') },
  { text: 'Blog', href: urlFor('blog') },
]

export const DASHBOARD_NAV = {
  flat: [
    {
      title: 'Dashboard',
      url: urlFor('dashboard.view'),
      icon: LayoutDashboard,
      flat: true,
      requiredPermission: 'dashboard.view',
    },
  ],
  menu: [
    {
      title: 'Projects',
      url: urlFor('project.index'),
      icon: BriefcaseBusiness,
      items: [
        {
          title: 'List',
          url: urlFor('project.index'),
          requiredPermission: 'project.view',
        },
        {
          title: 'Create',
          url: urlFor('project.create'),
          requiredPermission: 'project.create',
        },
      ],
      requiredPermission: 'project.view',
    },
    {
      title: 'Blogs',
      url: urlFor('blog.index'),
      icon: BookText,
      items: [
        {
          title: 'List',
          url: urlFor('blog.index'),
          requiredPermission: 'blog.view',
        },
        {
          title: 'Create',
          url: urlFor('blog.create'),
          requiredPermission: 'blog.create',
        },
      ],
      requiredPermission: 'blog.view',
    },
    {
      title: 'Media',
      url: urlFor('media.index'),
      icon: Images,
      flat: true,
      requiredPermission: 'media.view',
    },
    {
      title: 'Profile',
      url: urlFor('profile.view'),
      icon: UserPen,
      flat: true,
      requiredPermission: 'profile.view',
    },
  ],
  management: [
    {
      title: 'Users',
      url: urlFor('user.index'),
      icon: UsersRound,
      flat: true,
      requiredPermission: 'user.view',
    },
    {
      title: 'Roles',
      url: urlFor('role.index'),
      icon: Boxes,
      flat: true,
      requiredPermission: 'role.view',
    },
    {
      title: 'Permissions',
      url: urlFor('permission.index'),
      icon: ShieldUser,
      flat: true,
      requiredPermission: 'permission.view',
    },
    {
      title: 'Activity Log',
      url: urlFor('activity_log.index'),
      icon: History,
      flat: true,
      requiredPermission: 'activity_log.view',
    },
  ],
}

export const TIMEOUT_SHORT = 1000 * 60 * 3 // 3 minute
export const TIMEOUT_NORMAL = 1000 * 60 * 5 // 5 minutes
export const TIMEOUT_EXTENDED = 1000 * 60 * 15 // 15 minutes

export const PASS_REQ = [
  { re: /[0-9]/, label: 'Must contain at least one number' },
  { re: /[a-z]/, label: 'Must contain at least one lowercase letter' },
  { re: /[A-Z]/, label: 'Must contain at least one uppercase letter' },
  { re: /[^A-Za-z0-9]/, label: 'Must contain at least one special character' }, // regex “any character that is not a letter or number."
]
export const PASS_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/ // min 8 chars, 1 upper, 1 lower, 1 number, 1 special char
