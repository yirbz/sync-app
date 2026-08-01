"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  staggerDuration?: number
}

export function SplitText({
  text,
  className,
  delay = 0,
  staggerDuration = 0.04,
}: SplitTextProps) {
  const words = text.split(" ")

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDuration,
            delayChildren: delay,
          },
        },
      }}
      className={cn("inline-block", className)}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, j) => (
            <motion.span
              key={j}
              variants={{
                hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
                visible: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  )
}
