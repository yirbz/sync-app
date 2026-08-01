"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ParticlesProps {
  className?: string
  quantity?: number
  color?: string
  refresh?: boolean
}

interface ParticleCircle {
  x: number
  y: number
  translateX: number
  translateY: number
  size: number
  alpha: number
  targetAlpha: number
  dx: number
  dy: number
  magnetism: number
}

export function Particles({
  className = "",
  quantity = 30,
  color = "#FF6B7A",
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const context = useRef<CanvasRenderingContext2D | null>(null)
  const circles = useRef<ParticleCircle[]>([])
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  const circleParams = useCallback((): ParticleCircle => {
    const x = Math.floor(Math.random() * canvasSize.current.w)
    const y = Math.floor(Math.random() * canvasSize.current.h)
    const translateX = 0
    const translateY = 0
    const size = Math.floor(Math.random() * 2) + 1.2
    const alpha = 0
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
    const dx = (Math.random() - 0.5) * 0.2
    const dy = (Math.random() - 0.5) * 0.2
    const magnetism = 0.1 + Math.random() * 4
    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    }
  }, [])

  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 255
    const g = parseInt(hex.slice(3, 5), 16) || 107
    const b = parseInt(hex.slice(5, 7), 16) || 122
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }, [])

  const drawCircle = useCallback((circle: ParticleCircle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle
      context.current.translate(translateX, translateY)
      context.current.beginPath()
      context.current.arc(x, y, size, 0, 2 * Math.PI)
      context.current.fillStyle = hexToRgba(color, alpha)
      context.current.fill()
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!update) {
        circles.current.push(circle)
      }
    }
  }, [color, dpr, hexToRgba])

  const drawParticles = useCallback(() => {
    circles.current = []
    for (let i = 0; i < quantity; i++) {
      circles.current.push(circleParams())
    }
  }, [circleParams, quantity])

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = []
      canvasSize.current.w = canvasContainerRef.current.offsetWidth
      canvasSize.current.h = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = canvasSize.current.w * dpr
      canvasRef.current.height = canvasSize.current.h * dpr
      canvasRef.current.style.width = `${canvasSize.current.w}px`
      canvasRef.current.style.height = `${canvasSize.current.h}px`
      context.current.scale(dpr, dpr)
    }
  }, [dpr])

  const initCanvas = useCallback(() => {
    resizeCanvas()
    drawParticles()
  }, [drawParticles, resizeCanvas])

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvas()

    let animationFrameId: number

    const animate = () => {
      if (context.current) {
        context.current.clearRect(
          0,
          0,
          canvasSize.current.w,
          canvasSize.current.h
        )
      }

      circles.current.forEach((circle: ParticleCircle) => {
        const edge = [
          circle.x + circle.translateX - circle.size < 0,
          circle.x + circle.translateX + circle.size > canvasSize.current.w,
          circle.y + circle.translateY - circle.size < 0,
          circle.y + circle.translateY + circle.size > canvasSize.current.h,
        ]

        if (edge[0] || edge[1]) circle.dx = -circle.dx
        if (edge[2] || edge[3]) circle.dy = -circle.dy

        circle.x += circle.dx
        circle.y += circle.dy

        if (circle.alpha < circle.targetAlpha) {
          circle.alpha += 0.01
        }

        drawCircle(circle, true)
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      initCanvas()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [color, drawCircle, initCanvas, refresh])

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
