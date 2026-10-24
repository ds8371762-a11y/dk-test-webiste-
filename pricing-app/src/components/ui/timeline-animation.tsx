"use client"

import * as React from "react"
import { motion, useInView, type Variants } from "motion/react"

// The paste imports TimelineContent but did not include its source, so this is
// a compatible stand-in: it reveals each child when `timelineRef` scrolls into
// view, using the variant set for its `animationNum` as the stagger index.
type TimelineContentProps = {
  as?: keyof React.JSX.IntrinsicElements
  animationNum?: number
  timelineRef: React.RefObject<Element | null>
  customVariants: Variants
  className?: string
  children?: React.ReactNode
}

export function TimelineContent({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
}: TimelineContentProps) {
  const inView = useInView(timelineRef, { once: true, amount: 0.2 })
  const Component = motion.create(as as "div")

  return (
    <Component
      className={className}
      custom={animationNum}
      variants={customVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </Component>
  )
}
