"use client"

import { useEffect, useId, useState } from "react"
import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: React.RefObject<HTMLElement | null>
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
  curvature?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  pathColor = "rgba(255, 248, 246, 0.1)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#E5283B",
  gradientStopColor = "#FF6B7A",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useId()
  const [pathD, setPathD] = useState("")

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const rectA = fromRef.current.getBoundingClientRect()
        const rectB = toRef.current.getBoundingClientRect()

        const svgX1 = rectA.left - containerRect.left + rectA.width / 2 + startXOffset
        const svgY1 = rectA.top - containerRect.top + rectA.height / 2 + startYOffset
        const svgX2 = rectB.left - containerRect.left + rectB.width / 2 + endXOffset
        const svgY2 = rectB.top - containerRect.top + rectB.height / 2 + endYOffset

        const midX = (svgX1 + svgX2) / 2
        const midY = (svgY1 + svgY2) / 2 + curvature

        setPathD(`M ${svgX1} ${svgY1} Q ${midX} ${midY} ${svgX2} ${svgY2}`)
      }
    }

    updatePath()
    const resizeObserver = new ResizeObserver(() => updatePath())
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  return (
    <svg
      fill="none"
      width="100%"
      height="100%"
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
