import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root>

export function ToggleGroup({ className = '', ...props }: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={`toggle-group ${className}`.trim()}
      {...props}
    />
  )
}

type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupPrimitive.Item>

export function ToggleGroupItem({ className = '', ...props }: ToggleGroupItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={`toggle-group-item ${className}`.trim()}
      {...props}
    />
  )
}
