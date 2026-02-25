import { route } from '@izzyjs/route/client'
import {
  BookText,
  Boxes,
  BriefcaseBusiness,
  History,
  Images,
  LayoutDashboard,
  ShieldUser,
  UsersRound,
} from 'lucide-react'

export const NAVIGATION_LINKS = [
  { text: 'Projects', href: route('projects').path },
  { text: 'Blog', href: route('blog').path },
]

export const DASHBOARD_NAV = {
  flat: [
    {
      title: 'Dashboard',
      url: route('dashboard.view').path,
      icon: LayoutDashboard,
      flat: true,
      requiredPermission: 'dashboard.view',
    },
  ],
  menu: [
    {
      title: 'Projects',
      url: route('project.index').path,
      icon: BriefcaseBusiness,
      items: [
        {
          title: 'List',
          url: route('project.index').path,
          requiredPermission: 'project.view',
        },
        {
          title: 'Create',
          url: route('project.create').path,
          requiredPermission: 'project.create',
        },
      ],
      requiredPermission: 'project.view',
    },
    {
      title: 'Blogs',
      url: route('blog.index').path,
      icon: BookText,
      items: [
        {
          title: 'List',
          url: route('blog.index').path,
          requiredPermission: 'blog.view',
        },
        {
          title: 'Create',
          url: route('blog.create').path,
          requiredPermission: 'blog.create',
        },
      ],
      requiredPermission: 'blog.view',
    },
    {
      title: 'Media',
      url: route('media.index').path,
      icon: Images,
      flat: true,
      requiredPermission: 'media.view',
    },
  ],
  management: [
    {
      title: 'Users',
      url: route('user.index').path,
      icon: UsersRound,
      flat: true,
      requiredPermission: 'user.view',
    },
    {
      title: 'Roles',
      url: route('role.index').path,
      icon: Boxes,
      flat: true,
      requiredPermission: 'role.view',
    },
    {
      title: 'Permissions',
      url: route('permission.index').path,
      icon: ShieldUser,
      flat: true,
      requiredPermission: 'permission.view',
    },
    {
      title: 'Activity Log',
      url: route('activity_log.index').path,
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
