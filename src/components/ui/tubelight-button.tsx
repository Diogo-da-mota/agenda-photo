"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TubelightButtonProps {
  children: React.ReactNode
  variant?: 'ghost' | 'primary'
  className?: string
  onClick?: () => void
}

export function TubelightButton({ 
  children, 
  variant = 'ghost',
  className,
  onClick 
}: TubelightButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.button
      className={cn(
        "relative cursor-pointer font-medium rounded-full transition-all duration-300",
        "whitespace-nowrap overflow-hidden text-ellipsis",
        "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: isHovered
            ? "radial-gradient(120px circle at var(--x) var(--y), rgb(59 130 246 / 0.15), transparent 100%)"
            : "none"
        }}
        style={{
          "--x": "50%",
          "--y": "50%"
        } as any}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          e.currentTarget.style.setProperty("--x", `${x}px`)
          e.currentTarget.style.setProperty("--y", `${y}px`)
        }}
      />
    </motion.button>
  )
} 