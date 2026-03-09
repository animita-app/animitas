"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  openOnHover: boolean
  setOpen: (open: boolean) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  triggerRect: DOMRect | null
  setTriggerRect: (rect: DOMRect | null) => void
}>({
  open: false,
  openOnHover: false,
  setOpen: () => { },
  onMouseEnter: () => { },
  onMouseLeave: () => { },
  triggerRect: null,
  setTriggerRect: () => { },
})

function DropdownMenu({
  openOnHover = true,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root> & {
  openOnHover?: boolean
}) {
  const {
    defaultOpen,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    modal,
    ...rest
  } = props
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled
    ? setControlledOpen ?? (() => { })
    : setUncontrolledOpen

  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const onMouseEnter = React.useCallback(() => {
    if (!openOnHover) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }, [openOnHover, setOpen])

  const onMouseLeave = React.useCallback(() => {
    if (!openOnHover) return
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 50)
  }, [openOnHover, setOpen])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <DropdownMenuContext.Provider
      value={{
        open,
        openOnHover,
        setOpen: setOpen as (open: boolean) => void,
        onMouseEnter,
        onMouseLeave,
        triggerRect,
        setTriggerRect,
      }}
    >
      <DropdownMenuPrimitive.Root
        data-slot="dropdown-menu"
        open={open}
        onOpenChange={setOpen}
        modal={openOnHover ? false : modal}
        {...rest}
      />
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  const { onMouseEnter, onMouseLeave, setTriggerRect } = React.useContext(DropdownMenuContext)
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
      onMouseEnter={(e) => {
        setTriggerRect(e.currentTarget.getBoundingClientRect())
        onMouseEnter()
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        onMouseLeave()
        props.onMouseLeave?.(e)
      }}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const { open, openOnHover, onMouseEnter, onMouseLeave, triggerRect } = React.useContext(DropdownMenuContext)
  const [contentRect, setContentRect] = React.useState<DOMRect | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (contentRef.current) {
      const updateRect = () => {
        if (contentRef.current) setContentRect(contentRef.current.getBoundingClientRect())
      }
      updateRect()
      const timer = setTimeout(updateRect, 50)
      return () => clearTimeout(timer)
    }
  }, [open]) // Re-run when it opens/closes

  return (
    <DropdownMenuPrimitive.Portal>
      <>
        <DropdownMenuPrimitive.Content
          ref={contentRef}
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          className={cn(
            "font-medium bg-black text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-neutral-800 p-1 shadow-md",
            className
          )}
          onMouseEnter={(e) => {
            onMouseEnter()
            props.onMouseEnter?.(e)
          }}
          onMouseLeave={(e) => {
            onMouseLeave()
            props.onMouseLeave?.(e)
          }}
          onCloseAutoFocus={(e) => {
            if (openOnHover) {
              e.preventDefault()
            }
            onCloseAutoFocus?.(e)
          }}
          {...props}
        />
        {open && openOnHover && triggerRect && contentRect && (
          <PointerBridge
            triggerRect={triggerRect}
            contentRect={contentRect}
            side={(props as any).side ?? "bottom"}
          />
        )}
      </>
    </DropdownMenuPrimitive.Portal>
  )
}

function PointerBridge({
  triggerRect,
  contentRect,
  mousePos,
  side
}: {
  triggerRect: DOMRect,
  contentRect: DOMRect,
  side: string
}) {
  const { onMouseEnter, onMouseLeave } = React.useContext(DropdownMenuContext)

  const points = React.useMemo(() => {
    if (!triggerRect || !contentRect) return ""
    const { left: L, top: T, right: R, bottom: B } = triggerRect
    const { left: CL, top: CT, right: CR, bottom: CB } = contentRect

    // Connect from the trigger's FAR edge (opposite to opening direction) to the full content.
    // This creates a steep diagonal that covers both the trigger body and the bridge gap.
    // e.g. for "bottom": anchor on trigger TOP, sweep diagonally to content TOP corners.
    if (side === "bottom") return `${L},${B} ${R},${B} ${CR},${CT} ${CL},${CT}`
    if (side === "top")    return `${L},${T} ${R},${T} ${CR},${CB} ${CL},${CB}`
    if (side === "right")  return `${R},${T} ${R},${B} ${CL},${CB} ${CL},${CT}`
    if (side === "left")   return `${L},${T} ${L},${B} ${CR},${CB} ${CR},${CT}`

    return `${L},${B} ${R},${B} ${CR},${CT} ${CL},${CT}`
  }, [triggerRect, contentRect, side])

  if (!points || !triggerRect || !contentRect) return null

  return (
    <svg
      className="fixed inset-0 z-[60] overflow-visible"
      style={{ pointerEvents: 'none' }}
    >
      <polygon
        points={points}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ pointerEvents: 'auto' }}
        className="fill-transparent stroke-none"
      />
    </svg>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "font-medium data-[highlighted]:bg-neutral-800 data-[highlighted]:text-white data-[variant=destructive]:text-rose-400 data-[variant=destructive]:data-[highlighted]:bg-rose-950 data-[variant=destructive]:data-[highlighted]:text-rose-400 [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-neutral-800 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4 opacity-50" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-neutral-800 relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-neutral-900 -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  const { onMouseEnter, setTriggerRect } = React.useContext(DropdownMenuContext)
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "[&_svg]:opacity-75 data-[highlighted]:bg-neutral-800 data-[state=open]:bg-neutral-800 [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
      onMouseEnter={(e) => {
        setTriggerRect(e.currentTarget.getBoundingClientRect())
        onMouseEnter()
        props.onMouseEnter?.(e)
      }}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const { openOnHover, triggerRect } = React.useContext(DropdownMenuContext)
  const [contentRect, setContentRect] = React.useState<DOMRect | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (contentRef.current) {
      const updateRect = () => {
        if (contentRef.current) setContentRect(contentRef.current.getBoundingClientRect())
      }
      updateRect()
      const timer = setTimeout(updateRect, 50)
      return () => clearTimeout(timer)
    }
  }, []) // Run on mount (when Radix shows it)

  return (
    <DropdownMenuPrimitive.Portal>
      <>
        <DropdownMenuPrimitive.SubContent
          ref={contentRef}
          data-slot="dropdown-menu-sub-content"
          className={cn(
            "font-medium -mt-1 bg-black text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border border-neutral-800 p-1 shadow-lg",
            className
          )}
          sideOffset={10}
          {...props}
        />
        {openOnHover && triggerRect && contentRect && (
          <PointerBridge
            triggerRect={triggerRect}
            contentRect={contentRect}
            side={(props as any).side ?? "right"}
          />
        )}
      </>
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
