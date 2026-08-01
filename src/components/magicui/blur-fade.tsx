"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  blur?: string
  yOffset?: number
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.45,
  blur = "8px",
  yOffset = 16,
}: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: `blur(${blur})`, y: yOffset }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
