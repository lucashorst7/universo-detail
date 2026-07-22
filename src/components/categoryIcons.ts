import {
  Drop,
  Armchair,
  Shield,
  Eye,
  Sparkle,
  Gear,
  Tire,
  SprayBottle,
  Package,
  type IconProps,
} from '@phosphor-icons/react'
import type { ComponentType } from 'react'

const iconMap: Record<string, ComponentType<IconProps>> = {
  drop: Drop,
  armchair: Armchair,
  shield: Shield,
  eye: Eye,
  sparkle: Sparkle,
  gear: Gear,
  tire: Tire,
  'spray-bottle': SprayBottle,
  package: Package,
}

export function getCategoryIcon(iconName: string | null | undefined) {
  if (!iconName || !iconMap[iconName]) return Package
  return iconMap[iconName]
}

export { Package }
