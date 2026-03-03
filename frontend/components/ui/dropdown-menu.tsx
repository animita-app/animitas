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
  mousePos: { x: number; y: number }
}>({
  open: false,
  openOnHover: false,
  setOpen: () => { },
  onMouseEnter: () => { },
  onMouseLeave: () => { },
  triggerRect: null,
  setTriggerRect: () => { },
  mousePos: { x: 0, y: 0 }
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
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 })
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
    if (!open || !openOnHover) return
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [open, openOnHover])

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
        mousePos
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
  const { open, openOnHover, onMouseEnter, onMouseLeave, triggerRect, mousePos } = React.useContext(DropdownMenuContext)
  const [contentRect, setContentRect] = React.useState<DOMRect | null>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    if (open && contentRef.current) {
      setContentRect(contentRef.current.getBoundingClientRect())
    } else {
      setContentRect(null)
    }
  }, [open])

  return (
    <DropdownMenuPrimitive.Portal>
      <>
        {open && openOnHover && triggerRect && contentRect && (
          <PointerBridge
            triggerRect={triggerRect}
            contentRect={contentRect}
            mousePos={mousePos}
            side={props.side ?? "bottom"}
          />
        )}
        <DropdownMenuPrimitive.Content
          ref={contentRef}
          data-slot="dropdown-menu-content"
          sideOffset={sideOffset}
          className={cn(
            "font-medium bg-black text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-20 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border border-neutral-800 p-1 shadow-md",
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
  mousePos: { x: number, y: number },
  side: string
}) {
  const { left: L, top: T, right: R, bottom: B } = triggerRect
  const { left: CL, top: CT, right: CR, bottom: CB } = contentRect

  let points = ""
  if (side === "top") {
    // Content is at top. Project from Trigger Bottom corners to Mouse.
    points = `${L},${T} ${R},${T} ${R},${B} ${mousePos.x},${mousePos.y} ${L},${B}`
  } else if (side === "right") {
    // Content is at right. Project from Trigger Left corners to Mouse.
    points = `${R},${T} ${R},${B} ${L},${B} ${mousePos.x},${mousePos.y} ${L},${T}`
  } else if (side === "left") {
    // Content is at left. Project from Trigger Right corners to Mouse.
    points = `${L},${T} ${L},${B} ${R},${B} ${mousePos.x},${mousePos.y} ${R},${T}`
  } else {
    // Default / Bottom: Content is below. Project from Trigger Top corners to Mouse.
    points = `${L},${B} ${R},${B} ${R},${T} ${mousePos.x},${mousePos.y} ${L},${T}`
  }

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'visible'
      }}
    >
      <polygon
        points={points}
        className="fill-red-500/50"
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
        "font-medium focus:bg-neutral-800 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
      className={cn("bg-neutral-700 -mx-1 my-1 h-px", className)}
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
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "[&_svg]:opacity-75 focus:bg-neutral-800 data-[state=open]:bg-neutral-800 [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
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
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "font-medium -mt-1 bg-black text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-20 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border border-neutral-800 p-1 shadow-lg",
        className
      )}
      sideOffset={10}
      {...props}
    />
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
