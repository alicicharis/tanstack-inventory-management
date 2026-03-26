import { Badge } from '#/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'
import type { badgeVariants } from '#/components/ui/badge'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const statusVariantMap: Record<string, BadgeVariant> = {
  DRAFT: 'secondary',
  SUBMITTED: 'default',
  PARTIALLY_RECEIVED: 'outline',
  RECEIVED: 'default',
  CONFIRMED: 'default',
  SHIPPED: 'default',
  CANCELLED: 'destructive',
}

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? 'secondary'
  const label = status.replace(/_/g, ' ')

  return <Badge variant={variant}>{label}</Badge>
}
