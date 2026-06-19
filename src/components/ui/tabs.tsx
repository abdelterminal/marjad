"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "relative flex border-b border-[var(--color-brand-border)] gap-6",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative pb-3 text-sm font-medium text-[var(--color-brand-text-muted)]",
        "transition-colors hover:text-[var(--color-brand-text)]",
        "focus-visible:outline-none focus-visible:text-[var(--color-brand-text)]",
        "data-[selected]:text-[var(--color-brand-text)]",
        // Active underline
        "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px]",
        "after:scale-x-0 after:rounded-full after:bg-[var(--color-brand-primary)]",
        "after:transition-transform after:duration-200",
        "data-[selected]:after:scale-x-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("pt-5 focus-visible:outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
