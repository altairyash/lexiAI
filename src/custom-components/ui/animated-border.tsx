"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useRef, useState } from "react"

interface AnimatedBorderProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  duration?: number
  borderWidth?: number
  borderColor?: string
  background?: string
}

export function AnimatedBorder({
  children,
  className,
  containerClassName,
  borderColor = "from-black via-emerald-500 to-black",
  background = "bg-black",
}: AnimatedBorderProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative rounded-xl p-[1px] overflow-hidden", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500",
          `bg-gradient-to-r ${borderColor}`,
        )}
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      <div className={cn("absolute inset-0 rounded-xl", `bg-gradient-to-r ${borderColor}`)} />
      <div className={cn("relative rounded-[10px] h-full", background, className)}>{children}</div>
    </div>
  )
}

