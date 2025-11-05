'use client'

import { motion } from 'framer-motion'

export default function ChromaBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[800px] h-[800px] rounded-full blur-3xl"
        animate={{
          background: [
            'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(236, 72, 153, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(251, 146, 60, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, rgba(34, 197, 94, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(139, 92, 246, 0.6) 50%, transparent 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ opacity: 0.6 }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[800px] h-[800px] rounded-full blur-3xl"
        animate={{
          background: [
            'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(34, 197, 94, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(139, 92, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, rgba(236, 72, 153, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(251, 146, 60, 0.6) 50%, transparent 100%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 2,
        }}
        style={{ opacity: 0.6 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[900px] h-[900px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
        animate={{
          background: [
            'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, rgba(34, 197, 94, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(251, 146, 60, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
            'radial-gradient(circle, rgba(34, 197, 94, 0.8) 0%, rgba(236, 72, 153, 0.6) 50%, transparent 100%)',
          ],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
          delay: 4,
        }}
        style={{ opacity: 0.5 }}
      />
      {/* Additional floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full blur-2xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, transparent 70%)',
          opacity: 0.4,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-2xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.7) 0%, transparent 70%)',
          opacity: 0.4,
        }}
      />
      {/* Background overlay for better contrast - reduced opacity */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-background/50" />
    </div>
  )
}

