'use client'

import { AuthUser } from '#types/models'

import { SharedProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import { ChevronRight, ChevronsUpDown, GalleryVerticalEnd, LogOut, User2 } from 'lucide-react'
import * as React from 'react'
import { useModals } from '~/components/core/modal/modal-hooks'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '~/components/ui/sidebar'
import { useAvatar } from '~/hooks/use_avatar'
import { useLogout } from '~/hooks/use_logout'
import { DASHBOARD_NAV } from '~/lib/constants'
import { getInitials } from '~/lib/utils'

type MenuItem = {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  flat?: boolean
  items?: {
    title: string
    url: string
    requiredPermission?: string
  }[]
  requiredPermission?: string
}

type SidebarMenuEntryProps = {
  item: MenuItem
  currentPath: string
  userPermissions: string[]
  activePaths: string[]
}

function normalizePath(path: string) {
  const sanitizedPath = path.split(/[?#]/)[0]
  if (!sanitizedPath || sanitizedPath === '/') return '/'
  return sanitizedPath.replace(/\/+$/, '')
}

function isPathActive(currentPath: string, targetPath: string) {
  if (!targetPath || targetPath === '#') return false

  const current = normalizePath(currentPath)
  const target = normalizePath(targetPath)

  return current === target || current.startsWith(`${target}/`)
}

function getBestMatchingPath(currentPath: string, paths: string[]) {
  const current = normalizePath(currentPath)

  return paths.reduce<string | null>((best, path) => {
    if (!path || path === '#') return best
    const normalizedPath = normalizePath(path)
    const matches = current === normalizedPath || current.startsWith(`${normalizedPath}/`)
    if (!matches) return best

    if (!best || normalizedPath.length > best.length) {
      return normalizedPath
    }

    return best
  }, null)
}

export function SidebarMenuEntry({
  item,
  currentPath,
  userPermissions,
  activePaths,
}: SidebarMenuEntryProps) {
  const normalizedItemPath = normalizePath(item.url)
  const bestMatchingPath = getBestMatchingPath(currentPath, activePaths)

  // ─────────────────────────────────────────────
  // Flat menu item
  // ─────────────────────────────────────────────
  if (item.flat) {
    if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
      return null
    }

    const isFlatActive = bestMatchingPath === normalizedItemPath

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isFlatActive}
          className="relative hover:bg-main/40 hover:text-foreground data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground data-[active=true]:bg-main data-[active=true]:text-main-foreground data-[active=true]:outline-border data-[active=true]:outline-2 data-[active=true]:before:absolute data-[active=true]:before:inset-y-1 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-main-foreground"
        >
          <Link href={item.url}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // ─────────────────────────────────────────────
  // Collapsible menu item
  // ─────────────────────────────────────────────
  const isGroupActive =
    bestMatchingPath === normalizedItemPath ||
    item.items?.some((subItem) => isPathActive(currentPath, subItem.url))

  if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
    return null
  }

  return (
    <Collapsible asChild defaultOpen={isGroupActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isGroupActive}
            className="relative hover:bg-main/40 hover:text-foreground data-[state=open]:bg-main data-[state=open]:outline-border data-[state=open]:text-main-foreground data-[active=true]:bg-main data-[active=true]:text-main-foreground data-[active=true]:outline-border data-[active=true]:outline-2 data-[active=true]:before:absolute data-[active=true]:before:inset-y-1 data-[active=true]:before:left-0 data-[active=true]:before:w-1 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-main-foreground"
          >
            {item.icon && <item.icon />}
            <span className="text-sm">{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              if (
                subItem.requiredPermission &&
                !userPermissions.includes(subItem.requiredPermission)
              ) {
                return null
              }

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isPathActive(currentPath, subItem.url)}
                    className="relative hover:bg-main/30 hover:text-foreground data-[active=true]:font-semibold data-[active=true]:before:absolute data-[active=true]:before:inset-y-1 data-[active=true]:before:left-0 data-[active=true]:before:w-0.5 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-main-foreground"
                  >
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthUser }) {
  const { isMobile, state } = useSidebar()
  const { props: sharedProps } = usePage<SharedProps>()
  const { ConfirmLogoutModal } = useModals()
  const { mutate: logout, isPending } = useLogout()
  const avatar = useAvatar()
  const initials = getInitials(sharedProps.user?.full_name || '')
  const avatarComp = (
    <Avatar className="h-8 w-8">
      <AvatarImage src={avatar} alt={initials} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
  const userComp = (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-heading">{sharedProps.user?.full_name}</span>
      <span className="truncate text-xs">{sharedProps.user?.email}</span>
    </div>
  )

  const confirm = ConfirmLogoutModal({
    onConfirm: () => {
      logout()
    },
  })

  // check from the management menu. one of the requiredPermission is in the user permissions
  const flatManagementRequiredPermissions = DASHBOARD_NAV.management.flatMap(
    (item) => item.requiredPermission
  )
  const haveAnyManagementAccess = sharedProps.user?.permissions.some((permission) => {
    return flatManagementRequiredPermissions.includes(permission)
  })

  const activePaths = React.useMemo(() => {
    return [
      ...DASHBOARD_NAV.flat.map((item) => item.url),
      ...DASHBOARD_NAV.menu.map((item) => item.url),
      ...DASHBOARD_NAV.menu.flatMap((item) => item.items?.map((subItem) => subItem.url) || []),
      ...DASHBOARD_NAV.management.map((item) => item.url),
    ].filter((path) => path && path !== '#')
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={'/'}>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-main data-[state=open]:text-main-foreground data-[state=open]:outline-border data-[state=open]:outline-2 cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-base">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-heading">{'Dadangdut33'}</span>
                  <span className="truncate text-xs">{'Personal Website'}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {DASHBOARD_NAV.flat.map((item) => (
              <SidebarMenuEntry
                key={item.title}
                item={item}
                currentPath={sharedProps.currentPath}
                userPermissions={sharedProps.user?.permissions || []}
                activePaths={activePaths}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {DASHBOARD_NAV.menu.map((item) => (
              <SidebarMenuEntry
                key={item.title}
                item={item}
                currentPath={sharedProps.currentPath}
                userPermissions={sharedProps.user?.permissions || []}
                activePaths={activePaths}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {haveAnyManagementAccess && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
              {DASHBOARD_NAV.management.map((item) => (
                <SidebarMenuEntry
                  key={item.title}
                  item={item}
                  currentPath={sharedProps.currentPath}
                  userPermissions={sharedProps.user?.permissions || []}
                  activePaths={activePaths}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible"
                  size="lg"
                >
                  {avatarComp}
                  {userComp}
                  {state === 'expanded' && <ChevronsUpDown className="ml-auto size-4" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-base">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {avatarComp}
                    {userComp}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User2 />
                    Profile
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem> */}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => confirm()}
                  disabled={isPending}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
