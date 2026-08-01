"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: "start" | "end" | "center"
  className?: string
  encryptedClassName?: string
  characters?: string
}

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 10,
  sequential = true,
  className = "",
  encryptedClassName = "text-coral font-mono opacity-80",
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$&*",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isHovered, setIsHovered] = useState(false)

  const decrypt = useCallback(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (sequential) {
              if (index < iteration / (maxIterations / text.length)) {
                return text[index]
              }
            } else {
              if (iteration >= maxIterations) {
                return text[index]
              }
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join("")
      )

      iteration += 1
      if (iteration > maxIterations * (sequential ? 1.5 : 1)) {
        clearInterval(interval)
        setDisplayText(text)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [characters, maxIterations, sequential, speed, text])

  useEffect(() => {
    decrypt()
  }, [decrypt])

  return (
    <span
      className={cn("inline-block font-mono cursor-pointer select-none", className)}
      onMouseEnter={() => {
        setIsHovered(true)
        decrypt()
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText.split("").map((char, i) => {
        const isOriginal = char === text[i]
        return (
          <span
            key={i}
            className={cn(
              isOriginal ? className : encryptedClassName,
              isHovered && "transition-colors"
            )}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
