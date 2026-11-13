'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'transition' | 'children'> {
  children?: ReactNode
  delay?: number
  y?: number
  once?: boolean
  margin?: string
}

export function Reveal({ children, delay = 0, y = 24, once = true, margin = '-8% 0px', className, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: margin as any })
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <div className={className} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const revealContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const revealItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

interface RevealGroupProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'variants' | 'children'> {
  children?: ReactNode
  once?: boolean
  margin?: string
}

export function RevealGroup({ children, once = true, margin = '-8% 0px', className, ...rest }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, margin: margin as any })
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={revealContainer}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className, ...rest }: Omit<HTMLMotionProps<'div'>, 'variants' | 'children'> & { children?: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div variants={revealItem} className={className} {...rest}>
      {children}
    </motion.div>
  )
}
