'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageAnimationProps {
  children: ReactNode
  className?: string
}

export default function PageAnimation({ children, className = '' }: PageAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

