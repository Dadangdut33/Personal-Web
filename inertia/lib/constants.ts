import { route } from '@izzyjs/route/client'
import {
  BookText,
  Bot,
  Boxes,
  History,
  Images,
  LayoutDashboard,
  ShieldUser,
  SquareTerminal,
  UserPen,
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
      title: 'need dashboard.view',
      url: '#',
      icon: SquareTerminal,
      items: [
        {
          title: 'Submenu 1 (need profile.view)',
          url: '#',
          requiredPermission: 'profile.view',
        },
        {
          title: 'Submenu 2 (no perm needed)',
          url: '#',
        },
        {
          title: 'Submenu 3 (no perm needed)',
          url: '#',
        },
      ],
      requiredPermission: 'dashboard.view',
    },
    {
      title: 'no perm needed',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Submenu 1',
          url: '#',
        },
        {
          title: 'Submenu 2',
          url: '#',
        },
      ],
    },
    {
      title: 'Profile',
      url: route('profile.view').path,
      icon: UserPen,
      flat: true,
      requiredPermission: 'profile.view',
    },
  ],
  management: [
    {
      title: 'Blogs',
      url: '/dashboard/blogs',
      icon: BookText,
      flat: true,
      requiredPermission: 'blog.view',
    },
    {
      title: 'Media',
      url: route('media.index').path,
      icon: Images,
      flat: true,
      requiredPermission: 'media.view',
    },
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
