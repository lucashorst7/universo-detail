import { Drop, Armchair, Shield, Eye, Sparkle, Gear, Tire, SprayBottle, Package, type Icon as PhosphorIcon } from '@phosphor-icons/react'

const map: Record<string, PhosphorIcon> = {
  'drop': Drop,
  'armchair': Armchair,
  'shield': Shield,
  'eye': Eye,
  'sparkle': Sparkle,
  'gear': Gear,
  'tire': Tire,
  'spray-bottle': SprayBottle,
  'package': Package,
}

export function getCategoryIcon(iconName: string | null): PhosphorIcon {
  return (iconName && map[iconName.toLowerCase()]) || Package
}
