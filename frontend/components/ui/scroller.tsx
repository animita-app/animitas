'use client'

import React, { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  gradientHeight?: string
}

export function Scroller({ children, className, gradientHeight = 'h-12', ...props }: ScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

    const hasTopGradient = scrollTop > 0
    const hasBottomGradient = Math.ceil(scrollTop + clientHeight) < scrollHeight - 1

    setShowTopGradient(hasTopGradient)
    setShowBottomGradient(hasBottomGradient)
  }

  useEffect(() => {
    checkScroll()

    const resizeObserver = new ResizeObserver(() => {
      checkScroll()
    })

    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current)
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    // Check periodically for a short time to handle animations (like Drawer slide-in)
    const interval = setInterval(checkScroll, 100)
    const timeout = setTimeout(() => clearInterval(interval), 2000)

    return () => {
      resizeObserver.disconnect()
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [children])

  return (
    <div className="relative h-full overflow-hidden flex flex-col flex-1 w-full min-h-0">
      {showTopGradient && (
        <div className={cn("absolute top-0 left-0 right-0 bg-gradient-to-b from-background to-transparent z-20 pointer-events-none transition-opacity duration-300", gradientHeight)} />
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn("flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']", className)}
        {...props}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>

      {showBottomGradient && (
        <div className={cn("absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none transition-opacity duration-300", gradientHeight)} />
      )}
    </div>
  )
}
