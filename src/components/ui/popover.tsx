"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Popover 컴포넌트 구현 (외부 의존성 없이)
const PopoverContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement>
  contentRef: React.RefObject<HTMLDivElement>
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  contentRef: { current: null },
})

export function Popover({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        triggerRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [contentRef, triggerRef])

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block" {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn("inline-flex items-center justify-center", className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

export function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  const { open, contentRef } = React.useContext(PopoverContext)

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "end" && "right-0",
        className
      )}
      style={{
        top: `calc(100% + ${sideOffset}px)`,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
