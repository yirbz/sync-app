"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface RotatingTextProps {
  words: string[]
  duration?: number
  className?: string
}

export function RotatingText({
  words,
  duration = 2600,
  className,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, duration)
    return () => clearInterval(timer)
  }, [duration, words.length])

  return (
    <span className={cn("inline-flex overflow-hidden vertical-align-bottom py-1", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-escarlata font-extrabold"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
