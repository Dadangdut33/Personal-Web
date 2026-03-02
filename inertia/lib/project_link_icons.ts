import * as TablerIcons from '@tabler/icons-react'
import type { ComponentType } from 'react'

type IconComponent = ComponentType<{ size?: number; className?: string }>

export type ProjectLinkIconValue = string

function resolveIconName(value: string | null | undefined) {
  if (!value) return 'IconLink'
  if ((TablerIcons as Record<string, unknown>)[value]) return value
  return 'IconLink'
}

export function getProjectLinkIcon(value: string | null | undefined): IconComponent {
  const name = resolveIconName(value)
  const icon = (TablerIcons as any)[name]
  return icon || (TablerIcons.IconLink as IconComponent)
}

export function getProjectLinkIconLabel(value: string | null | undefined) {
  const name = resolveIconName(value)
  return name.replace(/^Icon/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}
